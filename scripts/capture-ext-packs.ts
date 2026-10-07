/**
 * Capture real `formatversion=2` responses for the CentralAuth, BetaFeatures,
 * ULS and Translate extension packs. Exploratory: dumps raw responses under
 * `.mw-scratch/packs/` for inspection before promotion into
 * `tests/fixtures/extensions/`.
 *
 * Groups (positional; no argument = every group):
 * - `betafeatures`: list=betafeatures (needs a `$wgBetaFeatures` entry).
 * - `uls`: action=ulssetlang (needs a logged-in user; success is empty).
 * - `centralauth`: CentralAuth read/write actions on `mw143g`
 *   (MW_CONTAINER=mw143g). Not idempotent: `deleteglobalaccount` consumes the
 *   global account `Gdel2` and `createlocalaccount` consumes the global-only
 *   account `Gfresh3` (re-seed via `CentralAuth:migrateAccount` / SQL before
 *   re-running; see scripts/container notes in the fixture commit).
 * - `translate`: Translate read modules on `mw-fixture` (needs the translate
 *   rights on sysop; seeds a translatable page and its translations). Not
 *   idempotent: re-running flips `markfortranslation.firstmark` to `false`.
 * - `ttmserver`: `action=ttmserver` on the MySQL container — the SQLite
 *   baseline cannot serve the fulltext TM query.
 *
 * Local bring-up, config and accounts: `scripts/container/README.md`.
 * Run: `pnpm exec tsx scripts/capture-ext-packs.ts [group...]`
 * Env: MW_CONTAINER (default `mw-fixture`), CA_CONTAINER (default `mw143g`).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { API, call, type Creds, login, sh, SUF, token } from "./capture-client";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", ".mw-scratch", "packs");
mkdirSync(OUT, { recursive: true });

const GROUPS = process.argv.slice(2);
const want = (group: string): boolean => GROUPS.length === 0 || GROUPS.includes(group);

const CA_CONTAINER = process.env.CA_CONTAINER ?? "mw143g";
const CA: Creds = { jar: "/tmp/capack", user: "Capg", pass: "CapGPass2026" };
const CAP: Creds = { jar: "/tmp/mwpack", user: "capadmin", pass: "CapAdminPass2026" };
/** Second translator: authors translations for `translationreview` to review. */
const ED: Creds = { jar: "/tmp/mwpack-ed", user: "peerx", pass: "PeerXPass2026" };

function dump(name: string, body: unknown): void {
  writeFileSync(join(OUT, `${name}.json`), `${JSON.stringify(body, null, 2)}\n`, "utf8");
  console.log(`[packs] ${name}`);
}

if (want("betafeatures") || want("uls") || want("translate")) {
  login(CAP);
}

if (want("uls")) {
  const T = token(CAP, "csrf");
  dump(
    "ulssetlang",
    call(
      CAP,
      `--data-urlencode "token=$T" -d "action=ulssetlang" --data-urlencode "languagecode=de"`,
      { T },
    ),
  );
}

if (want("betafeatures")) {
  dump("betafeatures", call(CAP, `-d "action=query" -d "list=betafeatures" -d "bfcounts=1"`));
}

// ---------------------------------------------------------------------------
// centralauth group (runs on the mw143g container, logged in as Capg)
// ---------------------------------------------------------------------------

