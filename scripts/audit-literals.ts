/**
 * Fixture-literal audit: inline every committed fixture as a TS object literal
 * and `satisfies` it against the declared response type (methodology:
 * dev-docs/authoring.md 「三重证据审查」).
 *
 * Complements the hand-written `satisfies` samples in tests/: the literals come
 * verbatim from the fixtures (no resolveJsonModule widening), so the object
 * literal's excess-property check flags "returned but undeclared" keys at every
 * nesting level, and assignability flags value-type mismatches. Output lands in
 * `.mw-scratch/` (gitignored) and is never committed; tsc must pass clean.
 *
 * Run: `pnpm audit:literals`. Exit code is non-zero on any finding, including a
 * fixture missing from REGISTRY — a new fixture must be registered consciously.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TSC = join(ROOT, "node_modules", "typescript", "bin", "tsc");
const FIXTURE_ROOT = join(ROOT, "tests", "fixtures");
const EXT_DIR = join(ROOT, "src", "extensions");
const OUT_DIR = join(ROOT, ".mw-scratch", "audit");
const PKG_NAME = "types-mediawiki-response";

/**
 * Declared response type per fixture, relative to `tests/fixtures/`.
 * `core/query/` defaults to ApiQueryResponse (the whole-response shape); the
 * watchlistraw-only capture is the one exception. Everything outside it must be
 * registered here — the map doubles as documentation of what each fixture proves.
 */
