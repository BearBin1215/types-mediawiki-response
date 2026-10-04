/**
 * Release-notes generator for GitHub Releases.
 *
 * Replaces `gh release create --generate-notes`, whose auto notes only list
 * merged PRs — direct pushes to main (the dominant workflow here) never show
 * up, so v1.0.1's notes contained nothing but two Dependabot bumps while the
 * actual feature commits were invisible. This script walks
 * `git log <prev>..<current>` and renders the body from conventional commits:
 *
 *  - entries grouped by commit type: Features / Bug Fixes / Performance /
 *    Refactoring / Reverts / Documentation / Tests / Build / CI /
 *    Dependencies (`chore(deps*)` and `bump …`) / Other Changes;
 *  - `chore: release vX.Y.Z` version-bump commits are skipped;
 *  - `BREAKING CHANGE:` footers (or `!` markers) get a dedicated section;
 *  - short SHAs are emitted for GitHub to auto-link, and a Full Changelog
 *    compare link closes the body.
 *
 * Run: `pnpm release-notes [<tag> [<prev-tag>]]` — defaults to the
 * package.json version and the highest `v*` tag below it; prints markdown to
 * stdout. The Publish workflow pipes this into `gh release create
 * --notes-file` and falls back to `--generate-notes` if generation fails.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// 不可打印分隔符：切分 git log 的字段与记录，避免与提交内容撞车
const US = "\u001f";
const RS = "\u001e";

interface Commit {
  sha: string;
  subject: string;
  body: string;
}

const SECTION_ORDER = [
  "Features",
  "Bug Fixes",
  "Performance",
  "Refactoring",
  "Reverts",
  "Documentation",
  "Tests",
  "Build",
  "CI",
  "Dependencies",
  "Other Changes",
] as const;

type Section = (typeof SECTION_ORDER)[number];

const TYPE_SECTIONS: Record<string, Section> = {
  feat: "Features",
  fix: "Bug Fixes",
  perf: "Performance",
  revert: "Reverts",
  refactor: "Refactoring",
  docs: "Documentation",
  test: "Tests",
  build: "Build",
  ci: "CI",
};

const CONVENTIONAL =
  /^(feat|fix|perf|revert|refactor|docs|test|build|ci|chore|style)(?:\(([^)]*)\))?(!)?:\s*(.+)$/;

const RELEASE_COMMIT = /^chore(?:\([^)]*\))?:\s*release\b/;

const BREAKING_FOOTER = /^BREAKING[ -]CHANGE:(.*)$/;
const FOOTER_HEADER = /^[A-Za-z][A-Za-z0-9-]*:\s/;

function git(...args: string[]): string {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
}

function semverOf(tag: string): [number, number, number] | undefined {
  const m = /^v(\d+)\.(\d+)\.(\d+)$/.exec(tag);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : undefined;
}

function versionLess(a: [number, number, number], b: [number, number, number]): boolean {
  return a[0] !== b[0] ? a[0] < b[0] : a[1] !== b[1] ? a[1] < b[1] : a[2] < b[2];
}

/** 上一版 tag：版本号严格小于 current 的最大 v* tag */
function previousTag(current: string): string | undefined {
  const cur = semverOf(current);
  if (!cur) return undefined;
  const below = git("tag", "--list", "v*")
    .split("\n")
    .filter(Boolean)
    .map((tag) => ({ tag, v: semverOf(tag) }))
    .filter(
      (t): t is { tag: string; v: [number, number, number] } =>
        t.v !== undefined && versionLess(t.v, cur),
    )
    .sort((a, b) => (versionLess(a.v, b.v) ? 1 : -1)); // 降序
  return below[0]?.tag;
}

function loadCommits(range: string): Commit[] {
  const out = git("log", range, `--format=%H${US}%s${US}%b${RS}`);
  return out
    .split(RS)
    .filter((chunk) => chunk.trim().length > 0)
    .map((chunk) => {
      const [sha = "", subject = "", ...bodyParts] = chunk.split(US);
      return { sha: sha.trim(), subject: subject.trim(), body: bodyParts.join(US).trim() };
    });
}