if (want("centralauth")) {
  login(CA, CA_CONTAINER);
  const CA_TOKEN = (type: string): string => token(CA, type, CA_CONTAINER);

  // Random per-call value; must not be committed verbatim.
  const cat = call(CA, `-d "action=centralauthtoken"`, {}, CA_CONTAINER) as {
    centralauthtoken?: { centralauthtoken?: string };
  };
  if (cat.centralauthtoken) cat.centralauthtoken.centralauthtoken = "DOC-centralauthtoken";
  dump("centralauthtoken", cat);

  // Attach the seeded global group: this is the fixture *and* the seeding for
  // the groups prop of globalallusers below.
  dump(
    "globaluserrights-add",
    call(
      CA,
      `--data-urlencode "token=$UT" -d "action=globaluserrights" --data-urlencode "user=Gblink" --data-urlencode "add=global-fixture" --data-urlencode "reason=fixture attach"`,
      { UT: CA_TOKEN("userrights") },
      CA_CONTAINER,
    ),
  );
  dump(
    "globalallusers",
    call(
      CA,
      `-d "action=query" -d "list=globalallusers" -d "aguprop=groups|lockinfo|existslocally" -d "agulimit=10"`,
      {},
      CA_CONTAINER,
    ),
  );
  dump(
    "globalgroups",
    call(CA, `-d "action=query" -d "list=globalgroups" -d "ggpprop=rights"`, {}, CA_CONTAINER),
  );
  dump(
    "wikisets",
    call(
      CA,
      `-d "action=query" -d "list=wikisets" -d "wsprop=type|wikisincluded|wikisnotincluded" -d "wslimit=10"`,
      {},
      CA_CONTAINER,
    ),
  );

  // Lock/unlock Gblink (reverted immediately; hidden stays untouched).
  dump(
    "setglobalaccountstatus-lock",
    call(
      CA,
      `--data-urlencode "token=$GT" -d "action=setglobalaccountstatus" --data-urlencode "user=Gblink" -d "locked=lock" --data-urlencode "reason=fixture lock"`,
      { GT: CA_TOKEN("setglobalaccountstatus") },
      CA_CONTAINER,
    ),
  );
  dump(
    "setglobalaccountstatus-unlock",
    call(
      CA,
      `--data-urlencode "token=$GT" -d "action=setglobalaccountstatus" --data-urlencode "user=Gblink" -d "locked=unlock" --data-urlencode "reason=fixture unlock"`,
      { GT: CA_TOKEN("setglobalaccountstatus") },
      CA_CONTAINER,
    ),
  );

  // Consumes the global account Gdel2 (re-seed via CentralAuth:migrateAccount).
  dump(
    "deleteglobalaccount",
    call(
      CA,
      `--data-urlencode "token=$DT" -d "action=deleteglobalaccount" --data-urlencode "user=Gdel2" --data-urlencode "reason=fixture delete"`,
      { DT: CA_TOKEN("deleteglobalaccount") },
      CA_CONTAINER,
    ),
  );

  // Gfresh3 is a global account without a local attachment; the call re-creates it.
  dump(
    "createlocalaccount",
    call(
      CA,
      `--data-urlencode "token=$CT" -d "action=createlocalaccount" --data-urlencode "username=Gfresh3" --data-urlencode "reason=fixture create local"`,
      { CT: CA_TOKEN("csrf") },
      CA_CONTAINER,
    ),
  );

  // Restore: drop the seeded global group from Gblink again.
  dump(
    "globaluserrights-remove",
    call(
      CA,
      `--data-urlencode "token=$UT" -d "action=globaluserrights" --data-urlencode "user=Gblink" --data-urlencode "remove=global-fixture" --data-urlencode "reason=fixture detach"`,
      { UT: CA_TOKEN("userrights") },
      CA_CONTAINER,
    ),
  );
}

// ---------------------------------------------------------------------------
// translate group (runs on the baseline container, logged in as capadmin)
// ---------------------------------------------------------------------------

if (want("translate")) {
  login(CAP);
  const T = token(CAP, "csrf");

  // Neutralize the language a previous `ulssetlang` probe may have changed:
  // group labels etc. render in the requesting user's language.
  call(
    CAP,
    `--data-urlencode "token=$T" -d "action=options" --data-urlencode "change=language=en"`,
    { T },
  );

  // Seed a translatable page plus translations. A stock Translate install has
  // no message groups at all (the 'core' group is site configuration), so the
  // fixtures are captured against a real page-translation group.
  const PAGE = "Fixture translatable page";
  call(
    CAP,
    `--data-urlencode "token=$T" -d "action=edit" -d "createonly=1" --data-urlencode "title=$P" --data-urlencode "text=$X" --data-urlencode "summary=fixture seed"`,
    {
      T,
      P: PAGE,
      X:
        "<translate><!--T:1--> Welcome to the fixture page.</translate>\n\n" +
        "<translate><!--T:2--> This is the second unit.</translate>",
    },
  );
  dump(
    "markfortranslation",
    call(
      CAP,
      `--data-urlencode "token=$T" -d "action=markfortranslation" --data-urlencode "title=$P"`,
      { T, P: PAGE },
    ),
  );

  // Unit translations: de + fr plain, es carries the fuzzy marker.
  const seedTranslation = (unit: string, lang: string, text: string): void => {
    call(
      CAP,
      `--data-urlencode "token=$T" -d "action=edit" -d "createonly=1" --data-urlencode "title=Translations:$P/$U/$L" --data-urlencode "text=$X" --data-urlencode "summary=fixture seed"`,
      { T, P: PAGE, U: unit, L: lang, X: text },
    );
  };
  seedTranslation("1", "de", "Willkommen auf der Fixture-Seite.");
  seedTranslation("2", "de", "Dies ist die zweite Einheit.");
  seedTranslation("1", "fr", "Bienvenue sur la page fixture.");
  seedTranslation("1", "es", "!!FUZZY!!Bienvenido a la página fixture.");

  // meta=messagegroups: every mgprop value.
  dump(
    "messagegroups",
    call(
      CAP,
      `-d "action=query" -d "meta=messagegroups" --data-urlencode "mgprop=id|label|description|class|namespace|exists|icon|priority|prioritylangs|priorityforce|workflowstates|sourcelanguage|subscription"`,
    ),
  );
  // meta=messagegroupstats: per-language completeness of the fixture group.
  dump(
    "messagegroupstats",
    call(CAP, `-d "action=query" -d "meta=messagegroupstats" --data-urlencode "mgsgroup=page-$P"`, {
      P: PAGE,
    }),
  );
  // meta=languagestats: one row per group for a language.
  dump("languagestats", call(CAP, `-d "action=query" -d "meta=languagestats" -d "lslanguage=de"`));
  // meta=messagetranslations: translations of the first unit's definition.
  dump(
    "messagetranslations",
    call(
      CAP,
      `-d "action=query" -d "meta=messagetranslations" --data-urlencode "mttitle=Translations:$P/1/en"`,
      { P: PAGE },
    ),
  );
  // list=messagecollection: rows of the fixture group for de.
  dump(
    "messagecollection",
    call(
      CAP,
      `-d "action=query" -d "list=messagecollection" --data-urlencode "mcgroup=page-$P" -d "mclanguage=de" --data-urlencode "mcprop=definition|translation|tags|properties" --data-urlencode "mcfilter=" -d "mclimit=5"`,
      { P: PAGE },
    ),
  );
  // action=translationstats: graph data for one language/group.
  dump(
    "translationstats",
    call(
      CAP,
      `-d "action=translationstats" -d "count=edits" -d "days=30" --data-urlencode "language=de" --data-urlencode "group=page-$P"`,
      { P: PAGE },
    ),
  );
  // action=translationaids: aids for a translated unit.
  dump(
    "translationaids",
    call(
      CAP,
      `-d "action=translationaids" --data-urlencode "title=Translations:$P/1/de" --data-urlencode "prop=definition|translation|documentation|inotherlanguages"`,
      { P: PAGE },
    ),
  );
  // NOT captured: action=ttmserver and action=searchtranslations.
  // - searchtranslations needs a SearchableTtmServer (Elasticsearch-backed);
  //   the stock database TM is only ReadableTtmServer.
  // - ttmserver needs the MySQL container (CA_CONTAINER): the SQLite baseline
  //   cannot run the fulltext MATCH query once the TM has rows. Seed
  //   translatable pages there first (the `ttmserver` group logs in as Capg on
  //   mw143g, which has Translate installed and seeded pages).
}

