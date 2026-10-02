/**
 * Capture real `formatversion=2` responses for the auth-gated write actions
 * from a *local* MediaWiki instance into `tests/fixtures/core/`. Unlike
 * `fetch-fixtures.ts` (anonymous reads), these need a logged-in session, so
 * they run against a throwaway local install.
 *
 * Local bring-up, config and accounts: `scripts/container/README.md`.
 * Run: `pnpm exec tsx scripts/capture-write-fixtures.ts`
 * Env: MW_CONTAINER (default `mw-fixture`).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { call, callForm, type Creds, login, sh, SUF, token } from "./capture-client";

const FIXTURES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "tests", "fixtures");

const CAP: Creds = { jar: "/tmp/mwcap", user: "capadmin", pass: "CapAdminPass2026" };
const EDIT: Creds = { jar: "/tmp/mwedit", user: "edituser", pass: "EditUserPass2026" };

/** Write a parsed response as a fixture; leading-underscore file = side-effect only. */
function emit(outPath: string, body: unknown): void {
  if (outPath.split("/").pop()?.startsWith("_")) return;
  const full = join(FIXTURES_DIR, outPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, `${JSON.stringify(body, null, 2)}\n`, "utf8");
  console.log(`[capture] wrote ${outPath}`);
}

/**
 * Multipart POST on the sysop session — `action=upload` only.
 *
 * The token goes over as a *file* value (`token=</tmp/ct.txt`) because its trailing
 * `+\` is not safe inside a `-F "name=value"` argument, which curl parses for
 * escapes and `@`/`<` markers.
 */
const uploadForm = (fields: string): unknown => callForm(CAP, fields);

login(CAP);
const CT = token(CAP, "csrf");

// --- action=clientlogin (the repos' login path; uses its own fresh session) ---
const CL: Creds = { jar: "/tmp/mwcl", user: CAP.user, pass: CAP.pass };
sh(`rm -f ${CL.jar}`);
const clt = token(CL, "login");
emit(
  "core/clientlogin/clientlogin.json",
  call(
    CL,
    `-d "action=clientlogin" --data-urlencode "username=$LG" --data-urlencode "password=$PW" --data-urlencode "logintoken=$LT" -d "loginreturnurl=http://localhost:8080/"`,
    { LG: CL.user, PW: CL.pass, LT: clt },
  ),
);
/** Authenticated POST for CAP, writing to `outPath`. */
const cap = (outPath: string, post: string): void =>
  emit(outPath, call(CAP, `--data-urlencode "token=$CT" ${post}`, { CT }));
const capEdit = (out: string, title: string, text: string, extra = ""): void =>
  cap(
    out,
    `-d "action=edit" --data-urlencode "title=${title}" --data-urlencode "text=${text}" ${extra}`,
  );

// --- action=edit outcomes ---
capEdit(
  "core/edit/create.json",
  "Fixture edit target $SUF",
  "Hello world first line.",
  '-d "summary=create fixture"',
);
capEdit("core/edit/nochange.json", "Fixture edit target $SUF", "Hello world first line.");
capEdit(
  "core/edit/newsection.json",
  "Fixture edit target $SUF",
  "Section body text.",
  '-d "section=new" --data-urlencode "sectiontitle=A new section"',
);

