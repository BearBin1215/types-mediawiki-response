/**
 * Capture real `formatversion=2` responses for the **remaining MediaWiki core
 * action / meta modules** the package does not yet type, from the local 1.43
 * instance. Exploratory: dumps raw responses under `.mw-scratch/gaps/` for
 * inspection; a usable shape is then promoted into `tests/fixtures/core/` and
 * the type is hand-written from it.
 *
 * Local bring-up, config and accounts: `scripts/container/README.md`.
 * Run: `pnpm exec tsx scripts/capture-core-gaps.ts`
 * Env: MW_CONTAINER (default `mw-fixture`).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { call, callForm as form, type Creds, login, sh, SUF, token } from "./capture-client";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", ".mw-scratch", "gaps");
mkdirSync(OUT, { recursive: true });

// Two distinct valid PNGs (GD is absent in the container), so a file can gain a
// second version and expose an archived older one for `action=filerevert`.
const PNG_A =
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEUlEQVR4nGP4z8DwH4QZYAwAR8oH+WdZbrcAAAAASUVORK5CYII=";
const PNG_B =
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEElEQVR4nGNgYPj/H4KhDAA/0gf5tBJPzQAAAABJRU5ErkJggg==";

const CAP: Creds = { jar: "/tmp/mwcap", user: "capj", pass: "CapJPass2026" };
const ANON: Creds = { jar: "/tmp/mwanon", user: "", pass: "" };

/** Dump a captured response, tagged with its module name. */
function dump(name: string, body: unknown): void {
  writeFileSync(join(OUT, `${name}.json`), `${JSON.stringify(body, null, 2)}\n`, "utf8");
  console.log(`[gap] ${name}`);
}

// Ensure the capture account has the sysop/bureaucrat rights the privileged
// modules need (LocalSettings already grants sysop pagelang/import/importupload
// and the revision-delete rights). Added via SQL: grantSystemPermissions.php is
// absent here, and recreating the user each run would churn. base64 keeps the
// quotes safe through the container shell round-trip.
const groupSql = [
  "INSERT OR IGNORE INTO user_groups (ug_user,ug_group) SELECT user_id,'sysop' FROM user WHERE user_name='Capj';",
  "INSERT OR IGNORE INTO user_groups (ug_user,ug_group) SELECT user_id,'bureaucrat' FROM user WHERE user_name='Capj';",
].join("\n");
sh(
  `printf %s ${Buffer.from(groupSql, "utf8").toString("base64")} | base64 -d | php /var/www/html/maintenance/sql.php >/dev/null 2>&1 || true`,
);
login(CAP);
const CT = token(CAP, "csrf");
const cap = (name: string, post: string, env: Record<string, string> = {}): void =>
  dump(name, call(CAP, `--data-urlencode "token=$CT" ${post}`, { CT, ...env }));

/** Create/refresh a page owned by CAP; title/text are interpolated in JS (no `$SUF`). */
const edit = (title: string, text: string, extra = ""): unknown =>
  call(
    CAP,
    `--data-urlencode "token=$CT" -d "action=edit" --data-urlencode "title=$T" --data-urlencode "text=$X" ${extra}`,
    { CT, T: title, X: text },
  );

const latestRevid = (title: string): number | undefined => {
  const q = call(
    CAP,
    `-d "action=query" -d "prop=revisions" -d "rvprop=ids" --data-urlencode "titles=$T"`,
    { T: title },
  ) as { query?: { pages?: { revisions?: { revid?: number }[] }[] } };
  return q.query?.pages?.[0]?.revisions?.[0]?.revid;
};

// ============================================================================
// checktoken — anon: valid, valid+age, invalid
// ============================================================================
sh("rm -f /tmp/mwanon");
const ACT = token(ANON, "csrf");
dump(
  "checktoken-valid",
  call(ANON, `-d "action=checktoken" -d "type=csrf" --data-urlencode "token=$T"`, { T: ACT }),
);
dump(
  "checktoken-age",
  call(
    ANON,
    `-d "action=checktoken" -d "type=csrf" --data-urlencode "token=$T" -d "maxtokenage=999999"`,
    { T: ACT },
  ),
);
dump(
  "checktoken-invalid",
  call(ANON, `-d "action=checktoken" -d "type=csrf" --data-urlencode "token=deadbeef+\\\\"`),
);

