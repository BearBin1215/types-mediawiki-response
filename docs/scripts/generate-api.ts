// 生成文档站的 API 参考。JSDoc 按约定全英文，两棵语言树的 API 内容逐字节相同：
// TypeDoc 只 convert + render 一次到默认语言（en）的 en/api/，再整树复制到 zh/api/，
// 不为派生内容付双份解析成本。唯一例外是项目总览页 index.md——手写、双语（源在
// scripts/api-overview/，rspress 已排除该目录的路由），生成时按语言覆盖，见 applyOverview。
// 随后为每个产物目录合成 rspress 的 _meta.json
// （落地页置顶，其余按名排序），并做命名后处理（见 postProcessApi）。
// 生成物 en/api/ 与 zh/api/ 均已 gitignore。
// 加 --force 可绕过 mtime 跳过逻辑，强制重新解析。
// 以 `node scripts/generate-api.ts` 直跑，依赖 Node 原生 TS 类型剥离
// （≥ 22.18 / 24；部署 workflow 固定 node 24）。
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  cpSync,
  existsSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import type { TypeDocOptions } from "typedoc";

const docsRoot: string = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot: string = path.join(docsRoot, "..");

// 扩展 opt-in 包不进默认 barrel，须逐个单列为 typedoc 入口
const extEntries: string[] = readdirSync(path.join(repoRoot, "src", "extensions"))
  .filter((f) => f.endsWith(".ts"))
  .sort()
  .map((f) => path.join(repoRoot, "src", "extensions", f));

/** 默认语言树（生成源），其余语言从这里复制 */
const PRIMARY_LOCALE = "en";
const COPY_LOCALES = ["zh"] as const;
const FORCE: boolean = process.argv.includes("--force");

// typedoc 的 glob 入口不接受 Windows 反斜杠，一律转 posix 分隔符
const toPosix = (p: string): string => p.replace(/\\/g, "/");

/** src/ 下全部 .ts 的最新 mtime + typedoc 专属 tsconfig + 本脚本，作为 API 参考的输入指纹
 * （脚本自身改动必须失效缓存，否则逻辑更新后 docs:dev 仍会沿用旧产物） */
function newestSourceMtime(): number {
  let newest: number = Math.max(
    statSync(path.join(docsRoot, "tsconfig.typedoc.json")).mtimeMs,
    statSync(fileURLToPath(import.meta.url)).mtimeMs,
  );
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".ts")) {
        newest = Math.max(newest, statSync(full).mtimeMs);
      }
    }
  };
  walk(path.join(repoRoot, "src"));
  // 手写的 API 总览页同样是这份产物的输入：只改总览不改 src 时也要失效缓存
  for (const locale of [PRIMARY_LOCALE, ...COPY_LOCALES]) {
    newest = Math.max(
      newest,
      statSync(path.join(docsRoot, "scripts", "api-overview", `${locale}.md`)).mtimeMs,
    );
  }
  return newest;
}

function apiUpToDate(): boolean {
  const marker = path.join(docsRoot, PRIMARY_LOCALE, "api", "index.md");
  if (!existsSync(marker)) return false;
  for (const locale of [PRIMARY_LOCALE, ...COPY_LOCALES]) {
    if (!existsSync(path.join(docsRoot, locale, "api"))) return false;
  }
  return statSync(marker).mtimeMs > newestSourceMtime();
}

/** 项目总览页（index.md）手写、双语：源在 scripts/api-overview/ 按语言各一份，
 * 页面里的相对链接对两棵树通用（产物内链接不随语言变化），typedoc 树成型后
 * 按语言覆盖写入；其余页面仍全部来自 typedoc。 */
function applyOverview(apiDir: string, locale: string): void {
  writeFileSync(
    path.join(apiDir, "index.md"),
    readFileSync(path.join(docsRoot, "scripts", "api-overview", `${locale}.md`), "utf8"),
  );
}