// --- action=move outcomes ---
capEdit("_mk-mv1", "MF $SUF", "content to move");
cap(
  "core/move/noredirect.json",
  `-d "action=move" -d "noredirect=1" --data-urlencode "from=MF $SUF" --data-urlencode "to=MT $SUF" --data-urlencode "reason=fixture move"`,
);
capEdit("_mk-mv2", "MF2 $SUF", "content to move 2");
capEdit("_mk-mv2-talk", "Talk:MF2 $SUF", "discussion");
cap(
  "core/move/redirect.json",
  `-d "action=move" -d "movetalk=1" --data-urlencode "from=MF2 $SUF" --data-urlencode "to=MT2 $SUF" --data-urlencode "reason=fixture move with redirect"`,
);
capEdit("_mk-mv3", "User:Mfs $SUF", "root");
capEdit("_mk-mv3-sub", "User:Mfs $SUF/Sub", "sub");
cap(
  "core/move/subpages.json",
  `-d "action=move" -d "movesubpages=1" --data-urlencode "from=User:Mfs $SUF" --data-urlencode "to=User:Mtd $SUF" --data-urlencode "reason=fixture move subpages ok"`,
);
capEdit("_mk-mv4", "MF3 $SUF", "root");
cap(
  "core/move/subpages-errors.json",
  `-d "action=move" -d "movesubpages=1" --data-urlencode "from=MF3 $SUF" --data-urlencode "to=MT3 $SUF" --data-urlencode "reason=fixture move subpages"`,
);

// --- action=purge (no token; result is a per-title array) ---
emit(
  "core/purge/purge.json",
  call(CAP, `-d "action=purge" --data-urlencode "titles=Fixture edit target $SUF"`),
);
// Requesting the same title unnormalized (underscores, lowercase first letter)
// also surfaces the pageSet's root-level `normalized` pairs.
emit(
  "core/purge/purge-normalized.json",
  call(CAP, `-d "action=purge" --data-urlencode "titles=fixture_edit_target_$SUF"`),
);

// --- action=delete / undelete ---
capEdit("_mk-del", "Delete target $SUF", "to delete");
cap(
  "core/delete/delete.json",
  `-d "action=delete" --data-urlencode "title=Delete target $SUF" --data-urlencode "reason=fixture delete"`,
);
cap(
  "core/undelete/undelete.json",
  `-d "action=undelete" --data-urlencode "title=Delete target $SUF" --data-urlencode "reason=fixture undelete"`,
);
// Scheduled deletion: with `$wgDeleteRevisionsBatchSize` at 1, a multi-revision
// page is queued for the job queue instead of deleted inline, flipping the
// response to `scheduled` (no `logid`) plus a "be patient" warning.
sh(
  `cp /var/www/html/LocalSettings.php /tmp/LocalSettings.bak && echo '$wgDeleteRevisionsBatchSize = 1;' >> /var/www/html/LocalSettings.php`,
);
capEdit("_mk-dels1", "Delete scheduled target $SUF", "first revision for scheduled deletion");
capEdit("_mk-dels2", "Delete scheduled target $SUF", "second revision for scheduled deletion");
cap(
  "core/delete/delete-scheduled.json",
  `-d "action=delete" --data-urlencode "title=Delete scheduled target $SUF" --data-urlencode "reason=fixture scheduled delete"`,
);
sh(`cp /tmp/LocalSettings.bak /var/www/html/LocalSettings.php`);

// --- action=block / unblock (target an IP via `user`) ---
cap(
  "core/block/block.json",
  `-d "action=block" --data-urlencode "user=10.0.0.99" -d "expiry=1 week" -d "nocreate=1" --data-urlencode "reason=fixture block"`,
);
cap(
  "core/unblock/unblock.json",
  `-d "action=unblock" --data-urlencode "user=10.0.0.99" --data-urlencode "reason=fixture unblock"`,
);

// --- action=watch / unwatch (uses the dedicated watch token; `titles` plural) ---
const WT = token(CAP, "watch");
const watch = (out: string, post: string): void =>
  emit(out, call(CAP, `--data-urlencode "token=$WT" ${post}`, { WT }));
watch(
  "core/watch/watch.json",
  `-d "action=watch" --data-urlencode "titles=Fixture edit target $SUF"`,
);
watch(
  "core/watch/unwatch.json",
  `-d "action=watch" -d "unwatch=1" --data-urlencode "titles=Fixture edit target $SUF"`,
);

