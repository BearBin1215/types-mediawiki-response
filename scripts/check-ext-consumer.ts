/**
 * External-consumer harness for the opt-in extension mechanism.
 *
 * Simulates a downstream project that installs the built package and verifies:
 *  - core isolation: with nothing imported, extension fields are ABSENT on `ApiPage`;
 *  - import activation: importing anything from a pack file — an empty
 *    `import type {}` or the field-group type being used — applies the
 *    augmentation shipped inside the pack (keys and landing spots live in the
 *    pack, so consumer copies cannot drift);
 *  - legacy seam: a hand-written consumer `declare module` still works (for
 *    third-party extensions this package does not cover);
 *  - content-model seam: `ContentModelExtension` augmentation promotes
 *    extension/site models into `ContentModel` (pack-side via `ext/massmessage`,
 *    consumer-side via a hand-written `declare module`), while a non-core
 *    model is NOT a first-class member with no pack activated;
 *  - specificity: activating pack A never pulls pack B's fields;
 *  - reference limitation: `/// <reference types>` resolves the pack file but
 *    does NOT apply its augmentation (TS 7.0.2) — asserted so a future TS
 *    change surfaces here instead of silently inverting the docs;
 *  - emit: the type-only import is erased — no runtime import lands in
 *    compiled JS, while a side-effect import would emit one (the hazard).
 *
 * Run: `pnpm check:ext`. Exits non-zero if any expectation breaks.
 */
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TSC = join(ROOT, "node_modules", "typescript", "bin", "tsc");
const DIR = join(ROOT, ".ext-harness");
const PKG = join(DIR, "node_modules", "types-mediawiki-response");

// 对齐仓库 tsconfig.json 的关键选项（bundler + strict + verbatimModuleSyntax），
// 保证 harness 的解析/擦除行为与真实消费方一致。
// rootDir 指向 harness 目录：harness 的 .ts 文件嵌在带 `exports` map 的仓库 package.json
// 之下，发射（emit）时旧版 tsc 会因项目根不明报 TS2209（"project root is ambiguous"），
// 显式给 rootDir 即可消歧，让 TS5 也能跑擦除测试。
const BASE_TSCONFIG = {
  compilerOptions: {
    target: "es2022",
    module: "esnext",
    moduleResolution: "bundler",
    strict: true,
    verbatimModuleSyntax: true,
    types: [],
    skipLibCheck: true,
    rootDir: DIR,
    noEmit: true,
  },
};

/** Run tsc on a consumer tsconfig; return whether it type-checked clean. */
function check(name: string, include: string[]): boolean {
  const cfg = join(DIR, `tsconfig.${name}.json`);
  writeFileSync(cfg, JSON.stringify({ ...BASE_TSCONFIG, include }, null, 2));
  try {
    execFileSync(process.execPath, [TSC, "-p", cfg], { cwd: DIR, stdio: "pipe" });
    return true;
  } catch (err) {
    console.error(String(err instanceof Error ? err.message : err).slice(0, 2000));
    const stderr = (err as { stderr?: Buffer }).stderr;
    if (stderr) console.error(stderr.toString().slice(0, 2000));
    return false;
  }
}

/** Compile a consumer file WITH emit; return the emitted JS source. */
function emit(name: string, file: string): string {
  const outDir = join(DIR, `emit/${name}`);
  const cfg = join(DIR, `tsconfig.${name}.json`);
  writeFileSync(
    cfg,
    JSON.stringify(
      {
        ...BASE_TSCONFIG,
        include: [file],
        compilerOptions: { ...BASE_TSCONFIG.compilerOptions, noEmit: false, outDir },
      },
      null,
      2,
    ),
  );
  execFileSync(process.execPath, [TSC, "-p", cfg], { cwd: DIR, stdio: "pipe" });
  return readFileSync(join(outDir, file.replace(/\.ts$/, ".js")), "utf8");
}