async function generateApi(): Promise<void> {
  const { Application } = await import("typedoc");
  const apiDir = path.join(docsRoot, PRIMARY_LOCALE, "api");
  // 先清空输出目录：typedoc 只清自己命名的产物，上一轮改名出来的 core/、
  // overview.md 会残留在树里，Windows 上 rename 目标已存在即 EPERM
  rmSync(apiDir, { recursive: true, force: true });
  // TypeDocOptions 是 type alias、无法声明合并；entryFileName 由
  // typedoc-plugin-markdown 运行时注册，静态类型上不存在。用索引签名交集
  // 放行插件选项，其余选项仍受字面量类型检查。
  const options: TypeDocOptions & Record<string, unknown> = {
    // 核心入口（src/index.ts barrel）+ 各扩展包；typedoc 用自身携带的 TS 解析，
    // 与根 package.json 的 typescript 版本无关
    entryPoints: [toPosix(path.join(repoRoot, "src", "index.ts")), ...extEntries.map(toPosix)],
    tsconfig: toPosix(path.join(docsRoot, "tsconfig.typedoc.json")),
    name: "types-mediawiki-response",
    includeVersion: true,
    readme: "none",
    githubPages: false,
    hideGenerator: true,
    plugin: ["typedoc-plugin-markdown"],
    // 项目文档必须叫 index.md：rspress 才会把 <locale>/api/index.md 当目录首页，
    // 站内指向 /api/ 的链接（导航与指南）才不会在死链检查里断掉。
    // 模块落地页同样会叫 index.md，由 postProcessApi 改名 overview.md
    entryFileName: "index",
    // 模块落地页的成员列表用表格并带一列首段描述：纯名字列表对找类型的人
    // 没帮助，描述取自 JSDoc。项目总览页（index.md）随后被手写源覆盖，见 applyOverview
    indexFormat: "table",
    // 页首的项目名/版本回链与面包屑是逐页重复的机械内容（面包屑里模块名还是
    // 原始的 index、extensions/x），站内导航交给侧边栏，这里一并关掉
    hidePageHeader: true,
    hideBreadcrumbs: true,
    out: toPosix(path.join(docsRoot, PRIMARY_LOCALE, "api")),
  };
  const app = await Application.bootstrapWithPlugins(options);
  const project = await app.convert();
  if (!project) {
    throw new Error("[api-docs] typedoc convert failed");
  }
  await app.generateOutputs(project);
  postProcessApi(apiDir);
  writeApiMeta(apiDir);
  applyOverview(apiDir, PRIMARY_LOCALE);
  for (const locale of COPY_LOCALES) {
    const target = path.join(docsRoot, locale, "api");
    rmSync(target, { recursive: true, force: true });
    cpSync(path.join(docsRoot, PRIMARY_LOCALE, "api"), target, { recursive: true });
    writeApiMeta(target, target, locale);
    applyOverview(target, locale);
  }
}

/** typedoc 按 kind 分出的子目录名。对纯类型包没有检索价值（没人按“这是 interface
 * 还是 type alias”找类型），却让扩展小包多套一层目录、侧边栏多一级折叠，一律上提。 */
const KIND_DIRS: RegExp = /^(interfaces|type-aliases)$/;

/** 上提前先把链接改成上提后的相对路径：按当前位置解析成绝对路径、去掉其中的 kind 段，
 * 再相对“上提后的所在目录”重新取值。直接删字符串里的 kind 段会算错跨级链接 —— 例如
 * `../interfaces/X.md` 上提后应变成 `X.md`，而不是 `../X.md`。 */
function rewriteKindLinks(dir: string): void {
  const stripKind = (p: string): string =>
    p
      .split(path.sep)
      .filter((s) => !KIND_DIRS.test(s))
      .join(path.sep);
  const walk = (d: string): void => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith(".md")) continue;
      const md = readFileSync(full, "utf8");
      const newDir = stripKind(d);
      const rewritten = md.replace(/\]\(([^)\s]+)\)/g, (_, target: string) => {
        if (/^[a-z][a-z\d+.-]*:/i.test(target) || target.startsWith("#")) return `](${target})`;
        const [ref, anchor] = target.split("#");
        const abs = stripKind(path.resolve(d, ref));
        const rel = path.relative(newDir, abs).split(path.sep).join("/");
        return anchor === undefined ? `](${rel})` : `](${rel}#${anchor})`;
      });
      if (rewritten !== md) writeFileSync(full, rewritten);
    }
  };
  walk(dir);
}