// ============================================================================
// clearhasmsg — login-gated; takes NO token (passing one draws a warning)
// ============================================================================
dump("clearhasmsg", call(CAP, `-d "action=clearhasmsg"`));

// ============================================================================
// validatepassword — good + weak
// ============================================================================
dump(
  "validatepassword-good",
  call(CAP, `-d "action=validatepassword" --data-urlencode "password=$PW"`, { PW: CAP.pass ?? "" }),
);
dump(
  "validatepassword-weak",
  call(CAP, `-d "action=validatepassword" --data-urlencode "password=x"`),
);

// ============================================================================
// createaccount — logged-in, prefixed params, createaccount token.
// Run first so `userrights` below has a fresh, known-deficient account to act on
// (a real group change populates `added` / `changed`, which a no-op would omit).
// ============================================================================
const CAT = token(CAP, "createaccount");
const GAPU = `GapRu${SUF}`;
dump(
  "createaccount",
  call(
    CAP,
    `--data-urlencode "createtoken=$T" -d "action=createaccount" --data-urlencode "name=$N" --data-urlencode "password=$P" --data-urlencode "retype=$P" --data-urlencode "createreturnurl=http://localhost:8080/"`,
    { T: CAT, N: GAPU, P: "GapPass2026xyz" },
  ),
);

// ============================================================================
// userrights — needs the userrights token. Target a freshly promoted user so
// the change is real (a populated `added` / `changed`; a no-op omits them).
// ============================================================================
const RNU = `GapU${SUF}`;
sh(
  `cd /var/www/html && php maintenance/createAndPromote.php ${RNU} 'GapTarget2026xyz' >/dev/null 2>&1`,
);
const URT = token(CAP, "userrights");
dump(
  "userrights",
  call(
    CAP,
    `--data-urlencode "token=$URT" -d "action=userrights" --data-urlencode "user=$U" -d "add=bot" --data-urlencode "reason=fixture userrights"`,
    { URT, U: RNU },
  ),
);

// ============================================================================
// changecontentmodel
// ============================================================================
edit(`Gap ccm ${SUF}`, "var x = 1;");
cap(
  "changecontentmodel",
  `-d "action=changecontentmodel" --data-urlencode "title=$T" -d "model=javascript" --data-urlencode "summary=fixture ccm"`,
  { T: `Gap ccm ${SUF}` },
);

// ============================================================================
// setpagelanguage (needs $wgPageLanguageUseDB)
// ============================================================================
edit(`Gap spl ${SUF}`, "content for page language");
cap(
  "setpagelanguage",
  `-d "action=setpagelanguage" --data-urlencode "title=$T" -d "lang=de" --data-urlencode "reason=fixture spl"`,
  { T: `Gap spl ${SUF}` },
);

// ============================================================================
// managetags create → tag apply → managetags delete. The tag must still be
// defined when `action=tag` applies it (a deleted tag is "not manually
// applicable" → badtags error), so the delete runs last.
// ============================================================================
cap(
  "managetags-create",
  `-d "action=managetags" -d "operation=create" --data-urlencode "tag=$TAG" --data-urlencode "reason=fixture tag create"`,
  { TAG: `gap-tag-${SUF}` },
);
edit(`Gap tag ${SUF}`, "revision to tag");
const tagRevid = latestRevid(`Gap tag ${SUF}`);
if (tagRevid) {
  cap(
    "tag",
    `-d "action=tag" -d "revid=$RID" --data-urlencode "add=$TAG" --data-urlencode "reason=fixture tag"`,
    { RID: String(tagRevid), TAG: `gap-tag-${SUF}` },
  );
} else console.log("[gap] tag skipped (no revid)");
cap(
  "managetags-delete",
  `-d "action=managetags" -d "operation=delete" --data-urlencode "tag=$TAG"`,
  {
    TAG: `gap-tag-${SUF}`,
  },
);