// APPEND-MAIN
// Fresh dist, then a fake install of the package into the harness node_modules.
execFileSync(process.execPath, [TSC, "-p", join(ROOT, "tsconfig.build.json")], {
  cwd: ROOT,
  stdio: "inherit",
});
rmSync(DIR, { recursive: true, force: true });
mkdirSync(PKG, { recursive: true });
cpSync(join(ROOT, "package.json"), join(PKG, "package.json"));
cpSync(join(ROOT, "dist"), join(PKG, "dist"), { recursive: true });

// (i) core isolation: `flagged` must NOT exist on ApiPage with nothing imported.
writeFileSync(
  join(DIR, "core.ts"),
  `import type { ApiPage } from 'types-mediawiki-response';
const p = {} as ApiPage;
// @ts-expect-error flagged must be absent without the ext pack
p.flagged;
`,
);

// (ii) empty-import activation: one line, no landing-spot knowledge needed.
writeFileSync(
  join(DIR, "empty-import.ts"),
  `import type {} from 'types-mediawiki-response/ext/flaggedrevs';
import type { ApiPage } from 'types-mediawiki-response';
const p = {} as ApiPage;
p.flagged;
`,
);

// (iii) named-import activation: importing the field-group type being used
//       activates the shipped augmentation as a side effect.
writeFileSync(
  join(DIR, "named-import.ts"),
  `import type { ApiPageFlagged } from 'types-mediawiki-response/ext/flaggedrevs';
import type { ApiPage } from 'types-mediawiki-response';
const flagged = {} as ApiPageFlagged;
const p = {} as ApiPage;
p.flagged = flagged;
`,
);

// (iv) specificity: activating echo must not pull flaggedrevs fields,
//      and must still merge its own keys into ApiQueryResult.
writeFileSync(
  join(DIR, "specificity.ts"),
  `import type {} from 'types-mediawiki-response/ext/echo';
import type { ApiPage, ApiQueryResult } from 'types-mediawiki-response';
const p = {} as ApiPage;
// @ts-expect-error activating echo must not pull flaggedrevs fields
p.flagged;
const q = {} as ApiQueryResult;
q.notifications;
`,
);

// (v) legacy consumer augmentation (third-party seam): hand-written
//     `declare module` keeps working.
writeFileSync(
  join(DIR, "consumer-aug.d.ts"),
  `import type { ApiPageFlagged } from 'types-mediawiki-response/ext/flaggedrevs';
declare module 'types-mediawiki-response' {
  interface ApiPage {
    flagged?: ApiPageFlagged;
  }
}
`,
);
writeFileSync(
  join(DIR, "consumer.ts"),
  `import type { ApiPage } from 'types-mediawiki-response';
const p = {} as ApiPage;
p.flagged;
`,
);

// (vi) reference limitation: `/// <reference types>` resolves the pack file
//      but does not apply its shipped augmentation (TS 7.0.2).
writeFileSync(
  join(DIR, "reference.ts"),
  `/// <reference types="types-mediawiki-response/ext/flaggedrevs" />
import type { ApiPage } from 'types-mediawiki-response';
const p = {} as ApiPage;
// @ts-expect-error a bare reference must NOT activate the augmentation
p.flagged;
`,
);

// (vii) content-model seam, core isolation: a non-core model is not a
//       first-class `ContentModel` member with no pack activated.
writeFileSync(
  join(DIR, "content-model-absent.ts"),
  `import type { ContentModel } from 'types-mediawiki-response';
const absent: never = null as Extract<ContentModel, 'MassMessageListContent'>;
`,
);

// (viii) content-model seam, pack promotion: activating massmessage promotes
//        its delivery-list content model into `ContentModel`.
writeFileSync(
  join(DIR, "content-model-pack.ts"),
  `import type {} from 'types-mediawiki-response/ext/massmessage';
import type { ContentModel } from 'types-mediawiki-response';
// Fails as the never type if the pack's ContentModelExtension merge is lost.
const promoted: Extract<ContentModel, 'MassMessageListContent'> = 'MassMessageListContent';
`,
);