const REGISTRY: Record<string, string> = {
  "core/query/watchlistraw.json": "ApiWatchlistRawResponse",
  "core/acquiretempusername/acquiretempusername.json": "ApiAcquireTempUserNameResponse",
  "core/block/block.json": "ApiBlockResponse",
  "core/changeauthenticationdata/changeauthenticationdata.json":
    "ApiChangeAuthenticationDataResponse",
  "core/changecontentmodel/changecontentmodel.json": "ApiChangeContentModelResponse",
  "core/checktoken/invalid.json": "ApiCheckTokenResponse",
  "core/checktoken/valid.json": "ApiCheckTokenResponse",
  "core/clearhasmsg/clearhasmsg.json": "ApiClearHasMsgResponse",
  "core/clientlogin/clientlogin.json": "ApiClientLoginResponse",
  "core/compare/compare.json": "ApiCompareResponse",
  "core/createaccount/createaccount.json": "ApiCreateAccountResponse",
  "core/delete/delete-scheduled.json": "ApiDeleteResponse",
  "core/delete/delete.json": "ApiDeleteResponse",
  "core/edit/captcha-failure.json": "ApiEditResponse",
  "core/edit/create.json": "ApiEditResponse",
  "core/edit/newsection.json": "ApiEditResponse",
  "core/edit/nochange.json": "ApiEditResponse",
  "core/emailuser/emailuser.json": "ApiEmailUserResponse",
  "core/expandtemplates/expandtemplates.json": "ApiExpandTemplatesResponse",
  "core/filerevert/filerevert.json": "ApiFileRevertResponse",
  "core/imagerotate/imagerotate.json": "ApiImageRotateResponse",
  "core/import/import.json": "ApiImportResponse",
  "core/languagesearch/zh.json": "ApiLanguageSearchResponse",
  "core/login/login.json": "ApiLoginResponse",
  "core/logout/logout.json": "ApiLogoutResponse",
  "core/managetags/create.json": "ApiManageTagsResponse",
  "core/managetags/delete.json": "ApiManageTagsResponse",
  "core/mergehistory/mergehistory.json": "ApiMergeHistoryResponse",
  "core/move/noredirect.json": "ApiMoveResponse",
  "core/move/redirect.json": "ApiMoveResponse",
  "core/move/subpages-errors.json": "ApiMoveResponse",
  "core/move/subpages.json": "ApiMoveResponse",
  "core/options/options.json": "ApiOptionsResponse",
  "core/parse/parse-deep.json": "ApiParseResponse",
  "core/parse/parse.json": "ApiParseResponse",
  "core/patrol/patrol.json": "ApiPatrolResponse",
  "core/protect/protect-cascade.json": "ApiProtectResponse",
  "core/protect/protect.json": "ApiProtectResponse",
  "core/purge/purge-normalized.json": "ApiPurgeResponse",
  "core/purge/purge.json": "ApiPurgeResponse",
  "core/removeauthenticationdata/removeauthenticationdata.json":
    "ApiRemoveAuthenticationDataResponse",
  "core/resetpassword/resetpassword.json": "ApiResetPasswordResponse",
  "core/revisiondelete/revisiondelete.json": "ApiRevisionDeleteResponse",
  "core/rollback/rollback.json": "ApiRollbackResponse",
  "core/setnotificationtimestamp/setnotificationtimestamp.json":
    "ApiSetNotificationTimestampResponse",
  "core/setpagelanguage/setpagelanguage.json": "ApiSetPageLanguageResponse",
  "core/stashedit/stashedit.json": "ApiStashEditResponse",
  "core/tag/tag.json": "ApiTagResponse",
  "core/unblock/unblock.json": "ApiUnblockResponse",
  "core/undelete/undelete.json": "ApiUndeleteResponse",
  "core/upload/upload.json": "ApiUploadResponse",
  "core/userrights/userrights.json": "ApiUserrightsResponse",
  "core/validatepassword/good.json": "ApiValidatePasswordResponse",
  "core/validatepassword/weak.json": "ApiValidatePasswordResponse",
  "core/watch/unwatch.json": "ApiWatchResponse",
  "core/watch/watch.json": "ApiWatchResponse",
  "envelope/error/badvalue.json": "ApiBcErrorResponse",
  "envelope/error/modern.json": "ApiModernErrorResponse",
  "envelope/error/raw.json": "ApiModernErrorResponse",
  "envelope/warnings/bc.json": "ApiQueryResponse",
  "envelope/warnings/modern.json": "ApiQueryResponse",
  "extensions/betafeatures.json": "ApiQueryResponse",
  "extensions/categorytree.json": "ApiCategoryTreeResponse",
  "extensions/centralauthtoken.json": "ApiCentralAuthTokenResponse",
  "extensions/aggregategroups-add.json": "ApiAggregateGroupsResponse",
  "extensions/aggregategroups-associate.json": "ApiAggregateGroupsResponse",
  "extensions/aggregategroups-remove.json": "ApiAggregateGroupsResponse",
  "extensions/createlocalaccount.json": "ApiCreateLocalAccountResponse",
  "extensions/createlocalaccount-error.json": "ApiCentralAuthInBandErrorResponse",
  "extensions/deleteglobalaccount.json": "ApiDeleteGlobalAccountResponse",
  "extensions/deleteglobalaccount-error.json": "ApiBcErrorResponse",
  "extensions/globalallusers.json": "ApiQueryResponse",
  "extensions/globalgroups.json": "ApiQueryResponse",
  "extensions/globaluserrights-add.json": "ApiGlobalUserRightsResponse",
  "extensions/globalusers.json": "ApiQueryResponse",
  "extensions/globalusers-centralids.json": "ApiQueryResponse",
  "extensions/globalusers-invalid.json": "ApiQueryResponse",
  "extensions/globaluserrights-remove.json": "ApiGlobalUserRightsResponse",
  "extensions/groupreview.json": "ApiGroupReviewResponse",
  "extensions/languagestats.json": "ApiQueryResponse",
  "extensions/markfortranslation.json": "ApiMarkForTranslationResponse",
  "extensions/messagecollection.json": "ApiQueryResponse",
  "extensions/messagegroupsubscription-subscribe.json": "ApiMessageGroupSubscriptionResponse",
  "extensions/messagegroupsubscription-unsubscribe.json": "ApiMessageGroupSubscriptionResponse",
  "extensions/messagegroups.json": "ApiQueryResponse",
  "extensions/messagegroupstats.json": "ApiQueryResponse",
  "extensions/messagetranslations.json": "ApiQueryResponse",
  "extensions/searchtranslations.json": "ApiSearchTranslationsResponse",
  "extensions/setglobalaccountstatus-lock.json": "ApiSetGlobalAccountStatusResponse",
  "extensions/setglobalaccountstatus-noreason.json": "ApiSetGlobalAccountStatusResponse",
  "extensions/setglobalaccountstatus-unlock.json": "ApiSetGlobalAccountStatusResponse",
  "extensions/ttmserver.json": "ApiTtmServerResponse",
  "extensions/translatesandbox-create.json": "ApiTranslateSandboxCreateResponse",
  "extensions/translatesandbox-promote.json": "ApiTranslateSandboxActionResponse",
  "extensions/translationaids.json": "ApiTranslationAidsResponse",
  "extensions/translationentitysearch.json": "ApiTranslationEntitySearchResponse",
  "extensions/translationreview.json": "ApiTranslationReviewResponse",
  "extensions/translationstash-add.json": "ApiTranslationStashResponse",
  "extensions/translationstash-query.json": "ApiTranslationStashResponse",
  "extensions/translationstats.json": "ApiTranslationStatsResponse",
  "extensions/ulslocalization.json": "ApiUlsLocalizationResponse",
  "extensions/ulssetlang.json": "ApiUlsSetLanguageResponse",
  "extensions/wikisets.json": "ApiQueryResponse",
  "extensions/checkuser-actions.json": "ApiQueryResponse",
  "extensions/checkuser-ipusers.json": "ApiQueryResponse",
  "extensions/checkuser-userips.json": "ApiQueryResponse",
  "extensions/checkuserformattedblockinfo.json": "ApiQueryResponse",
  "extensions/checkuserformattedblockinfo-blocked.json": "ApiQueryResponse",
  "extensions/checkuserlog.json": "ApiQueryResponse",
  "extensions/discussiontoolspageinfo.json": "ApiDiscussionToolsPageInfoResponse",
  "extensions/discussiontoolspageinfo-activity.json": "ApiDiscussionToolsPageInfoResponse",
  "extensions/echocreateevent.json": "ApiEchoCreateEventResponse",
  "extensions/echomarkread.json": "ApiQueryResponse",
  "extensions/echomarkseen.json": "ApiQueryResponse",
  "extensions/editmassmessagelist.json": "ApiEditMassMessageListResponse",
  "extensions/gadgetcategories.json": "ApiQueryResponse",
  "extensions/gadgets.json": "ApiQueryResponse",
  "extensions/globalpreferences-change.json": "ApiGlobalPreferencesResponse",
  "extensions/globalpreferences.json": "ApiQueryResponse",
  "extensions/globalpreferenceoverrides-change.json": "ApiGlobalPreferenceOverridesResponse",
  "extensions/linterrors.json": "ApiQueryResponse",
  "extensions/linterstats.json": "ApiQueryResponse",
  "extensions/massmessage.json": "ApiMassMessageResponse",
  "extensions/mmcontent.json": "ApiQueryResponse",
  "extensions/oath.json": "ApiQueryResponse",
  "extensions/oathvalidate.json": "ApiOATHValidateResponse",
  "extensions/scribunto-console-error.json": "ApiScribuntoConsoleError",
  "extensions/scribunto-console.json": "ApiScribuntoConsoleNormal",
  "extensions/shortenurl.json": "ApiShortenUrlResponse",
  "extensions/sitematrix.json": "ApiSiteMatrixResponse",
  "extensions/spamblacklist-hit.json": "ApiSpamBlacklistResponse",
  "extensions/spamblacklist.json": "ApiSpamBlacklistResponse",
  "extensions/templatedata.json": "ApiTemplateDataResponse",
  "extensions/thank.json": "ApiThankResponse",
  "extensions/titleblacklist-hit.json": "ApiTitleBlacklistResponse",
  "extensions/titleblacklist.json": "ApiTitleBlacklistResponse",
  "extensions/transcodereset.json": "ApiTranscodeResetResponse",
  "extensions/transcodestatus.json": "ApiQueryResponse",
  "extensions/transcodestatus-145.json": "ApiQueryResponse",
  "extensions/transcodestatus-146.json": "ApiQueryResponse",
  "extensions/videoinfo.json": "ApiQueryResponse",
  "extensions/videoinfo-145.json": "ApiQueryResponse",
  "extensions/videoinfo-146.json": "ApiQueryResponse",
  "extensions/visualeditor.json": "ApiVisualEditorResponse",
  "extensions/wikilove.json": "ApiWikiLoveResponse",
};

