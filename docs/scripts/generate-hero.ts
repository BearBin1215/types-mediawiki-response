// 生成首页 hero 演示（docs/theme/components/HeroDemo.tsx）的静态高亮 HTML。
// 卡片内容不是手写的：对每段展示代码跑真实 TypeScript 编译器（VS Code 用的
// 是同一 API），hover 演示取锚点属性的 quickinfo（签名 + JSDoc），error 演示取
// 锚点上的编译诊断（报错文本 + 错误码）——展示内容随类型演进自动更新，杜绝漂移。
// 代码高亮用 shiki 的 css-variables 主题（与 rspress 内建代码块同一 --shiki-*
// 变量族），亮暗两态由站点 CSS 接管，组件自身零配色。锚点由 decorations 按源码
// 偏移量在 HAST 上注入：目标 token 被单独包一层 .hero-anchor，桌面卡片挂进锚点
// 内跟随 token 排版；hover 演示产物另含一份窄屏显示的停靠卡副本，error 演示另
// 产出一份 tsc --pretty 排版的终端 HTML（组件里停靠为编辑器底部面板）。产物
// 入库（可 review 类型变更带来的卡片变化）；CI 在 docs 构建后用 git diff 校验
// 其未过期。
// 以 `node scripts/generate-hero.ts` 直跑，依赖 Node 原生 TS 类型剥离
// （≥ 22.18 / 24；部署 workflow 固定 node 24）。
import path from "node:path";
import { writeFileSync } from "node:fs";
import { toHtml } from "hast-util-to-html";
import { createHighlighter, createCssVariablesTheme } from "shiki";
import ts from "typescript";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT_FILE = path.join(ROOT, "docs/theme/components/hero-demo.generated.ts");

// api 只在编译时存在（消费者侧它通常是 mw.Api 的封装），不进展示代码
const PREAMBLE =
  "declare const api: { get: (params: Record<string, unknown>) => Promise<unknown> };\n";

// 演示清单。锚点 = 所在行全文 + 行内 token，行与 token 双重唯一，失配即构建
// 失败，不允许静默错位。两段展示代码刻意不同构：hover 演示取 siteinfo 字段的
// quickinfo，error 演示取 list=search 结果里一个漏写字母的字段名（snipet →
// snippet）触发的真实编译诊断。
type Demo = {
  id: string;
  snippet: string;
  anchorLine: string;
  anchorToken: string;
};

const DEMOS: Demo[] = [
  {
    id: "hover",
    snippet: [
      'import type { ApiQueryResponse } from "types-mediawiki-response";',
      "",
      "const res = (await api.get({",
      '  action: "query",',
      '  meta: "siteinfo",',
      '  siprop: "general",',
      '  formatversion: "2",',
      "})) as ApiQueryResponse;",
      "",
      "const general = res.query.general;",
      'if (!general) throw new Error("missing query.general");',
      "",
      "console.log(`${general.sitename}: ${general.generator}`);",
    ].join("\n"),
    anchorLine: "console.log(`${general.sitename}: ${general.generator}`);",
    anchorToken: "generator",
  },
  {
    id: "error",
    snippet: [
      'import type { ApiQueryResponse } from "types-mediawiki-response";',
      "",
      "const res = (await api.get({",
      '  action: "query",',
      '  list: "search",',
      '  srsearch: "insource:formatversion",',
      '  formatversion: "2",',
      "})) as ApiQueryResponse;",
      "",
      "const [hit] = res.query.search ?? [];",
      "",
      "console.log(`${hit.title}: ${hit.snipet}`);",
    ].join("\n"),
    anchorLine: "console.log(`${hit.title}: ${hit.snipet}`);",
    anchorToken: "snipet",
  },
];

// —— 真实编译器：与 VS Code 悬浮 / 报错同一 API ——

const settings: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  skipLibCheck: true,
};

const PKG_ENTRY = path.join(ROOT, "src/index.ts");
// 默认 lib 以裸文件名（lib.xxx.d.ts）参与编译，按 typescript 包内目录解析
const LIB_DIR = path.dirname(ts.getDefaultLibFilePath(settings));

