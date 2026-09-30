/**
 * Audit: for every covered module with a fixed-enum `*prop` parameter, check
 * that each legal enum value appears as a declared property in the module's
 * src file — the batch counterpart of the per-module "paraminfo 当清单" check
 * from dev-docs/authoring.md「断言配方」. Catches enum-driven fields no fixture
 * ever exercised (the snapshot only proves what the baseline wiki offers).
 *
 * Key extraction is file-granular: every property declared in the module file
 * counts (row type plus page-level siblings), so the finding direction is
 * deliberately one-sided — an enum value with no declared key anywhere.
 * Renames and deliberately-unmodeled values go into ALLOWLIST below.
 *
 * Run: `pnpm audit:paraminfo` (after `pnpm fetch:paraminfo`).
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT = join(ROOT, "tests", "paraminfo", "baseline.json");

interface ParamInfo {
  name: string;
  type?: unknown;
  deprecatedvalues?: Record<string, unknown>;
}
interface ModuleInfo {
  name: string;
  path?: string;
  parameters?: ParamInfo[];
  deleted?: boolean;
}

/** Row types are reused across module families (authoring.md「同族模块复用行
 * 类型」), so the declaration side is the package-wide property set: only an
 * enum value declared NOWHERE counts as a finding. */
function declaredKeys(): Set<string> {
  const keys = new Set<string>();
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".ts")) {
        for (const match of readFileSync(full, "utf8").matchAll(
          /^[ \t]{2,}(["']?)([\w-]+)\1\s*[??:]/gm,
        )) {
          keys.add(match[2]!);
        }
      }
    }
  };
  walk(join(ROOT, "src"));
  return keys;
}

/** Reviewed findings (authoring.md「只人工裁定不一致项」): enum values whose
 * emitted keys differ from the value name. Each entry is [module/param, value,
 * reason]; an unlisted finding fails the audit. */
const ALLOWLIST: [string, string, string][] = [
  ...["alldeletedrevisions", "allrevisions", "deletedrevisions", "revisions"].map(
    (m): [string, string, string] => [
      `${m}/prop`,
      "ids",
      "ids → revid / parentid — the id keys are declared under their emitted names",
    ],
  ),
  ["recentchanges/prop", "ids", "ids → declared as rcid"],
  ["usercontribs/prop", "ids", "ids → declared as rcid"],
  ["watchlist/prop", "ids", "ids → declared as pageid / revid / old_revid"],
  ...[
    "alldeletedrevisions",
    "allrevisions",
    "blocks",
    "deletedrevisions",
    "recentchanges",
    "revisions",
  ].map((m): [string, string, string] => [
    `${m}/prop`,
    "flags",
    "flags → per-flag booleans declared individually (minor / bot / new / anon / hidden …)",
  ]),
  ...["alldeletedrevisions", "allrevisions", "deletedrevisions", "revisions"].flatMap(
    (m): [string, string, string][] => [
      [`${m}/prop`, "slotsha1", "slotsha1 → declared as slots[].sha1"],
      [`${m}/prop`, "slotsize", "slotsize → declared as slots[].size"],
    ],
  ),
  ...["allimages", "filearchive", "imageinfo"].map((m): [string, string, string] => [
    `${m}/prop`,
    "dimensions",
    "dimensions → declared as width / height",
  ]),
  ["compare/prop", "ids", "ids → declared as fromid / toid / fromrevid / torevid"],
  ["compare/prop", "rel", "rel → declared as prev / next"],
  [
    "blocks/prop",
    "range",
    "range → declared as rangestart / rangeend (1.42+ replaced the ≤1.41 rangeblock flag)",
  ],
  [
    "imageinfo/prop",
    "uploadwarning",
    "uploadwarning is only emitted inside action=upload's imageinfo payload, never on query rows",
  ],
  ["allfileusages/prop", "ids", "ids → declared as pageid"],
  ["alllinks/prop", "ids", "ids → declared as pageid"],
  ["allredirects/prop", "ids", "ids → declared as pageid"],
  ["alltransclusions/prop", "ids", "ids → declared as pageid"],
  ["categorymembers/prop", "ids", "ids → declared as pageid"],
  ["exturlusage/prop", "ids", "ids → declared as pageid"],
  ["logevents/prop", "ids", "ids → declared as logid"],
  ["pageswithprop/prop", "ids", "ids → declared as pageid"],
  ["recentchanges/prop", "sizes", "sizes → declared as oldlen / newlen"],
  [
    "recentchanges/prop",
    "loginfo",
    "loginfo → declared as logid / logtype / logaction / logparams",
  ],
  [
    "usercontribs/prop",
    "flags",
    "flags → per-flag booleans declared individually (minor / new / patrolled …)",
  ],
  [
    "watchlist/prop",
    "flags",
    "flags → per-flag booleans declared individually (minor / new / patrolled …)",
  ],
  ["watchlist/prop", "sizes", "sizes → declared as oldlen / newlen"],
  ["watchlist/prop", "loginfo", "loginfo → declared as logid / logtype / logaction / logparams"],
  ["stashimageinfo/prop", "dimensions", "dimensions → declared as width / height"],
  ["userinfo/prop", "hasmsg", "hasmsg → declared as messages (a real boolean)"],
];

/** paraminfo serializes `PARAM_DEPRECATED_VALUES` either as a list of names or
 * as a `{ name: true }` map; accept both. */
function deprecatedNames(dv: unknown): Set<string> {
  const names = new Set<string>();
  const add = (v: unknown): void => {
    if (typeof v === "string") names.add(v);
  };
  if (Array.isArray(dv)) dv.forEach(add);
  else if (dv && typeof dv === "object") {
    for (const [k, v] of Object.entries(dv)) {
      if (Number.isNaN(Number(k))) add(k); // map form: { value: true }
      add(v);
    }
  }
  return names;
}

function main(): void {
  const snapshot = JSON.parse(readFileSync(SNAPSHOT, "utf8")) as {
    generator?: string;
    absent?: { module: string }[];
    modules?: ModuleInfo[];
  };
  const absent = new Set((snapshot.absent ?? []).map((a) => a.module));

  const findings: string[] = [];
  const checked: string[] = [];
  const keys = declaredKeys();
  for (const module of snapshot.modules ?? []) {
    if (absent.has(module.name) || module.deleted) continue;
    for (const param of module.parameters ?? []) {
      if (!param.name.endsWith("prop") || !Array.isArray(param.type)) continue;
      const enums = param.type.filter((v): v is string => typeof v === "string");
      const deprecated = deprecatedNames(param.deprecatedvalues);
      const keyId = `${module.name}/${param.name}`;
      checked.push(`${keyId} (${enums.length} values)`);
      for (const value of enums) {
        if (deprecated.has(value)) continue; // 弃用枚举值不参与比对（paraminfo 权威标记）
        if (keys.has(value)) continue;
        const reason = ALLOWLIST.find(([k, v]) => k === keyId && v === value)?.[2];
        if (reason) continue;
        findings.push(`${keyId}: enum value "${value}" has no declared key`);
      }
    }
  }

  console.log(
    `[audit-paraminfo] ${checked.length} prop-parameter(s) compared against declarations`,
  );
  if (findings.length > 0) {
    for (const finding of findings) console.error(`  FINDING ${finding}`);
    console.error(`audit:paraminfo: FAILED (${findings.length} finding(s))`);
    process.exitCode = 1;
  } else {
    console.log("audit:paraminfo: clean");
  }
}

main();