/** 把 kind 目录下的 md 上提到所属模块目录并删掉空目录。kind 信息并未丢失：页面 H1
 * 仍是 `Interface: X` / `Type alias: X`。已核对各模块内两类条目无同名，上提不撞名。 */
function flattenKindDirs(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (KIND_DIRS.test(entry.name)) {
      for (const f of readdirSync(full)) {
        if (f.endsWith(".md")) renameWithRetry(path.join(full, f), path.join(dir, f));
      }
      rmSync(full, { recursive: true, force: true });
      continue;
    }
    flattenKindDirs(full);
  }
}

/** rspress 侧边栏的 _meta.json 条目：文件可带 label 覆盖页面标题 */
interface MetaEntry {
  type: "file" | "dir";
  name: string;
  label?: string;
  /** 默认折叠（仅 dir 条目有效；rspress 会自动展开当前页所在的分组） */
  collapsed?: boolean;
}

/** 一个目录下的 md 数超过这个值就在侧边栏默认折叠：核心 200+ 项全展开会把
 * 其余分组挤到看不见的地方，而折叠只影响“路过”的组 —— 当前页所在分组
 * rspress 会自动展开。扩展包目录不适用此阈值，一律折叠（见 writeApiMeta）。 */
const COLLAPSE_THRESHOLD = 30;

/** Windows 上刚写入的目录可能被索引/杀软短暂持锁，rename 偶发 EPERM，稍候重试
 * （Atomics.wait 是同步代码里唯一靠谱的睡眠手段） */
function renameWithRetry(from: string, to: string, attempts = 5): void {
  for (let i = 0; ; i++) {
    try {
      renameSync(from, to);
      return;
    } catch (e) {
      if (i >= attempts - 1 || (e as NodeJS.ErrnoException).code !== "EPERM") throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
    }
  }
}

/** typedoc 的产物命名与 rspress 的侧边栏约定有两处冲突，生成后统一后处理：
 * 1. 入口模块目录固定叫 index/，与项目文档 index.md 同名——rspress 的 dir 条目会
 *    优先拿旁边的同名 .md 当组链接，Core 组与顶层 Overview 便同指 /api/，双高亮；
 *    整目录改名 core/，产物内指向它的 index/ 路径段一并重写。
 * 2. 模块落地页叫 index.md 时 rspress 会把它当成组头链接，组头既是折叠开关又是
 *    页面；改名 overview.md（API 根的项目页除外）后组头退化为纯折叠开关，落地页
 *    由 _meta.json 单列为 Overview 子项。链接按解析后的真实路径重写：目标目录里
 *    已改出 overview.md 的 index.md 一律改写，指向项目页的 ../index.md 不受影响
 *    （API 根没有 overview.md）。 */
function postProcessApi(apiDir: string): void {
  renameWithRetry(path.join(apiDir, "index"), path.join(apiDir, "core"));
  const renameLandings = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const sub = path.join(dir, entry.name);
      const landing = path.join(sub, "index.md");
      if (existsSync(landing)) renameWithRetry(landing, path.join(sub, "overview.md"));
      renameLandings(sub);
    }
  };
  renameLandings(apiDir);
  rewriteKindLinks(apiDir);
  flattenKindDirs(apiDir);
  const rewriteTarget = (fromDir: string, target: string): string => {
    // 外链/锚点原样保留；index/ 路径段只出现在指向模块目录的链接里，
    // 以 .md 结尾的页面链接交给下面的解析规则
    if (/^[a-z][a-z\d+.-]*:/i.test(target) || target.startsWith("#")) return target;
    const [ref, anchor] = target.split("#");
    let rewritten = ref.replace(/(^|\/)index\//g, "$1core/");
    if (/(^|\/)index\.md$/.test(rewritten)) {
      const resolved = path.resolve(fromDir, rewritten);
      if (existsSync(path.join(path.dirname(resolved), "overview.md"))) {
        rewritten = rewritten.replace(/(^|\/)index\.md$/, "$1overview.md");
      }
    }
    return anchor === undefined ? rewritten : `${rewritten}#${anchor}`;
  };
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith(".md")) continue;
      const md = readFileSync(full, "utf8");
      const rewritten = md.replace(
        /\]\(([^)\s]+)\)/g,
        (_, target: string) => `](${rewriteTarget(dir, target)})`,
      );
      if (rewritten !== md) writeFileSync(full, rewritten);
    }
  };
  walk(apiDir);
  polishOverviews(apiDir);
}