// 虚拟消费文件 + 覆盖裸包名解析的编译宿主。resolveModuleNames 钩子一旦提供
// 就必须解析所有名字（相对导入也要逐个走 resolveModuleName），返回
// undefined = 解析失败
function createLanguageService(file: string, source: string) {
  const host: ts.LanguageServiceHost = {
    getScriptFileNames: () => [file, PKG_ENTRY],
    getScriptVersion: () => "0",
    getScriptSnapshot: (name) => {
      let text: string | undefined;
      if (name === file) text = source;
      else if (path.isAbsolute(name) && ts.sys.fileExists(name)) text = ts.sys.readFile(name);
      else if (ts.sys.fileExists(path.join(LIB_DIR, name)))
        text = ts.sys.readFile(path.join(LIB_DIR, name));
      return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
    },
    getCurrentDirectory: () => ROOT,
    getCompilationSettings: () => settings,
    getDefaultLibFileName: (o) => ts.getDefaultLibFileName(o),
    readDirectory: (p, ext, excl, incl, depth) => ts.sys.readDirectory(p, ext, excl, incl, depth),
    fileExists: (name) => name === file || ts.sys.fileExists(name),
    readFile: (name) => (name === file ? source : ts.sys.readFile(name)),
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
    getNewLine: () => "\n",
    resolveModuleNames: (moduleNames, containingFile) =>
      moduleNames.map((name) => {
        const resolved = ts.resolveModuleName(
          name,
          containingFile,
          { ...settings, baseUrl: ROOT, paths: { "types-mediawiki-response": ["src/index.ts"] } },
          { fileExists: ts.sys.fileExists, readFile: ts.sys.readFile },
        );
        return resolved.resolvedModule
          ? { resolvedFileName: resolved.resolvedModule.resolvedFileName }
          : undefined;
      }),
  };
  return ts.createLanguageService(host, ts.createDocumentRegistry());
}

// —— HAST 节点构造 ——

type HastNode = {
  type: "element" | "text" | "root";
  tagName?: string;
  properties?: Record<string, string>;
  children?: HastNode[];
  value?: string;
};

const el = (
  tagName: string,
  properties: Record<string, string>,
  children: HastNode[],
): HastNode => ({
  type: "element",
  tagName,
  properties,
  children,
});
const text = (value: string): HastNode => ({ type: "text", value });

// 签名行：displayParts 按语义 kind 一一着色（类名/属性/关键字等走 --shiki-* 变量）
function signatureNodes(displayParts: ts.SymbolDisplayPart[]): HastNode[] {
  return displayParts.map((p) => {
    const cls = `hs-${p.kind.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}`;
    return el("span", { class: cls }, [text(p.text)]);
  });
}