// ============================================================================
// mergehistory
// ============================================================================
edit(`Gap mh src ${SUF}`, "source page history");
sh("sleep 1.2");
edit(`Gap mh dst ${SUF}`, "destination page history");
cap(
  "mergehistory",
  `-d "action=mergehistory" --data-urlencode "from=$FROM" --data-urlencode "to=$TO" --data-urlencode "reason=fixture mergehistory"`,
  { FROM: `Gap mh src ${SUF}`, TO: `Gap mh dst ${SUF}` },
);

// ============================================================================
// setnotificationtimestamp — watch a live page first
// ============================================================================
const WT = token(CAP, "watch");
call(CAP, `--data-urlencode "token=$WT" -d "action=watch" --data-urlencode "titles=$T"`, {
  WT,
  T: `Gap spl ${SUF}`,
});
dump(
  "setnotificationtimestamp",
  call(
    CAP,
    `--data-urlencode "token=$CT" -d "action=setnotificationtimestamp" --data-urlencode "titles=$T"`,
    { CT, T: `Gap spl ${SUF}` },
  ),
);

// ============================================================================
// emailuser — edituser has a confirmed email (set via resetUserEmail.php)
// ============================================================================
cap(
  "emailuser",
  `-d "action=emailuser" --data-urlencode "target=edituser" --data-urlencode "subject=fixture mail" --data-urlencode "text=hello from the fixture"`,
);

// ============================================================================
// resetpassword
// ============================================================================
cap("resetpassword", `-d "action=resetpassword" --data-urlencode "user=edituser"`);

// ============================================================================
// changeauthenticationdata / removeauthenticationdata — AuthManager, prefixed
// ============================================================================
const CHANGE_REQ = JSON.stringify({
  email: { type: "email", data: { email: `gap-${SUF}@example.invalid` } },
});
dump(
  "changeauthenticationdata",
  call(
    CAP,
    `--data-urlencode "changeauthtoken=$CT2" --data-urlencode "changeauthrequest=$R" -d "action=changeauthenticationdata"`,
    { CT2: CT, R: CHANGE_REQ },
  ),
);
const REMOVE_REQ = JSON.stringify({ email: { type: "email", data: { email: "remove" } } });
dump(
  "removeauthenticationdata",
  call(
    CAP,
    `-d "action=removeauthenticationdata" --data-urlencode "token=$CT2" --data-urlencode "request=$R"`,
    { CT2: CT, R: REMOVE_REQ },
  ),
);

// acquiretempusername / linkaccount / unlinkaccount are core *modules* but their
// success requires the TempUser / CentralAuth extensions (not in a no-extension
// install), so they are intentionally not captured or modeled here.

// ============================================================================
// authmanagerinfo (meta) — anon, prefixed `amirequestsfor`
// ============================================================================
dump(
  "authmanagerinfo",
  call(ANON, `-d "action=query" -d "meta=authmanagerinfo" -d "amirequestsfor=create"`),
);

// ============================================================================
// upload / filerevert / imagerotate / stashedit / import — file & content
// ============================================================================
sh(`printf %s ${PNG_A} | base64 -d > /tmp/gap-a.png`);
sh(`printf %s ${PNG_B} | base64 -d > /tmp/gap-b.png`);
sh(`printf %s "$CT" > /tmp/ct.txt`, { CT });

dump(
  "upload",
  form(
    CAP,
    `-F "action=upload" -F "filename=Gap up ${SUF}.png" -F "comment=fixture upload" -F "text=fixture upload page" -F "token=</tmp/ct.txt" -F "file=@/tmp/gap-a.png"`,
  ),
);