/** Core 落地页描述：核心没有单一入口文件可提取，这里单独给一句
 * （措辞对齐手写总览页 scripts/api-overview/en.md 的 Core 小节） */
const CORE_OVERVIEW_DESCRIPTION =
  "Everything MediaWiki core can return: the response envelope, shared atoms, one response type per `action=`, and the `action=query` framework.";

/** 模块落地页（overview.md）补齐 H1 与 frontmatter description。typedoc 给的 H1
 * 是机械的 index / extensions/<pack>，frontmatter 无 description，而 llms.txt 的
 * 条目标题取页面 H1、描述取 frontmatter description（无则退化为正文摘录）——
 * 扩展包条目因此缺标题语义、缺描述。事实来源：核心为上方常量；扩展包取各自
 * 模块 JSDoc（src/extensions/<pack>.ts）的首段（显示名与描述同源，一处维护）。 */
function polishOverviews(apiDir: string): void {
  const apply = (file: string, display: string, description: string): void => {
    const md = readFileSync(file, "utf8");
    const rewritten = md.replace(/^# .*$/m, `# ${display}`);
    writeFileSync(file, `---\ndescription: ${JSON.stringify(description)}\n---\n\n${rewritten}`);
  };
  const coreLanding = path.join(apiDir, "core", "overview.md");
  if (existsSync(coreLanding)) apply(coreLanding, "Core", CORE_OVERVIEW_DESCRIPTION);
  const extRoot = path.join(repoRoot, "src", "extensions");
  for (const entry of readdirSync(path.join(apiDir, "extensions"), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const landing = path.join(apiDir, "extensions", entry.name, "overview.md");
    if (!existsSync(landing)) continue;
    const { display, description } = packDoc(path.join(extRoot, `${entry.name}.ts`));
    if (!display || !description) {
      throw new Error(
        `[api-docs] extensions/${entry.name}.ts: module doc lacks a bold display name or a first sentence`,
      );
    }
    apply(landing, display, description);
  }
}

/** 读模块 JSDoc 首段：显示名取首个 **加粗** 片段，描述取首句（遮蔽行内代码后
 * 找句号，避免 `x.y` 之类误断） */
function packDoc(file: string): { display: string; description: string } {
  const doc = readFileSync(file, "utf8").match(/^\/\*\*([\s\S]*?)\*\//)?.[1] ?? "";
  const lines: string[] = [];
  for (const raw of doc.split("\n")) {
    const line = raw.replace(/^\s*\*\s?/, "").trim();
    if (line === "") {
      if (lines.length > 0) break;
      continue;
    }
    lines.push(line);
  }
  const text = lines.join(" ");
  const masked = text.replace(/`[^`]*`/g, (m) => " ".repeat(m.length));
  const end = masked.search(/[.!?](\s|$)/);
  return {
    display: text.match(/\*\*([^*]+)\*\*/)?.[1] ?? "",
    description: end === -1 ? text : text.slice(0, end + 1),
  };
}

/** rspress 侧边栏按 _meta.json 生成：逐目录补一份，只收含 .md 的子目录。
 * 标签键是 `label`（不是 text）；文件条目省略 label 时回退到页面标题。
 * 落地页条目置顶：API 根是项目总览 index（/api/），模块目录是 overview
 * （见 postProcessApi）。模块目录里没有 index.md，rspress 就不会把组头变成
 * 链接，Core 与各扩展包的组头只作折叠开关，落地页以 Overview 子项单列。
 * en 树生成时调用一次；其余语言在整树复制后按各自 locale 重调（标签本地化）。 */
function writeApiMeta(dir: string, apiRoot: string = dir, locale: string = PRIMARY_LOCALE): void {
  const entries = readdirSync(dir, { withFileTypes: true });
  const dirs: string[] = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const files: string[] = entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => e.name.replace(/\.md$/, ""));
  for (const d of dirs) {
    writeApiMeta(path.join(dir, d), apiRoot, locale);
  }
  const landing = dir === apiRoot ? "index" : "overview";
  // 扩展包目录一律默认折叠：22 个包全展开会把侧边栏拉到几百行，没法定位；
  // rspress 会自动展开当前页所在的分组，浏览符号页不受影响
  const isPackGroup = dir === path.join(apiRoot, "extensions");
  const meta: (MetaEntry | string)[] = [
    ...(files.includes(landing)
      ? ([
          { type: "file", name: landing, label: LANDING_LABELS[locale] ?? "Overview" },
        ] satisfies MetaEntry[])
      : []),
    ...dirs
      .filter((d) => hasMarkdown(path.join(dir, d)))
      .sort()
      .map((name): MetaEntry => ({
        type: "dir",
        name,
        label: LABELS[locale]?.[name] ?? name,
        ...(isPackGroup || countMarkdown(path.join(dir, name)) > COLLAPSE_THRESHOLD
          ? { collapsed: true }
          : {}),
      })),
    // 文件条目一律用裸文件名当侧边栏标签：不带 label 时 rspress 回退到页面标题
    // （"Interface: ApiX"），kind 前缀在分组头下纯属重复，还会挤爆侧边栏；
    // 只影响侧边栏文本，页面 H1 不变
    ...files
      .filter((f) => f !== landing)
      .sort()
      .map((name): MetaEntry => ({ type: "file", name, label: name })),
  ];
  writeFileSync(path.join(dir, "_meta.json"), `${JSON.stringify(meta, null, 2)}\n`);
}

/** 目录直属的 md 数（不含子目录），用于判断是否默认折叠 */
function countMarkdown(dir: string): number {
  return readdirSync(dir, { withFileTypes: true }).filter(
    (e) => e.isFile() && e.name.endsWith(".md"),
  ).length;
}

function hasMarkdown(dir: string): boolean {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".md")) return true;
    if (entry.isDirectory() && hasMarkdown(path.join(dir, entry.name))) return true;
  }
  return false;
}

// typedoc 的入口/分组目录名较机械，侧边栏换成人话标签，按语言取值；其余 kind
// 目录首字母大写（入口模块目录已改名 core，见 postProcessApi）。类型名/包名是
// 专有名词，不进这张表
const LABELS: Record<string, Readonly<Record<string, string>>> = {
  en: {
    core: "Core",
    extensions: "Extensions (opt-in)",
    interfaces: "Interfaces",
    "type-aliases": "Type Aliases",
    enumerations: "Enumerations",
    classes: "Classes",
    functions: "Functions",
    variables: "Variables",
  },
  zh: {
    core: "核心",
    extensions: "扩展包（按需启用）",
    interfaces: "Interfaces",
    "type-aliases": "Type Aliases",
    enumerations: "Enumerations",
    classes: "Classes",
    functions: "Functions",
    variables: "Variables",
  },
};

/** 落地页条目（API 根 index / 模块 overview）的侧边栏标签 */
const LANDING_LABELS: Record<string, string> = {
  en: "Overview",
  zh: "总览",
};

if (FORCE || !apiUpToDate()) {
  await generateApi();
  console.log("[api-docs] generated API reference");
} else {
  console.log("[api-docs] API reference up to date, skipping typedoc (--force to regenerate)");
}