// 文档体：JSDoc 里的 `代码` 片段转 <code>，{@link X} 渲染为 X；
// 源注释的手工换行在展示时折叠为空格，交给 CSS 自适应换行
function docNodes(parts: ts.SymbolDisplayPart[]): HastNode[] {
  const nodes: HastNode[] = [];
  for (const part of parts) {
    if (part.kind === "link" || part.kind === "linkName") {
      if (part.kind === "linkName")
        nodes.push(el("span", { class: "hs-doc-link" }, [text(part.text)]));
      continue;
    }
    const segments = part.text.split(/`([^`]*)`/g);
    for (let i = 0; i < segments.length; i += 1) {
      if (i % 2 === 1) nodes.push(el("code", {}, [text(segments[i])]));
      else if (segments[i]) nodes.push(text(segments[i].replace(/\n/g, " ")));
    }
  }
  return nodes;
}

// 报错卡内容：红叉图标 + 报错文本；"Did you mean" 建议里的字段名按 VS Code
// 的样式渲染成链接色代码（不带 inline-code 底板），错误码落在卡片右下角
function errorNodes(code: number, message: string): HastNode[] {
  const marker = " Did you mean ";
  const split = message.indexOf(marker);
  const messageNodes: HastNode[] = [];
  if (split < 0) {
    messageNodes.push(text(message));
  } else {
    const suggestion = message.slice(split + marker.length);
    messageNodes.push(text(message.slice(0, split + 1)));
    messageNodes.push(
      el("span", { class: "hero-err-suggest" }, [
        text("Did you mean "),
        el("code", {}, [text(suggestion.replaceAll("'", "").replace(/\?$/, ""))]),
        text("?"),
      ]),
    );
  }
  return [
    el("span", { class: "hero-err-row" }, [
      el("span", { class: "hero-err-icon", "aria-hidden": "true" }, [
        el("svg", { viewBox: "0 0 16 16", width: "16", height: "16" }, [
          el("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }, []),
          el(
            "path",
            {
              d: "M5.2 5.2l5.6 5.6M10.8 5.2l-5.6 5.6",
              stroke: "#fff",
              "stroke-width": "1.6",
              "stroke-linecap": "round",
            },
            [],
          ),
        ]),
      ]),
      el("span", { class: "hero-err-text" }, messageNodes),
    ]),
    el("span", { class: "hero-err-src" }, [text(`ts(${code})`)]),
  ];
}

// —— shiki 高亮 + 锚点注入 ——

const theme = createCssVariablesTheme({
  name: "css-variables",
  variablePrefix: "--shiki-",
  variableDefaults: {},
  fontStyle: true,
});

async function highlightHtml(demo: Demo): Promise<{ html: string; term?: string }> {
  const file = `hero-demo-${demo.id}.ts`;
  const source = PREAMBLE + demo.snippet;
  const ls = createLanguageService(file, source);
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);

  const lines = source.split("\n");
  const lineIndex = lines.indexOf(demo.anchorLine);
  if (lineIndex < 0) throw new Error(`[${demo.id}] anchor line not found in snippet`);
  const character = lines[lineIndex].lastIndexOf(demo.anchorToken);
  if (character < 0) throw new Error(`[${demo.id}] anchor token not found on anchor line`);
  const pos = sf.getPositionOfLineAndCharacter(lineIndex, character);

  let cardChildren: HastNode[];
  let cardClass: string;
  let anchorClass: string;
  let term: string | undefined;
  if (demo.id === "hover") {
    // 展示代码必须是能通过类型检查的真实代码，snippet 与类型失配时在这里失败
    const diagnostics = ls
      .getSemanticDiagnostics(file)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
    if (diagnostics.length)
      throw new Error(`[${demo.id}] snippet has semantic errors:\n${diagnostics.join("\n")}`);
    const qi = ls.getQuickInfoAtPosition(file, pos);
    if (!qi || !qi.displayParts?.length)
      throw new Error(`[${demo.id}] no quickinfo at anchor; snippet or types drifted`);
    cardChildren = [
      el("span", { class: "hero-hover-sig" }, signatureNodes(qi.displayParts)),
      el("span", { class: "hero-hover-doc" }, docNodes(qi.documentation ?? [])),
    ];
    cardClass = "hero-hover";
    anchorClass = "hero-anchor";
  } else {
    // 报错演示：取覆盖锚点的真实编译诊断，片段里有且仅有它
    const diag = ls
      .getSemanticDiagnostics(file)
      .find((d) => (d.start ?? 0) <= pos && pos < (d.start ?? 0) + (d.length ?? 0));
    if (!diag) throw new Error(`[${demo.id}] no diagnostic covering the anchor`);
    const message = ts.flattenDiagnosticMessageText(diag.messageText, " ");
    cardChildren = errorNodes(diag.code, message);
    cardClass = "hero-hover hero-hover--error";
    anchorClass = "hero-anchor hero-anchor--error";
    // 终端输出：tsc --pretty 的排版，位置与插入符取自同一条诊断。
    // 展示文件名与编辑器 chrome 一致（api.ts）；PREAMBLE 占一行，snippet 的
    // 1-based 行号恰为 SOURCE 的 0-based 行号
    const lineNo = lineIndex;
    const column = character + 1;
    const gutter = " ".repeat(String(lineNo).length + 1);
    term = toHtml(
      el("span", { class: "hero-term" }, [
        el("span", { class: "hero-term-line" }, [
          el("span", { class: "hero-term-prompt" }, [text("$ ")]),
          el("span", { class: "hero-term-cmd" }, [text("tsc --noEmit")]),
        ]),
        el("span", { class: "hero-term-line" }, [
          el("span", { class: "hero-term-loc" }, [text(`api.ts:${lineNo}:${column}`)]),
          text(" - "),
          el("span", { class: "hero-term-error" }, [text(`error TS${diag.code}: `)]),
          text(message),
        ]),
        el("span", { class: "hero-term-line hero-term-code" }, [
          text(`${lineNo} ${demo.anchorLine}`),
        ]),
        el("span", { class: "hero-term-line hero-term-caret" }, [
          text(
            `${gutter}${" ".repeat(character)}${"~".repeat(diag.length ?? demo.anchorToken.length)}`,
          ),
        ]),
        el("span", { class: "hero-term-line hero-term-summary" }, [
          text(`Found 1 error in api.ts:${lineNo}`),
        ]),
      ]) as unknown as Parameters<typeof toHtml>[0],
    );
  }

  // 锚点用 decorations 按源码偏移量包裹：shiki 会把目标 token 从相邻的合并
  // span 中切出来并单独包一层 .hero-anchor。卡片要作为锚点的子节点注入后再
  // 序列化，codeToHtml 给不了这个介入点，所以走 codeToHast 自行注入。
  const anchorStart =
    demo.snippet.indexOf(demo.anchorLine) + demo.anchorLine.lastIndexOf(demo.anchorToken);
  const highlighter = await createHighlighter({ themes: [theme], langs: ["ts"] });
  // codeToHast 返回 hast Root，这里用宽松的本地类型承载
  const hast = highlighter.codeToHast(demo.snippet, {
    lang: "ts",
    theme,
    decorations: [
      {
        start: anchorStart,
        end: anchorStart + demo.anchorToken.length,
        alwaysWrap: true,
        properties: { class: anchorClass },
      },
    ],
  });
  const findClass = (node: HastNode, cls: string): HastNode | undefined => {
    if (node.type !== "element" && node.type !== "root") return undefined;
    const clsValue = node.properties?.class;
    const classes = Array.isArray(clsValue) ? clsValue : clsValue ? [clsValue] : [];
    if (classes.includes(cls)) return node;
    for (const child of node.children ?? []) {
      const hit = findClass(child, cls);
      if (hit) return hit;
    }
    return undefined;
  };
  const anchor = findClass(hast as unknown as HastNode, "hero-anchor");
  if (!anchor) throw new Error(`[${demo.id}] hero-anchor span missing after decoration`);
  // 桌面卡片挂进锚点跟随 token；hover 演示另出一份窄屏停靠卡副本，
  // 报错演示的完整信息由停靠在编辑器底部的终端承载，故不另出停靠卡
  const card = (className: string) => el("span", { class: className }, cardChildren);
  anchor.children!.push(card(cardClass));
  if (demo.id === "hover") (hast as unknown as HastNode).children!.push(card("hero-hover-docked"));
  const html = toHtml(hast);

  if (!html.includes("hero-anchor"))
    throw new Error(`[${demo.id}] anchor missing from generated HTML`);
  if (demo.id === "hover" && !html.includes("hero-hover-docked"))
    throw new Error(`[${demo.id}] docked card missing from generated HTML`);
  return { html, term };
}

// —— 产物 ——

// 字符串字面量的引号按转义数择优、`=` 后换行缩进，与 oxfmt 对本产物的
// 规范化结果保持一致；否则每次重新生成都会与 format:check 互相打架
function serializeModule(outputs: Array<{ id: string; html: string; term?: string }>): string {
  const literal = (html: string) => {
    const escape = (quote: string) =>
      html
        .replaceAll("\\", "\\\\")
        .replaceAll(quote, `\\${quote}`)
        .replaceAll("\n", "\\n")
        .replaceAll("\r", "\\r");
    const single = escape("'");
    const double = escape('"');
    return single.length <= double.length ? `'${single}'` : `"${double}"`;
  };
  const consts = outputs
    .flatMap(({ id, html, term }) => {
      const parts = [[`HERO_${id.toUpperCase()}_HTML`, html] as const];
      if (term) parts.push([`HERO_${id.toUpperCase()}_TERM_HTML`, term] as const);
      return parts.map(([name, value]) => `export const ${name} =\n  ${literal(value)};\n`);
    })
    .join("\n");
  return `// 由 docs/scripts/generate-hero.ts 生成：hero 演示的静态高亮 HTML（内嵌卡片）\n\
// 与 error 演示的终端输出。\n\
// 卡片内容取自包类型的真实 quickinfo / 编译诊断，类型演进后重新生成即可，勿手改。\n\
\n${consts}`;
}

const outputs = await Promise.all(
  DEMOS.map(async (demo) => ({ id: demo.id, ...(await highlightHtml(demo)) })),
);
writeFileSync(OUT_FILE, serializeModule(outputs));
console.log(
  `generate-hero: wrote ${OUT_FILE} (${outputs
    .map(
      (o) =>
        `${o.id} ${(o.html.length / 1024).toFixed(1)}${o.term ? ` + term ${(o.term.length / 1024).toFixed(1)}` : ""} KiB`,
    )
    .join(", ")})`,
);