// ---------------------------------------------------------------------------
// ttmserver group (runs on the MySQL container, logged in as Capg; the
// baseline container's SQLite backend cannot serve fulltext TM queries)
// ---------------------------------------------------------------------------

if (want("ttmserver")) {
  login(CA, CA_CONTAINER);
  dump(
    "ttmserver",
    call(
      CA,
      `-d "action=ttmserver" --data-urlencode "sourcelanguage=en" --data-urlencode "targetlanguage=de" --data-urlencode "text=Welcome to the fixture page"`,
      {},
      CA_CONTAINER,
    ),
  );
}

// ---------------------------------------------------------------------------
// translate-write group (runs on the baseline container; write actions of the
// Translate pack that the seeded fixture state can exercise)
// ---------------------------------------------------------------------------

if (want("translate-write")) {
  login(CAP);
  login(ED);
  const T = token(CAP, "csrf");
  const PAGE = "Fixture translatable page";

  // action=translationreview: peerx authors a translation, capadmin reviews it
  // (reviewing one's own translation is an error, so a second user is needed).
  call(
    ED,
    `--data-urlencode "token=$T" -d "action=edit" --data-urlencode "title=Translations:$P/2/fr" --data-urlencode "text=Ceci est la deuxième unité." --data-urlencode "summary=fixture seed"`,
    { T: token(ED, "csrf"), P: PAGE },
  );
  const rev = call(
    CAP,
    `-d "action=query" -d "prop=revisions" -d "rvprop=ids" -d "rvlimit=1" -d "rvdir=newer" --data-urlencode "titles=Translations:$P/2/fr"`,
    { P: PAGE },
  ) as { query?: { pages?: { revisions?: { revid?: number }[] }[] } };
  const revid = rev.query?.pages?.[0]?.revisions?.[0]?.revid;
  if (typeof revid === "number") {
    dump(
      "translationreview",
      call(CAP, `--data-urlencode "token=$T" -d "action=translationreview" -d "revision=$R"`, {
        T,
        R: String(revid),
      }),
    );
  } else {
    console.log("[packs] translationreview skipped (no revid)");
  }

  // action=groupreview: set the workflow state of the fixture group for de.
  // Requires $wgTranslateWorkflowStates on the capture wiki.
  dump(
    "groupreview",
    call(
      CAP,
      `--data-urlencode "token=$T" -d "action=groupreview" --data-urlencode "group=page-$P" -d "language=de" -d "state=ready"`,
      { T, P: PAGE },
    ),
  );

  // action=aggregategroups: create an aggregate group, associate the fixture
  // group into it, then remove it (each `do` has its own result shape). The
  // created group id is derived server-side from the name and echoed back.
  const addResp = call(
    CAP,
    `--data-urlencode "token=$T" -d "action=aggregategroups" -d "do=add" --data-urlencode "groupname=Fixture aggregate group" --data-urlencode "groupdescription=Fixture aggregate description" --data-urlencode "groupsourcelanguagecode=-"`,
    { T },
  ) as { aggregategroups?: { aggregategroupId?: string } };
  dump("aggregategroups-add", addResp);
  const aggregateId = addResp.aggregategroups?.aggregategroupId;
  if (aggregateId) {
    dump(
      "aggregategroups-associate",
      call(
        CAP,
        `--data-urlencode "token=$T" -d "action=aggregategroups" -d "do=associate" --data-urlencode "aggregategroup=$A" --data-urlencode "group=page-$P"`,
        { T, A: aggregateId, P: PAGE },
      ),
    );
    dump(
      "aggregategroups-remove",
      call(
        CAP,
        `--data-urlencode "token=$T" -d "action=aggregategroups" -d "do=remove" --data-urlencode "aggregategroup=$A"`,
        { T, A: aggregateId },
      ),
    );
  }

  // action=translationentitysearch: both entity types over the seeded groups.
  dump(
    "translationentitysearch",
    call(
      CAP,
      `-d "action=translationentitysearch" --data-urlencode "query=Fixture" --data-urlencode "entitytype=groups|messages" -d "limit=10"`,
    ),
  );
}