// --- prop=info, auth-gated inprops (needs a session that actually watches one of
// the titles; `Main Page` stays unwatched so both shapes land in one sample).
// `readable`/`preload`/`editintro` are deliberately not requested: 1.43 marks them
// deprecated and warns.
watch("_mk-watch-info", `-d "action=watch" --data-urlencode "titles=Fixture edit target $SUF"`);
emit(
  "core/query/info-auth.json",
  call(
    CAP,
    `-d "action=query" -d "prop=info" --data-urlencode "titles=Fixture edit target $SUF|Main Page" -d "inprop=watched|watchers|visitingwatchers|notificationtimestamp"`,
  ),
);

// --- prop=info: `preloadcontent` / `editintro` ---
// Both require the query to hold exactly one page/revision (core dies with
// `invalidparammix` otherwise), and `preloadcontent` only emits for a title that
// does not exist yet. `editintro` needs the interface message to exist.
capEdit("_mk-editintro", "MediaWiki:Editintro", "Please explain why you are editing this page.");
emit(
  "core/query/info-preload.json",
  call(
    CAP,
    `-d "action=query" -d "prop=info" --data-urlencode "titles=Preload target $SUF" -d "inprop=preloadcontent|editintro"`,
  ),
);

// --- list=deletedrevs (deprecated since 1.25) ---
// Its `drprop` names are pre-fv2 (`revid`/`len`/`minor`, not `ids`/`size`/`flags`);
// the sample is captured further down, once revisions have actually been archived.

// --- action=rollback (dedicated rollback token; needs edituser's latest revision) ---
capEdit("_mk-rb", "Rollback target $SUF", "rev1 by capadmin");
login(EDIT);
const ET = token(EDIT, "csrf");
emit(
  "_mk-rb2",
  call(
    EDIT,
    `--data-urlencode "token=$ET" -d "action=edit" --data-urlencode "title=Rollback target $SUF" --data-urlencode "text=rev2 by edituser"`,
    { ET },
  ),
);
const RT = token(CAP, "rollback");
emit(
  "core/rollback/rollback.json",
  call(
    CAP,
    `--data-urlencode "token=$RT" -d "action=rollback" --data-urlencode "title=Rollback target $SUF" --data-urlencode "user=Edituser"`,
    { RT },
  ),
);

// --- action=patrol (edituser's edit is unpatrolled; capadmin patrols it by rcid) ---
const ET2 = token(EDIT, "csrf");
emit(
  "_mk-patrol-edit",
  call(
    EDIT,
    `--data-urlencode "token=$ET2" -d "action=edit" --data-urlencode "title=Patrol target $SUF" --data-urlencode "text=unpatrolled edit"`,
    { ET2 },
  ),
);
const rc = call(
  CAP,
  `-d "action=query" -d "list=recentchanges" -d "rcshow=!patrolled" --data-urlencode "rcuser=Edituser" -d "rclimit=1" -d "rcprop=ids"`,
) as { query?: { recentchanges?: { rcid?: number }[] } };
const rcid = rc.query?.recentchanges?.[0]?.rcid;
if (rcid) {
  const PT = token(CAP, "patrol");
  emit(
    "core/patrol/patrol.json",
    call(CAP, `--data-urlencode "token=$PT" -d "action=patrol" -d "rcid=$RCID"`, {
      PT,
      RCID: String(rcid),
    }),
  );
} else {
  console.log("[capture] patrol skipped (no unpatrolled revision found)");
}

// --- prop=flagged (FlaggedRevs; a local-only extension read, no token needed) ---
capEdit("_mk-flagged", "Flagged revs $SUF", "main-namespace content");
emit(
  "core/query/flagged.json",
  call(CAP, `-d "action=query" -d "prop=flagged" --data-urlencode "titles=Flagged revs $SUF"`),
);

// --- action=options (optionname/optionvalue; success is the string "success") ---
// Toggle diffonly by the run's parity so a change is registered every time.
emit(
  "core/options/options.json",
  call(
    CAP,
    `--data-urlencode "token=$CT" -d "action=options" -d "optionname=diffonly" -d "optionvalue=$OV"`,
    {
      CT,
      OV: String(Number(SUF) % 2),
    },
  ),
);