/**
 * 提取 body 里的 BREAKING CHANGE footer；续行按 git trailer 约定取缩进行，
 * 合并成一段。
 */
function breakingFooters(body: string): string[] {
  const lines = body.split("\n");
  const found: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const m = BREAKING_FOOTER.exec(lines[i] ?? "");
    if (!m) {
      i++;
      continue;
    }
    const parts = [(m[1] ?? "").trim()];
    i++;
    while (i < lines.length) {
      const line = (lines[i] ?? "").trim();
      // 续行：非空且不是下一个 footer 头；缩进与裸换行两种换行风格都接受
      if (line.length === 0 || FOOTER_HEADER.test(line) || BREAKING_FOOTER.test(line)) break;
      parts.push(line);
      i++;
    }
    const text = parts.join(" ").replace(/\s+/g, " ").trim();
    if (text) found.push(text);
  }
  return found;
}

function entryLine(commit: Commit, scope: string | undefined, subject: string): string {
  // deps* scope 对 "Dependencies" 分组是冗余的，去掉；其余 scope 保留为粗体前缀
  const prefix = scope && !/^deps(-[a-z]+)?$/.test(scope) ? `**${scope}**: ` : "";
  return `- ${prefix}${subject} (${commit.sha.slice(0, 7)})`;
}

function render(opts: {
  current: string;
  prev?: string;
  commits: Commit[];
  repoUrl?: string;
}): string {
  const groups = new Map<Section, string[]>();
  const breaking: string[] = [];

  const push = (section: Section, line: string) => {
    const lines = groups.get(section) ?? [];
    lines.push(line);
    groups.set(section, lines);
  };

  for (const commit of opts.commits) {
    if (RELEASE_COMMIT.test(commit.subject)) continue;
    const m = CONVENTIONAL.exec(commit.subject);
    const footers = breakingFooters(commit.body);

    if (m?.[3] || footers.length > 0) {
      // 有破坏性变更：整条只进 Breaking Changes，避免与类型分组重复罗列
      const line = entryLine(commit, m?.[2], (m?.[4] ?? commit.subject).trim());
      breaking.push(
        footers.length > 0 ? [line, ...footers.map((f) => `  - ${f}`)].join("\n") : line,
      );
      continue;
    }

    if (!m) {
      push("Other Changes", `- ${commit.subject} (${commit.sha.slice(0, 7)})`);
      continue;
    }

    const subject = (m[4] ?? "").trim();
    if (m[1] === "chore") {
      const isDeps = /^deps(-[a-z]+)?$/.test(m[2] ?? "") || /^bump\s/i.test(subject);
      push(isDeps ? "Dependencies" : "Other Changes", entryLine(commit, m[2], subject));
      continue;
    }
    push(TYPE_SECTIONS[m[1] ?? ""] ?? "Other Changes", entryLine(commit, m[2], subject));
  }

  const out: string[] = [];
  if (breaking.length > 0) out.push("## ⚠️ Breaking Changes", "", ...breaking, "");
  for (const title of SECTION_ORDER) {
    const lines = groups.get(title);
    if (lines && lines.length > 0) out.push(`## ${title}`, "", ...lines, "");
  }
  if (opts.prev && opts.repoUrl) {
    out.push(`**Full Changelog**: ${opts.repoUrl}/compare/${opts.prev}...${opts.current}`);
  }
  return `${out.join("\n").trimEnd()}\n`;
}

function main(): void {
  const [currentArg, prevArg] = process.argv.slice(2);
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    version: string;
    repository?: { url?: string };
  };

  const current = currentArg ?? `v${pkg.version}`;
  // 目标必须是真实存在的 tag/commit，写错时明确报错（CI 端据此回退）
  git("rev-parse", "--verify", `${current}^{commit}`);

  const prev = prevArg ?? previousTag(current);
  const commits = loadCommits(prev ? `${prev}..${current}` : current);
  if (commits.length === 0) {
    throw new Error(`No commits found between ${prev ?? "the first commit"} and ${current}`);
  }

  const repoUrl = pkg.repository?.url?.replace(/^git\+/, "").replace(/\.git$/, "");
  process.stdout.write(render({ current, prev, commits, repoUrl }));
}

main();