// ---------------------------------------------------------------------------
// translate-write2 group (sandbox / stash / group subscription). Needs
// $wgTranslateUseSandbox and $wgTranslateEnableMessageGroupSubscription on the
// capture wiki. Not idempotent: each run creates a new sandbox user.
// ---------------------------------------------------------------------------

if (want("translate-write2")) {
  login(CAP);
  const T = token(CAP, "csrf");
  const PAGE = "Fixture translatable page";

  // action=translatesandbox do=create: registers a sandboxed user.
  const sbxName = `Sbx${SUF}`;
  const create = call(
    CAP,
    `--data-urlencode "token=$T" -d "action=translatesandbox" -d "do=create" --data-urlencode "username=$U" --data-urlencode "password=SbxPass2026" --data-urlencode "email=sbx@example.invalid"`,
    { T, U: sbxName },
  ) as { translatesandbox?: { user?: { name?: string; id?: number } } };
  dump("translatesandbox-create", create);
  const sbxId = create.translatesandbox?.user?.id;

  // The sandbox user logs in and stashes a translation for a message.
  const SBX: Creds = { jar: "/tmp/mwpack-sbx", user: sbxName, pass: "SbxPass2026" };
  login(SBX);
  const ST = token(SBX, "csrf");
  dump(
    "translationstash-add",
    call(
      SBX,
      `--data-urlencode "token=$ST" -d "action=translationstash" -d "subaction=add" --data-urlencode "title=Translations:$P/2/nl" --data-urlencode "translation=Dit is de tweede eenheid." --data-urlencode "metadata={}"`,
      { ST, P: PAGE },
    ),
  );
  dump(
    "translationstash-query",
    call(SBX, `--data-urlencode "token=$ST" -d "action=translationstash" -d "subaction=query"`, {
      ST,
    }),
  );

  // action=messagegroupsubscription: subscribe and unsubscribe.
  dump(
    "messagegroupsubscription-subscribe",
    call(
      CAP,
      `--data-urlencode "token=$T" -d "action=messagegroupsubscription" --data-urlencode "groupId=page-$P" -d "operation=subscribe"`,
      { T, P: PAGE },
    ),
  );
  dump(
    "messagegroupsubscription-unsubscribe",
    call(
      CAP,
      `--data-urlencode "token=$T" -d "action=messagegroupsubscription" --data-urlencode "groupId=page-$P" -d "operation=unsubscribe"`,
      { T, P: PAGE },
    ),
  );

  // action=managegroupsynchronizationcache resolveGroup: the group is not in
  // the sync cache, so this exercises the resolver on an empty queue.
  dump(
    "managegroupsynchronizationcache",
    call(
      CAP,
      `--data-urlencode "token=$T" -d "action=managegroupsynchronizationcache" -d "operation=resolveGroup" --data-urlencode "group=page-$P"`,
      { T, P: PAGE },
    ),
  );

  // action=translatesandbox do=promote: graduates the sandbox user (no payload).
  if (typeof sbxId === "number") {
    dump(
      "translatesandbox-promote",
      call(
        CAP,
        `--data-urlencode "token=$T" -d "action=translatesandbox" -d "do=promote" --data-urlencode "userid=$U"`,
        { T, U: String(sbxId) },
      ),
    );
  }
}

void sh;
void API;