// --- action=protect (sysop; protections=type=level[|...], expiry per level) ---
capEdit("_mk-prot", "Protect target $SUF", "content to protect");
emit(
  "core/protect/protect.json",
  call(
    CAP,
    `--data-urlencode "token=$CT" -d "action=protect" --data-urlencode "title=Protect target $SUF" -d "protections=edit=sysop|move=sysop" --data-urlencode "expiry=1 week|infinity" --data-urlencode "reason=fixture protect"`,
    { CT },
  ),
);
// `cascade=1` adds the root-level `cascade` flag next to `protections`.
capEdit("_mk-prot-c", "Protect cascade target $SUF", "content to protect with cascade");
emit(
  "core/protect/protect-cascade.json",
  call(
    CAP,
    `--data-urlencode "token=$CT" -d "action=protect" --data-urlencode "title=Protect cascade target $SUF" -d "protections=edit=sysop|move=sysop" --data-urlencode "expiry=1 week|infinite" -d "cascade=1" --data-urlencode "reason=fixture protect cascade"`,
    { CT },
  ),
);

// --- action=revisiondelete: hide a revision's comment+user, then read the ---
// suppressed prop=revisions shape back (fills the revision-delete gap).
capEdit("_mk-rd1", "Revdel target $SUF", "first revision text");
capEdit("_mk-rd2", "Revdel target $SUF", "second revision text");
const rdq = call(
  CAP,
  `-d "action=query" -d "prop=revisions" -d "rvprop=ids" --data-urlencode "titles=Revdel target $SUF" -d "rvdir=older"`,
) as { query?: { pages?: { revisions?: { revid?: number }[] }[] } };
const rdIds = (rdq.query?.pages?.[0]?.revisions ?? []).map((r) => r.revid).filter(Boolean);
if (rdIds.length) {
  const rid = String(rdIds[0]);
  emit(
    "core/revisiondelete/revisiondelete.json",
    call(
      CAP,
      `--data-urlencode "token=$CT" -d "action=revisiondelete" -d "type=revision" --data-urlencode "target=Revdel target $SUF" -d "ids=$RID" -d "hide=comment|user" --data-urlencode "reason=fixture revdel"`,
      { CT, RID: rid },
    ),
  );
  emit(
    "core/query/revisions-suppressed.json",
    call(
      CAP,
      `-d "action=query" -d "prop=revisions" --data-urlencode "titles=Revdel target $SUF" -d "rvprop=ids|timestamp|user|comment|content|flags|size|roles" -d "rvslots=main" -d "rvlimit=5" -d "rvdir=older"`,
    ),
  );
} else {
  console.log("[capture] revisiondelete skipped (no revisions found)");
}

// --- list=watchlist (auth: capadmin watches a page above, then reads own feed) ---
emit(
  "core/query/watchlist.json",
  call(
    CAP,
    `-d "action=query" -d "list=watchlist" -d "wllimit=5" -d "wlprop=ids|title|timestamp|user|userid|comment|parsedcomment|patrol|sizes|flags|notificationtimestamp|expiry"`,
  ),
);

// --- list=protectedtitles (auth: needs a pre-emptive protection of a missing title) ---
cap(
  "_mk-protected-title",
  `-d "action=protect" --data-urlencode "title=Protected title $SUF" -d "protections=create=sysop" -d "expiry=infinite" --data-urlencode "reason=fixture protected title"`,
);
emit(
  "core/query/protectedtitles.json",
  call(
    CAP,
    `-d "action=query" -d "list=protectedtitles" -d "ptprop=comment|parsedcomment|expiry|level|timestamp|user|userid" -d "ptlimit=5"`,
  ),
);

// --- list=watchlistraw (auth: the raw watch table; edit fields live in list=watchlist) ---
emit(
  "core/query/watchlistraw.json",
  call(CAP, `-d "action=query" -d "list=watchlistraw" -d "wrprop=changed" -d "wrlimit=5"`),
);