// two distinct versions under one name -> an archived older one to revert to
form(
  CAP,
  `-F "action=upload" -F "filename=Gap fr ${SUF}.png" -F "comment=fixture v1" -F "token=</tmp/ct.txt" -F "file=@/tmp/gap-a.png"`,
);
form(
  CAP,
  `-F "action=upload" -F "filename=Gap fr ${SUF}.png" -F "comment=fixture v2" -F "ignorewarnings=1" -F "token=</tmp/ct.txt" -F "file=@/tmp/gap-b.png"`,
);
const ia = call(
  CAP,
  `-d "action=query" -d "prop=imageinfo" -d "iiprop=timestamp|archivename|sha1" -d "iilimit=max" --data-urlencode "titles=$T"`,
  { T: `File:Gap fr ${SUF}.png` },
) as { query?: { pages?: { imageinfo?: { archivename?: string }[] }[] } };
const arch = ia.query?.pages?.[0]?.imageinfo?.find((x) => x.archivename);
if (arch?.archivename) {
  cap(
    "filerevert",
    `-d "action=filerevert" --data-urlencode "filename=$FN" --data-urlencode "archivename=$AN" --data-urlencode "comment=fixture revert"`,
    { FN: `Gap fr ${SUF}.png`, AN: arch.archivename },
  );
} else console.log("[gap] filerevert skipped (no archived version)");

// rotate a freshly uploaded unique file
cap("imagerotate", `-d "action=imagerotate" --data-urlencode "titles=$T" -d "rotation=90"`, {
  T: `File:Gap up ${SUF}.png`,
});

// stashedit needs a baserevid
edit(`Gap se ${SUF}`, "stashed edit base");
const seBase = latestRevid(`Gap se ${SUF}`);
if (seBase) {
  cap(
    "stashedit",
    `-d "action=stashedit" --data-urlencode "title=$T" --data-urlencode "text=$X" -d "contentmodel=wikitext" -d "contentformat=text/x-wiki" -d "baserevid=$BR" -d "section=new" --data-urlencode "sectiontitle=Gap stashed"`,
    { T: `Gap se ${SUF}`, X: "stashed new text", BR: String(seBase) },
  );
} else console.log("[gap] stashedit skipped (no baserevid)");

// import via multipart XML
const importXml = [
  '<mediawiki xmlns="http://www.mediawiki.org/xml/export-0.11/" version="0.11" xml:lang="en">',
  "<siteinfo><sitename>GapWiki</sitename><dbname>gap</dbname><base>http://localhost/Main_Page</base><generator>MediaWiki 1.43</generator></siteinfo>",
  "<page>",
  `<title>Gap imported ${SUF}</title>`,
  "<ns>0</ns>",
  "<revision>",
  "<id>1</id>",
  "<timestamp>2024-01-01T00:00:00Z</timestamp>",
  "<contributor><username>GapImporter</username></contributor>",
  "<comment>fixture import</comment>",
  '<text xml:space="preserve">Imported content for the fixture.</text>',
  "</revision>",
  "</page>",
  "</mediawiki>",
].join("\n");
// base64-encode so the XML (quotes, newlines, `:`) survives the shell round-trip
sh(
  `printf %s ${Buffer.from(importXml, "utf8").toString("base64")} | base64 -d > /tmp/gap-import.xml`,
);
dump(
  "import",
  form(
    CAP,
    `-F "action=import" -F "namespace=0" -F "xml=@/tmp/gap-import.xml;filename=gap-import.xml" -F "token=</tmp/ct.txt"`,
  ),
);

// ============================================================================
// login / logout — dedicated session so CAP's csrf stays alive
// ============================================================================
const LO: Creds = { jar: "/tmp/mwlo", user: CAP.user, pass: CAP.pass };
sh(`rm -f ${LO.jar}`);
const LOTT = token(LO, "login");
dump(
  "login",
  call(
    LO,
    `-d "action=login" --data-urlencode "lgname=$LG" --data-urlencode "lgpassword=$PW" --data-urlencode "lgtoken=$LT"`,
    {
      LG: LO.user ?? "",
      PW: LO.pass ?? "",
      LT: LOTT,
    },
  ),
);
dump(
  "logout",
  call(LO, `-d "action=logout" --data-urlencode "token=$LTOK"`, { LTOK: token(LO, "csrf") }),
);

console.log("[gap] done — see .mw-scratch/gaps/");