// (ix) content-model seam, consumer augmentation: a site-specific model merges
//      through `ContentModelExtension` just like a pack model.
writeFileSync(
  join(DIR, "content-model-consumer.ts"),
  `import type { ContentModel } from 'types-mediawiki-response';
declare module 'types-mediawiki-response' {
  interface ContentModelExtension {
    MyWikiModel: 'my-wiki-model';
  }
}
// Fails as the never type if the barrel re-export no longer merges the augmentation.
const site: Extract<ContentModel, 'my-wiki-model'> = 'my-wiki-model';
`,
);

const isolated = check("core", ["core.ts"]);
const emptyImport = check("empty-import", ["empty-import.ts"]);
const namedImport = check("named-import", ["named-import.ts"]);
const specific = check("specificity", ["specificity.ts"]);
const consumer = check("consumer", ["consumer.ts", "consumer-aug.d.ts"]);
const referenceLimited = check("reference", ["reference.ts"]);
const contentModelAbsent = check("content-model-absent", ["content-model-absent.ts"]);
const contentModelPack = check("content-model-pack", ["content-model-pack.ts"]);
const contentModelConsumer = check("content-model-consumer", ["content-model-consumer.ts"]);

// (x) emit: the type-only import is erased — no runtime import in output.
writeFileSync(
  join(DIR, "emit-import.ts"),
  `import type {} from 'types-mediawiki-response/ext/flaggedrevs';
import type { ApiPage } from 'types-mediawiki-response';
const p = {} as ApiPage;
p.flagged;
`,
);
const importJs = emit("emit-import", "emit-import.ts");
const importClean = !importJs.includes("types-mediawiki-response");

// (xi) contrast: a side-effect import DOES emit a runtime import — the
//        reason the type-only import is the documented form.
writeFileSync(
  join(DIR, "emit-sideeffect.ts"),
  `import 'types-mediawiki-response/ext/flaggedrevs';\n`,
);
const sideEffectJs = emit("emit-sideeffect", "emit-sideeffect.ts");
const sideEffectEmits = sideEffectJs.includes("types-mediawiki-response");

rmSync(DIR, { recursive: true, force: true });

console.log(
  `[check:ext] core isolation (flagged absent):             ${isolated ? "PASS" : "FAIL"}`,
);
console.log(
  `[check:ext] empty-import activation (flagged present):   ${emptyImport ? "PASS" : "FAIL"}`,
);
console.log(
  `[check:ext] named-import activation (flagged present):   ${namedImport ? "PASS" : "FAIL"}`,
);
console.log(
  `[check:ext] specificity (echo only; no flaggedrevs):     ${specific ? "PASS" : "FAIL"}`,
);
console.log(
  `[check:ext] consumer augmentation (legacy seam):         ${consumer ? "PASS" : "FAIL"}`,
);
console.log(
  `[check:ext] reference limitation (flagged absent):       ${referenceLimited ? "PASS" : "FAIL"}`,
);
console.log(
  `[check:ext] content model: non-core model absent:        ${contentModelAbsent ? "PASS" : "FAIL"}`,
);
console.log(
  `[check:ext] content model: pack promotion (massmessage): ${contentModelPack ? "PASS" : "FAIL"}`,
);
console.log(
  `[check:ext] content model: consumer augmentation:        ${contentModelConsumer ? "PASS" : "FAIL"}`,
);
console.log(
  `[check:ext] emit: type import erased (no runtime):       ${importClean ? "PASS" : "FAIL"}`,
);
console.log(
  `[check:ext] emit: side-effect import emits (contrast):   ${sideEffectEmits ? "PASS" : "FAIL"}`,
);

if (
  !isolated ||
  !emptyImport ||
  !namedImport ||
  !specific ||
  !consumer ||
  !referenceLimited ||
  !contentModelAbsent ||
  !contentModelPack ||
  !contentModelConsumer ||
  !importClean ||
  !sideEffectEmits
) {
  console.error("[check:ext] extension opt-in mechanism regressed.");
  process.exit(1);
}
console.log("[check:ext] ok");