// --- prop=deletedrevisions / list=alldeletedrevisions (auth: deletedhistory) ---
// 1.43 core cannot delete a *single* revision: `action=delete` has no `type`/`ids`,
// and `action=revisiondelete` only hides fields. So the fixture is built by deleting
// the page and then `action=undelete`-ing a subset chosen by `timestamps` — hence
// the pauses between edits (revisions made within the same second share a timestamp).
capEdit("_mk-drv1", "Deleted revisions target $SUF", "first revision text");
sh("sleep 1.2");
capEdit("_mk-drv2", "Deleted revisions target $SUF", "second revision text");
sh("sleep 1.2");
capEdit("_mk-drv3", "Deleted revisions target $SUF", "third revision text");
cap(
  "_del-page",
  `-d "action=delete" --data-urlencode "title=Deleted revisions target $SUF" --data-urlencode "reason=fixture deleted revisions"`,
);
const drvq = call(
  CAP,
  `-d "action=query" -d "prop=deletedrevisions" --data-urlencode "titles=Deleted revisions target $SUF" -d "drvprop=ids|timestamp" -d "drvlimit=5"`,
) as { query?: { pages?: { deletedrevisions?: { timestamp?: string }[] }[] } };
const drvAll = drvq.query?.pages?.[0]?.deletedrevisions ?? [];
// Restore everything except the oldest revision, leaving exactly one deleted.
const drvStamps = drvAll
  .slice(0, -1)
  .map((r) => r.timestamp)
  .filter((t): t is string => Boolean(t))
  .join("|");
if (drvStamps) {
  emit(
    "_undel-subset",
    call(
      CAP,
      `--data-urlencode "token=$CT" -d "action=undelete" --data-urlencode "title=Deleted revisions target $SUF" --data-urlencode "timestamps=$STAMPS" --data-urlencode "reason=fixture restored revisions"`,
      { CT, STAMPS: drvStamps },
    ),
  );
  emit(
    "core/query/deletedrevisions.json",
    call(
      CAP,
      `-d "action=query" -d "prop=deletedrevisions" --data-urlencode "titles=Deleted revisions target $SUF" -d "drvprop=ids|timestamp|user|userid|size|sha1|contentmodel|comment|parsedcomment|tags|roles|slotsize|slotsha1" -d "drvslots=main" -d "drvlimit=5"`,
    ),
  );
  emit(
    "core/query/alldeletedrevisions.json",
    call(
      CAP,
      // `adrprefix` keeps the sample to the pages this script creates, so it is
      // reproducible regardless of other deleted revisions lying around. It cannot
      // be combined with `adruser`, which is why the author is not filtered on.
      `-d "action=query" -d "list=alldeletedrevisions" -d "adrprefix=Deleted revisions target" -d "adrnamespace=0" -d "adrprop=ids|timestamp|user|userid|size|sha1|contentmodel|comment|parsedcomment|tags|roles" -d "adrslots=main" -d "adrlimit=5"`,
    ),
  );
} else {
  console.log("[capture] deletedrevisions skipped (no deleted revisions found)");
}

// --- list=deletedrevs, reading the revisions the block above archived ---
// The fixture keeps a `warnings` block on purpose: core itself reports the module as
// deprecated here, which is the fact the type documents. `timestamp` is not a
// `drprop` value (it is returned unconditionally), so it must not be requested.
emit(
  "core/query/deletedrevs.json",
  call(
    CAP,
    `-d "action=query" -d "list=deletedrevs" -d "drnamespace=0" -d "drprefix=Deleted revisions target" -d "drprop=revid|parentid|user|userid|comment|parsedcomment|minor|len|sha1|tags" -d "drlimit=5"`,
  ),
);

