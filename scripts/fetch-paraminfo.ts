/**
 * Capture `action=paraminfo` for every module this package covers, from the
 * baseline wiki (`MW_API`, default `mw-fixture` 1.43), into
 * `tests/paraminfo/baseline.json` — the denominator for
 * `scripts/audit-paraminfo.ts` (prop-enum values ↔ declared keys).
 *
 * The module list is derived from the src tree (core actions + query
 * submodules) plus the curated EXT_MODULES map; extensions' file stems do not
 * map 1:1 to module names. Re-run after the wiki's module set changes.
 *
 * Run: `pnpm fetch:paraminfo` (override the endpoint with `MW_API=...`).
 */
import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API = process.env.MW_API ?? "http://localhost:8080/api.php";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "tests", "paraminfo", "baseline.json");
const CHUNK = 40; // paraminfo's `modules` values-per-request limit

/** Extension module names per src/extensions file stem (stems ≠ module names);
 * entries carry their full paraminfo path (`query+` prefix for query modules). */
const EXT_MODULES: Record<string, string[]> = {
  abusefilters: [
    "abusefilterchecksyntax",
    "abusefilterevalexpression",
    "abusefilterunblockautopromote",
    "abusefiltercheckmatch",
    "abuselogprivatedetails",
  ],
  betafeatures: ["query+betafeatures"],
  categorytree: ["categorytree"],
  centralauth: [
    "centralauthtoken",
    "createlocalaccount",
    "deleteglobalaccount",
    "setglobalaccountstatus",
    "globaluserrights",
    "query+globalallusers",
    "query+globalgroups",
    "query+globalusers",
    "query+wikisets",
  ],
  checkuser: ["query+checkuser", "query+checkuserlog", "query+checkuserformattedblockinfo"],
  description: ["query+description"],
  discussiontools: [
    "discussiontoolscompare",
    "discussiontoolsedit",
    "discussiontoolsfindcomment",
    "discussiontoolsgetsubscriptions",
    "discussiontoolspageinfo",
    "discussiontoolspreview",
    "discussiontoolssubscribe",
    "discussiontoolsthank",
  ],
  echo: [
    "echomarkread",
    "echomarkseen",
    "echocreateevent",
    "echoarticlereminder",
    "echomute",
    "echopushsubscriptions",
  ],
  extracts: ["query+extracts"],
  flaggedrevs: ["review", "flagconfig", "stabilize"],
  gadgets: ["query+gadgets", "query+gadgetcategories"],
  globalblocks: ["globalblock"],
  globalpreferences: ["globalpreferences", "globalpreferenceoverrides"],
  globalusage: ["query+globalusage"],
  globaluserinfo: ["query+globaluserinfo"],
  linter: ["query+linterrors", "query+linterstats"],
  massmessage: ["massmessage", "editmassmessagelist"],
  oathauth: ["oathvalidate"],
  pageimages: ["query+pageimages"],
  pageviews: ["query+pageviews", "query+siteviews", "query+mostviewed"],
  scribunto: ["scribunto-console"],
  sitematrix: ["query+sitematrix"],
  spamblacklist: ["spamblacklist"],
  templatedata: ["templatedata"],
  thanks: ["thank"],
  timedmediahandler: ["timedtext", "transcodereset"],
  titleblacklist: ["titleblacklist"],
  translate: [
    "aggregategroups",
    "groupreview",
    "markfortranslation",
    "messagegroupsubscription",
    "searchtranslations",
    "translationaids",
    "translationentitysearch",
    "translationreview",
    "translationstash",
    "translatesandbox",
    "translationstats",
    "ttmserver",
    "query+languagestats",
    "query+messagecollection",
    "query+messagegroups",
    "query+messagegroupstats",
    "query+messagetranslations",
  ],
  uls: ["ulslocalization", "ulssetlang"],
  urlshortener: ["shortenurl"],
  visualeditor: ["visualeditor", "visualeditoredit", "editcheckreferenceurl"],
  wikibase: ["query+wikibase", "query+pageterms", "query+wbentityusage", "query+wblistentityusage"],
  wikilove: ["wikilove"],
};

function stems(dir: string, skip: Set<string>): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".ts") && !skip.has(f))
    .map((f) => f.slice(0, -3));
}

async function main(): Promise<void> {
  const queryDir = join(ROOT, "src", "core", "query");
  const coreDir = join(ROOT, "src", "core");
  const modules: string[] = [];
  // `logparams.ts` carries the shared log-event param types, not a module.
  for (const stem of stems(queryDir, new Set(["index.ts", "shared.ts", "logparams.ts"]))) {
    modules.push(`query+${stem}`);
  }
  for (const stem of stems(coreDir, new Set(["index.ts"]))) {
    modules.push(stem);
  }
  for (const names of Object.values(EXT_MODULES)) modules.push(...names);

  const fetched: Record<string, unknown>[] = [];
  const absent: { module: string; reason: string }[] = [];
  for (let i = 0; i < modules.length; i += CHUNK) {
    const batch = modules.slice(i, i + CHUNK);
    const url = `${API}?action=paraminfo&format=json&formatversion=2&modules=${encodeURIComponent(batch.join("|"))}`;
    // Sequential on purpose: fetch batches one at a time, spaced, to stay polite.
    // oxlint-disable-next-line no-await-in-loop
    const res = await fetch(url);
    // oxlint-disable-next-line no-await-in-loop
    const body = (await res.json()) as {
      paraminfo?: { modules?: Record<string, unknown>[] };
      error?: unknown;
      warnings?: Record<string, { warnings?: string }>;
    };
    if (body.error) throw new Error(`paraminfo batch ${i / CHUNK}: ${JSON.stringify(body.error)}`);
    fetched.push(...(body.paraminfo?.modules ?? []));
    // Modules the baseline wiki legitimately lacks (@since 1.44+ coverage on a
    // 1.43 wiki) land in `absent` instead of failing the capture.
    for (const warning of Object.values(body.warnings ?? {})) {
      const text = warning.warnings ?? "";
      const names = [...text.matchAll(/does not have a submodule "([^"]+)"/g)].map((m) => m[1]!);
      if (names.length > 0) {
        for (const name of names) absent.push({ module: name, reason: text });
      } else if (text.trim() !== "") {
        throw new Error(`unexpected paraminfo warning: ${JSON.stringify(warning)}`);
      }
    }
  }

  const got = new Set(fetched.map((m) => m.name));
  const missing = modules.filter(
    (m) =>
      !got.has(m.includes("+") ? m.slice(6) : m) &&
      !absent.some((a) => a.module === (m.includes("+") ? m.slice(6) : m)),
  );
  if (missing.length > 0) {
    throw new Error(`modules missing from paraminfo: ${missing.join(", ")}`);
  }

  const version = await (async () => {
    const res = await fetch(
      `${API}?action=query&meta=siteinfo&siprop=general&format=json&formatversion=2`,
    );
    const body = (await res.json()) as { query?: { general?: { generator?: string } } };
    return body.query?.general?.generator ?? "unknown";
  })();

  writeFileSync(
    OUT,
    `${JSON.stringify({ generator: version, absent, modules: fetched }, null, 2)}\n`,
  );
  console.log(
    `[fetch-paraminfo] ${fetched.length} modules (${absent.length} absent on baseline) from ${version} -> tests/paraminfo/baseline.json`,
  );
}

main().catch((error: unknown) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