/** Files under src/extensions/, by pack name (the `./ext/*` subpath segment). */
function extPacks(): string[] {
  return readdirSync(EXT_DIR)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => f.slice(0, -3));
}

/** Exported type names per source file, over the whole of `src/`. */
function exportedTypes(dir: string, out: Map<string, string[]>): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      exportedTypes(full, out);
    } else if (entry.name.endsWith(".ts")) {
      const names = [
        ...readFileSync(full, "utf8").matchAll(/^export (?:interface|type) (\w+)/gm),
      ].map((m) => m[1]!);
      if (names.length > 0) out.set(full, names);
    }
  }
}

function main(): void {
  // Walk fixtures and resolve each to its declared type.
  const fixtures: string[] = [];
  const walk = (dir: string, prefix: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
      if (entry.isDirectory()) walk(join(dir, entry.name), rel);
      else if (entry.name.endsWith(".json")) fixtures.push(rel);
    }
  };
  walk(FIXTURE_ROOT, "");

  const unresolved: string[] = [];
  const entries: { path: string; type: string; literal: string }[] = [];
  for (const path of fixtures.sort()) {
    const type =
      REGISTRY[path] ?? (path.startsWith("core/query/") ? "ApiQueryResponse" : undefined);
    if (!type) {
      unresolved.push(path);
      continue;
    }
    const literal = JSON.stringify(
      JSON.parse(readFileSync(join(FIXTURE_ROOT, path), "utf8")),
      null,
      1,
    );
    entries.push({ path, type, literal });
  }
  const stale = Object.keys(REGISTRY).filter((p) => !fixtures.includes(p));
  if (unresolved.length > 0 || stale.length > 0) {
    for (const p of unresolved) console.error(`UNREGISTERED fixture: ${p} — add it to REGISTRY`);
    for (const p of stale) console.error(`STALE registry entry: ${p} — fixture no longer exists`);
    process.exit(1);
  }

  // Map each declared type to the specifier that exports it, and pick one named
  // export per ext pack so a type-only import can activate its augmentation.
  const files = new Map<string, string[]>();
  exportedTypes(join(ROOT, "src"), files);
  const specifierOf = new Map<string, string>();
  for (const [file, names] of files) {
    const rel = file.slice(ROOT.length + 1).replaceAll("\\", "/");
    const specifier = rel.startsWith("src/extensions/")
      ? `${PKG_NAME}/ext/${rel.slice("src/extensions/".length, -3)}`
      : PKG_NAME;
    for (const name of names) specifierOf.set(name, specifier);
  }
  const packs = extPacks();
  const packActivator = new Map<string, string>();
  for (const pack of packs) {
    const names = files.get(join(EXT_DIR, `${pack}.ts`)) ?? [];
    packActivator.set(pack, names[0] ?? "");
  }

  const missing = [...new Set(entries.map((e) => e.type))].filter((t) => !specifierOf.has(t));
  if (missing.length > 0) {
    for (const t of missing) console.error(`UNKNOWN response type in REGISTRY: ${t}`);
    process.exit(1);
  }

  // Emit the scratch program: one `satisfies` per fixture, ext packs activated
  // via type-only imports (never side-effect imports — those emit runtime JS).
  const imports = new Map<string, Set<string>>();
  for (const pack of packs) {
    const specifier = `${PKG_NAME}/ext/${pack}`;
    if (!imports.has(specifier)) imports.set(specifier, new Set());
  }
  for (const { type } of entries) {
    const specifier = specifierOf.get(type)!;
    if (!imports.has(specifier)) imports.set(specifier, new Set());
    imports.get(specifier)!.add(type);
  }
  let source = "// Generated by scripts/audit-literals.ts — do not edit, not committed.\n";
  for (const [specifier, names] of [...imports].sort(([a], [b]) => a.localeCompare(b))) {
    const list = [...names].sort().join(", ");
    source +=
      list === ""
        ? `import type {} from "${specifier}";\n`
        : `import type { ${list} } from "${specifier}";\n`;
  }
  source += "\n";
  for (const [i, { path, type, literal }] of entries.entries()) {
    source += `// ${path}\nexport const _f${i} = ${literal} satisfies ${type};\n\n`;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, "literals.test-d.ts"), source);
  writeFileSync(
    join(OUT_DIR, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "es2022",
          lib: ["es2022"],
          module: "esnext",
          moduleResolution: "bundler",
          strict: true,
          verbatimModuleSyntax: true,
          types: [],
          skipLibCheck: true,
          noEmit: true,
          paths: {
            [PKG_NAME]: ["../../src/index.ts"],
            [`${PKG_NAME}/ext/*`]: ["../../src/extensions/*.ts"],
          },
        },
        include: ["literals.test-d.ts"],
      },
      null,
      2,
    ),
  );

  try {
    execFileSync(process.execPath, [TSC, "-p", join(OUT_DIR, "tsconfig.json")], {
      cwd: ROOT,
      stdio: "pipe",
    });
  } catch (err) {
    const out = (err as { stdout?: Buffer; stderr?: Buffer }).stdout;
    const errOut = (err as { stderr?: Buffer }).stderr;
    if (out) process.stdout.write(out);
    if (errOut) process.stderr.write(errOut);
    console.error(`audit:literals: FAILED (${entries.length} fixtures)`);
    process.exit(1);
  }
  console.log(`audit:literals: ${entries.length} fixtures clean`);
}

main();