// --- uploads: feed list=mystashedfiles and list=filearchive ---
// Needs `$wgEnableUploads = true` in this container (the image default is false);
// `filearchive` and `uploadstash` tables already exist. A real 1x1 PNG is written
// from base64 because the container has no image generator, so the handlers report
// genuine mime/dimensions/bitdepth rather than a synthesized blob.
const PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";
sh(`printf %s ${PNG_B64} | base64 -d > /tmp/fixture.png`);
sh(`printf %s "$CT" > /tmp/ct.txt`, { CT });

// Stash without publishing: exactly what `list=mystashedfiles` enumerates.
uploadForm(
  `-F "action=upload" -F "filename=Fixture stash $SUF.png" -F "comment=fixture stashed file" -F "stash=1" -F "token=</tmp/ct.txt" -F "file=@/tmp/fixture.png"`,
);
const msf = call(
  CAP,
  `-d "action=query" -d "list=mystashedfiles" -d "msfprop=size|type" -d "msflimit=5"`,
) as { query?: { mystashedfiles?: { filekey?: string }[] } };
emit("core/query/mystashedfiles.json", msf);

// A published upload that is then deleted: the file moves to `filearchive`.
uploadForm(
  `-F "action=upload" -F "filename=Fixture archive $SUF.png" -F "comment=fixture archived file" -F "text={{int:license-preview}}" -F "token=</tmp/ct.txt" -F "file=@/tmp/fixture.png"`,
);
cap(
  "_del-file-page",
  `-d "action=delete" --data-urlencode "title=File:Fixture archive $SUF.png" --data-urlencode "reason=fixture archived upload"`,
);
emit(
  "core/query/filearchive.json",
  call(
    CAP,
    `-d "action=query" -d "list=filearchive" -d "faprefix=Fixture archive" -d "faprop=archivename|timestamp|user|size|dimensions|sha1|mime|mediatype|bitdepth|description|parseddescription|metadata" -d "falimit=5"`,
  ),
);

// --- prop=stashimageinfo: metadata of a stashed file, keyed by its filekey ---
// 1.43's `siiprop` is a subset of `iiprop`: `user`, `userid` and `mediatype` are
// not accepted values here, so asking for them would leave a warning in the sample.
const stashKey = msf.query?.mystashedfiles?.[0]?.filekey;
if (stashKey) {
  emit(
    "core/query/stashimageinfo.json",
    call(
      CAP,
      `-d "action=query" -d "prop=stashimageinfo" --data-urlencode "siifilekey=$KEY" -d "siiprop=timestamp|size|dimensions|sha1|mime|bitdepth|metadata"`,
      { KEY: stashKey },
    ),
  );
} else {
  console.log("[capture] stashimageinfo skipped (no stashed file found)");
}

// --- prop=duplicatefiles: two published files sharing one sha1 ---
// Fixed names so repeated runs keep the pair; `ignorewarnings` absorbs the
// “already exists” answer once the file is there.
for (const name of ["Fixture duplicate a", "Fixture duplicate b"]) {
  uploadForm(
    `-F "action=upload" -F "filename=${name}.png" -F "comment=fixture duplicate file" -F "ignorewarnings=1" -F "token=</tmp/ct.txt" -F "file=@/tmp/fixture.png"`,
  );
}
emit(
  "core/query/duplicatefiles.json",
  call(
    CAP,
    `-d "action=query" -d "prop=duplicatefiles" -d "titles=File:Fixture duplicate a.png" -d "dflimit=5"`,
  ),
);

// --- list=querypage: a report whose rows also name the redirect target ---
capEdit("_mk-rpt-a", "Redirect report a $SUF", "#REDIRECT [[Redirect report b $SUF]]");
capEdit("_mk-rpt-b", "Redirect report b $SUF", "#REDIRECT [[Redirect report missing $SUF]]");
emit(
  "core/query/querypage-double-redirect.json",
  call(CAP, `-d "action=query" -d "list=querypage" -d "qppage=DoubleRedirects" -d "qplimit=5"`),
);

console.log("[capture] done");
