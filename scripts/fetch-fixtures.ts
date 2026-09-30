/**
 * Fetch representative real API responses from the reference wiki and persist
 * them as fixtures under `tests/fixtures/` — the source of truth for the
 * hand-written types in `src/core/` (validated by the type assertions under
 * `tests/`).
 *
 * Usage: `pnpm fetch:fixtures` (override the endpoint with `MW_API=...`).
 * Positional arguments filter the specs to run, e.g.
 * `pnpm exec tsx scripts/fetch-fixtures.ts query/random query/querypage` — handy
 * when adding one module without churning every other fixture.
 *
 * `--check` fetches and validates every selected spec **without writing**
 * anything: it answers “is this fixture still reproducible against the endpoint
 * its spec names?”, and fails on an empty or warning-laden response. Run it
 * against the local baseline before trusting a plain `pnpm fetch:fixtures` not to
 * blank fixtures that were really captured from a content-rich wiki.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Reference endpoint. Defaults to the **local 1.43 LTS** instance used by
 * `capture-write-fixtures.ts` (container `mw-fixture`, host `localhost:8080`), so
 * read fixtures match the declared baseline. That local wiki must be populated
 * with real pages/categories and have the relevant extensions installed
 * (TextExtracts, PageImages, FlaggedRevs, …) for these modules to return
 * non-empty data.
 *
 * Override with `MW_API` to fetch from a content-rich public wiki, e.g.
 * `MW_API=https://www.mediawiki.org/w/api.php` — but that runs `1.47.0-wmf.*`,
 * so verify any newly-appearing field against 1.43.
 */
const API = process.env.MW_API ?? "http://localhost:8080/api.php";

/** mediawiki.org, for modules the fixture wiki has no content for. Runs 1.47-wmf. */
export const ORG_API = "https://www.mediawiki.org/w/api.php";
/** Wikipedia, for interlanguage/interwiki-link-heavy modules. */
export const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";

const FIXTURES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "tests", "fixtures");

/** A fixture to capture: a relative output path and the query string params. */
interface FixtureSpec {
  path: string;
  params: Record<string, string>;
  /**
   * Optional per-spec endpoint override. Defaults to the reference site.
   * Used for modules the reference wiki cannot exercise (e.g. `prop=langlinks`,
   * which needs an interlanguage-link-bearing wiki like Wikipedia).
   */
  api?: string;
  /**
   * Expected `query.general.generator` prefix of the endpoint serving this spec.
   * Specs on the default (reference) endpoint are always checked against
   * `"1.43"`; specs with an `api` override are only checked when they declare
   * this field. Guards against silently capturing a newer baseline (the
   * 2026-09 audit found three fixtures had been captured from 1.47-wmf).
   */
  expectVersion?: string;
  /**
   * For the negative fixtures only: the response is *supposed* to carry an error
   * or warnings. Everything else must come back clean, or the run fails.
   */
  expect?: "error" | "warnings";
}

const SPECS: FixtureSpec[] = [
  {
    // action=info: the base page fields, including a missing title. mediawiki.org
    // content (the `MediaWiki` page), like most read fixtures here.
    path: "core/query/info.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "info",
      // An existing page and a missing one, to capture both page shapes.
      titles: "MediaWiki|DoesNotExist_0a1b2c3d",
    },
  },
  {
    // prop=info extended: request the inprop sub-props and a protected page so
    // protection / urls / displaytitle / talk & subject ids all appear.
    path: "core/query/info-inprop.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "info",
      titles: "MediaWiki|MediaWiki:Vector.js|Talk:MediaWiki",
      inprop: "url|displaytitle|protection|linkclasses|associatedpage|subjectid|talkid",
    },
  },
  {
    // list=codexicons: icon definitions covering both value forms (raw SVG
    // strings and directionality/language-aware objects). Module added in 1.44,
    // so this is captured from mediawiki.org (the 1.43 baseline has no module).
    path: "core/query/codexicons.json",
    api: ORG_API,
    params: {
      action: "query",
      list: "codexicons",
      names:
        "cdxIconInfo|cdxIconTrash|cdxIconEdit|cdxIconAdd|cdxIconLanguage|cdxIconAlert|cdxIconUserAvatar|cdxIconLink|cdxIconSearch|cdxIconCollapse|cdxIconPrevious|cdxIconNext|cdxIconHelp|cdxIconHome|cdxIconDownload|cdxIconUpload|cdxIconStar|cdxIconBlock|cdxIconTag",
    },
  },
  {
    // list=trackingcategories: entries with size/hidden props. Module added in
    // 1.45, captured from mediawiki.org like codexicons above.
    path: "core/query/trackingcategories.json",
    api: ORG_API,
    params: {
      action: "query",
      list: "trackingcategories",
      tcprop: "size|hidden",
      tclimit: "3",
    },
  },
  {
    // action=languagesearch: a small result map. Module moved into core in
    // 1.46 (previously the Universal Language Selector extension), captured
    // from mediawiki.org.
    path: "core/languagesearch/zh.json",
    api: ORG_API,
    params: { action: "languagesearch", search: "zh" },
  },
  {
    // meta=siteinfo: general config + namespaces (drives ExportXML/baseinfo).
    path: "core/query/siteinfo.json",
    params: { action: "query", meta: "siteinfo", siprop: "general|namespaces" },
  },
  {
    // meta=siteinfo, the remaining siprop groups with a compact, stable shape.
    // Deliberately excluded: `uploaddialog` (emitted unconditionally — a sample
    // adds only bulk) and the large
    // plain-string / introspection lists (`variables`, `functionhooks`, `magicwords`,
    // `showhooks`, `languages`, `languagevariants`, `defaultoptions`) — the first two
    // are `string[]` like `protocols`, so a sample adds bulk, not information; the
    // rest are typed from cross-site verification.
    path: "core/query/siteinfo-groups.json",
    params: {
      action: "query",
      meta: "siteinfo",
      siprop:
        "statistics|usergroups|restrictions|rightsinfo|namespacealiases|specialpagealiases|fileextensions|extensions|protocols|skins|extensiontags|dbrepllag|interwikimap|libraries|clientlibraries|autopromote|autocreatetempuser|autopromoteonce",
    },
  },
  {
    path: "core/query/categories.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "categories",
      titles: "Manual:Contents",
      // Request every clprop so the fixture exercises the full category shape.
      clprop: "sortkey|timestamp|hidden",
      cllimit: "max",
    },
  },
  {
    path: "core/query/tokens.json",
    params: {
      action: "query",
      meta: "tokens",
      // Stable set: all return the anon token "+\\", keeping the fixture
      // deterministic (login/createaccount tokens are random per session).
      type: "csrf|watch|patrol|rollback|userrights",
    },
  },
  // --- prop= modules (backlinks & usage) consumed by MoegirlPedia utils/api ---
  {
    // prop=revisions: ids/flags/timestamp/user/size/sha1/contentmodel/comment + main slot
    // content. Small target page keeps embedded content tiny and the fixture stable.
    path: "core/query/revisions.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "revisions",
      titles: "MediaWiki",
      rvprop:
        "ids|flags|timestamp|user|userid|size|sha1|contentmodel|comment|parsedcomment|tags|content",
      rvslots: "main",
      rvlimit: "5",
      rvdir: "newer",
    },
  },
  {
    // prop=revisions extras: capture slot roles / per-slot size+sha1 (rvprop=
    // roles|slotsize|slotsha1), which the base revisions fixture omits.
    path: "core/query/revisions-roles.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "revisions",
      titles: "MediaWiki",
      rvprop: "ids|roles|slotsize|slotsha1|contentmodel|timestamp",
      rvslots: "main",
      rvlimit: "1",
    },
  },
  {
    path: "core/query/linkshere.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "linkshere",
      titles: "MediaWiki",
      lhprop: "pageid|title|redirect",
      lhlimit: "5",
    },
  },
  {
    path: "core/query/redirects.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "redirects",
      titles: "MediaWiki",
      rdprop: "pageid|title|fragment",
      rdlimit: "5",
    },
  },
  {
    // prop=transcludedin on a widely-transcluded template to guarantee non-empty.
    path: "core/query/transcludedin.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "transcludedin",
      titles: "Template:Version",
      tiprop: "pageid|title|redirect",
      tilimit: "5",
    },
  },
  {
    // prop=globalusage: cross-wiki file usage (note: pageid serializes as a string).
    path: "core/query/globalusage.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "globalusage",
      titles: "File:Wiki letter w.png",
      gulimit: "5",
    },
  },
  {
    // prop=fileusage: target a file known to be used on-wiki (from an earlier sample).
    path: "core/query/fileusage.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "fileusage",
      titles: "File:01-wikitech-phpstorm-winscp-instance-name.png",
      fuprop: "pageid|title|redirect",
      fulimit: "5",
    },
  },
  // --- list= modules ---
  {
    path: "core/query/categorymembers.json",
    api: ORG_API,
    params: {
      action: "query",
      list: "categorymembers",
      cmtitle: "Category:Manual",
      cmprop: "ids|sortkey|sortkeyprefix|timestamp|type|title",
      cmlimit: "5",
    },
  },
  {
    // list=usercontribs for an active account (Brion has no contribs on mediawiki.org).
    path: "core/query/usercontribs.json",
    api: ORG_API,
    params: {
      action: "query",
      list: "usercontribs",
      ucuser: "Tim Starling",
      ucprop: "ids|title|timestamp|comment|flags|size|sizediff|tags",
      uclimit: "5",
    },
  },
  {
    path: "core/query/recentchanges.json",
    params: {
      action: "query",
      list: "recentchanges",
      rcprop: "ids|title|timestamp|user|userid|comment|parsedcomment|flags|sizes|tags|loginfo|sha1",
      rclimit: "5",
    },
  },
  {
    path: "core/query/search.json",
    params: {
      action: "query",
      list: "search",
      srsearch: "MediaWiki",
      srprop: "size|wordcount|timestamp|snippet|titlesnippet|categorysnippet",
      srlimit: "3",
    },
  },
  {
    // list=users: include an unknown name to capture the `missing` shape.
    path: "core/query/users.json",
    params: {
      action: "query",
      list: "users",
      ususers: "Tim Starling|Catrope|NoSuchUser_0a1b2c3d",
      usprop:
        "blockinfo|editcount|gender|groups|implicitgroups|rights|registration|centralids|cancreate|emailable",
    },
  },
  {
    // list=tags: prefix is `tg` on current MediaWiki (historically `lt`).
    path: "core/query/tags.json",
    params: {
      action: "query",
      list: "tags",
      tgprop: "displayname|description|defined|source|active|hitcount",
      tglimit: "5",
    },
  },
  // --- additional core list=/prop= modules used by the interface-admin repo ---
  {
    path: "core/query/logevents.json",
    params: {
      action: "query",
      list: "logevents",
      leprop: "ids|type|timestamp|user|userid|comment|parsedcomment|title|details|tags",
      lelimit: "5",
    },
  },
  {
    path: "core/query/allusers.json",
    params: {
      action: "query",
      list: "allusers",
      auprop: "blockinfo|editcount|groups|implicitgroups|registration|rights",
      aulimit: "5",
    },
  },
  {
    path: "core/query/blocks.json",
    api: ORG_API,
    params: {
      action: "query",
      list: "blocks",
      bkprop:
        "id|user|userid|by|byid|timestamp|expiry|reason|parsedreason|range|restrictions|flags",
      bklimit: "5",
    },
  },
  {
    path: "core/query/contributors.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "contributors",
      titles: "MediaWiki",
      pclimit: "5",
    },
  },
  {
    // prop=imageinfo on a file known to exist locally (from the fileusage sample).
    // Only mediawiki.org has a file with rich extmetadata; it runs 1.47-wmf, so
    // 1.47-only fields here (e.g. `thumbattribs`) are typed with @since tags.
    path: "core/query/imageinfo.json",
    api: ORG_API,
    expectVersion: "1.47",
    params: {
      action: "query",
      prop: "imageinfo",
      titles: "File:01-wikitech-phpstorm-winscp-instance-name.png",
      iiprop:
        "timestamp|user|userid|comment|parsedcomment|size|dimensions|sha1|mime|mediatype|bitdepth|metadata|canonicaltitle|url|extmetadata",
      // iiurlwidth makes the API return a scaled thumbnail (thumburl/width/height).
      iiurlwidth: "400",
    },
  },
  {
    // generator=links: feeds pages linked-from a source into query.pages, proving
    // the generator injects ordinary page fields (paired here with prop=info).
    path: "core/query/generator-links.json",
    api: ORG_API,
    params: {
      action: "query",
      generator: "links",
      titles: "MediaWiki",
      prop: "info",
    },
  },
  {
    // generator=search: in generator mode `gsrprop` defaults to empty, so the
    // pages[] entries carry only ns/title/pageid plus the injected `index`. The
    // hit field set is the same in 1.39–1.47, so this 1.47 capture matches the
    // 1.43 baseline.
    path: "core/query/generator-search.json",
    api: ORG_API,
    expectVersion: "1.47",
    params: {
      action: "query",
      generator: "search",
      gsrsearch: "MediaWiki",
      gsrlimit: "3",
    },
  },
  {
    // generator=search with the full gsrprop set: the search hit fields are
    // injected into pages[], and `searchinfo` needs an explicit `gsrinfo`.
    path: "core/query/generator-search-props.json",
    api: ORG_API,
    expectVersion: "1.47",
    params: {
      action: "query",
      generator: "search",
      gsrsearch: "MediaWiki",
      gsrlimit: "3",
      gsrprop: "size|wordcount|snippet|timestamp|titlesnippet|categorysnippet|isfilematch",
      gsrinfo: "totalhits",
    },
  },
  {
    // generator=search with redirects=1: the hit fields (and `index`) of a
    // redirect *source* are merged into the `query.redirects` entry, while
    // `from`/`to` stay the redirect's own. The local baseline's search backend
    // does not resolve redirects itself, so the merge is observable here — one
    // of the fixture wiki's probe pages redirects to another.
    path: "core/query/generator-search-redirects.json",
    params: {
      action: "query",
      generator: "search",
      gsrsearch: "Audit probe",
      gsrlimit: "20",
      gsrprop: "size|wordcount|snippet|timestamp|titlesnippet|categorysnippet|isfilematch",
      redirects: "1",
    },
  },
  {
    // generator=prefixsearch injects only `index`. `redirects=1` shows the
    // source's generator data merged into the `query.redirects` entries.
    path: "core/query/generator-prefixsearch.json",
    api: ORG_API,
    expectVersion: "1.47",
    params: {
      action: "query",
      generator: "prefixsearch",
      gpssearch: "MediaInclu",
      gpslimit: "5",
      redirects: "1",
    },
  },
  {
    // rawcontinue=1: the legacy root-level keys replace `continue` /
    // `batchcomplete`, and the generator cursor keeps its g-prefix inside the
    // module bucket. `generator=recentchanges` is one of the three modules that
    // also populate `query-noncontinue`.
    path: "core/query/rawcontinue.json",
    api: ORG_API,
    expectVersion: "1.47",
    params: {
      action: "query",
      generator: "recentchanges",
      grclimit: "1",
      prop: "revisions",
      rvlimit: "1",
      rawcontinue: "1",
    },
  },
  // --- more common core read modules (forward links, media, category stats) ---
  {
    path: "core/query/links.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "links",
      titles: "MediaWiki",
      pllimit: "5",
    },
  },
  {
    // a page that embeds files, so prop=images is non-empty.
    path: "core/query/images.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "images",
      titles: "JetBrains IDEs",
      imlimit: "5",
    },
  },
  {
    path: "core/query/extlinks.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "extlinks",
      titles: "Professional development and consulting",
      ellimit: "5",
    },
  },
  {
    path: "core/query/categoryinfo.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "categoryinfo",
      titles: "Category:Manual",
    },
  },
  {
    path: "core/query/allimages.json",
    api: ORG_API,
    params: {
      action: "query",
      list: "allimages",
      aiprop:
        "timestamp|user|userid|comment|size|dimensions|url|mime|mediatype|sha1|bitdepth|canonicaltitle",
      aiprefix: "Wiki",
      ailimit: "3",
    },
  },
  // --- AbuseFilter list module (extension present on the reference site; abuselog
  // needs a permission the anonymous session lacks, so it is not captured here) ---
  {
    // list=abusefilters (extension). mediawiki.org is used because the fixture wiki
    // has no filters defined; `abuselog` needs a permission the anon session lacks.
    // The newer AbuseFilter folds `private`/`suppressed` into `flags`: requesting the
    // old values draws a deprecation warning, while `flags` returns them as real
    // booleans. The local REL1_43 clone has no `flags`, so this cannot be local.
    path: "core/query/abusefilters.json",
    api: ORG_API,
    params: {
      action: "query",
      list: "abusefilters",
      abfprop: "id|description|hits|lasteditor|lastedittime|flags",
      abflimit: "3",
    },
  },
  // --- TextExtracts / PageImages (bundled with the reference site) ---
  {
    path: "core/query/extracts.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "extracts",
      titles: "How to become a MediaWiki hacker",
      explaintext: "1",
      exintro: "1",
      exlimit: "1",
    },
  },
  {
    path: "core/query/pageimages.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "pageimages",
      titles: "MediaWiki",
      pithumbsize: "120",
    },
  },
  {
    path: "core/query/allpages.json",
    api: ORG_API,
    params: {
      action: "query",
      list: "allpages",
      apprefix: "Media",
      aplimit: "3",
    },
  },
  // --- meta=allmessages (select keys to avoid the ~6MB full dump) ---
  {
    path: "core/query/allmessages.json",
    params: {
      action: "query",
      meta: "allmessages",
      // `fixturemessage` exists only as a database page, so with `amprop=default`
      // it reports `defaultmissing` (no untranslated default outside the DB),
      // while `NoSuchMessage_0a1b2c3d` reports `missing`.
      ammessages: "pagetitle|mainpage|recentchanges|fixturemessage|NoSuchMessage_0a1b2c3d",
      amprop: "default",
    },
  },
  // --- more common read modules surfaced by popular MediaWiki clients ---
  {
    // prop=langlinks needs an interlanguage-link-bearing wiki (Wikipedia), not the reference site.
    path: "core/query/langlinks.json",
    api: "https://en.wikipedia.org/w/api.php",
    params: {
      action: "query",
      prop: "langlinks",
      titles: "Paris",
      llprop: "url|langname|autonym",
      lllimit: "3",
    },
  },
  {
    path: "core/query/pageprops.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "pageprops",
      titles: "MediaWiki|Main Page|Help:Categories",
      ppprop:
        "displaytitle|notoc|wikibase_item|defaultsort|disambiguation|hidewatchlink|forceuncategorized",
    },
  },
  {
    // prop=description (Wikibase Client): one page has a description, one does not.
    path: "core/query/description.json",
    api: ORG_API,
    params: {
      action: "query",
      prop: "description",
      titles: "MediaWiki|Manual:Parameters to index.php",
    },
  },
  {
    path: "core/query/prefixsearch.json",
    api: ORG_API,
    params: { action: "query", list: "prefixsearch", pssearch: "MediaWiki", pslimit: "3" },
  },
  {
    path: "core/query/allcategories.json",
    api: ORG_API,
    params: { action: "query", list: "allcategories", acprop: "size|hidden", aclimit: "3" },
  },
  {
    path: "core/query/backlinks.json",
    api: ORG_API,
    params: {
      action: "query",
      list: "backlinks",
      bltitle: "MediaWiki",
      blfilterredir: "nonredirects",
      bllimit: "3",
    },
  },
  {
    path: "core/query/embeddedin.json",
    api: ORG_API,
    params: { action: "query", list: "embeddedin", eititle: "MediaWiki", eilimit: "3" },
  },
  {
    // list=globalblocks (CentralAuth): `address` is deprecated on current builds, so omit it.
    // A single-wiki fixture host cannot produce global blocks; mediawiki.org runs
    // 1.47-wmf, where `block-email` exists (typed with a @since 1.46 tag).
    path: "core/query/globalblocks.json",
    api: ORG_API,
    expectVersion: "1.47",
    params: {
      action: "query",
      list: "globalblocks",
      bgprop: "id|by|timestamp|expiry|reason|target|range",
      bglimit: "3",
    },
  },
  {
    // meta=userinfo (current effective user, anonymously = the IP session).
    // The reported IP is sanitized to a documentation address on write (see
    // `sanitizeFixture`). `options`/`ratelimits` are omitted: they are unbounded
    // site/user maps (hundreds of keys), modeled as open records in the type.
    path: "core/query/userinfo.json",
    api: ORG_API,
    params: {
      action: "query",
      meta: "userinfo",
      uiprop:
        "blockinfo|hasmsg|groups|groupmemberships|implicitgroups|rights|editcount|registrationdate|watchlistlabels|acceptlang|centralids",
    },
  },
  {
    // meta=globaluserinfo. `merged`/`unattached` omitted from the fixture (a
    // global account merges hundreds of per-wiki rows); modeled as open arrays.
    path: "core/query/globaluserinfo.json",
    api: ORG_API,
    params: {
      action: "query",
      meta: "globaluserinfo",
      guiuser: "Tim Starling",
      guiprop: "editcount|groups|rights",
    },
  },
  // --- small read modules (transclusions, interwiki links, language metadata) ---
  {
    // prop=templates: pages transcluded by a page. Reference site — the default
    // local instance is a fresh wiki whose pages use no templates.
    path: "core/query/templates.json",
    api: "https://www.mediawiki.org/w/api.php",
    params: { action: "query", prop: "templates", titles: "Manual:Contents", tllimit: "3" },
  },
  {
    // prop=iwlinks: interwiki links (needs a page bearing them; iwprop=url adds the URL).
    path: "core/query/iwlinks.json",
    api: "https://www.mediawiki.org/w/api.php",
    params: { action: "query", prop: "iwlinks", iwprop: "url", titles: "Manual:FAQ", iwlimit: "3" },
  },
  {
    // meta=languageinfo: language metadata keyed by code (zh exercises variants/variantnames).
    path: "core/query/languageinfo.json",
    api: "https://www.mediawiki.org/w/api.php",
    params: {
      action: "query",
      meta: "languageinfo",
      liprop: "code|bcp47|dir|autonym|name|fallbacks|variants|variantnames",
      licode: "en|zh",
    },
  },
  // --- enumeration / reverse-lookup list modules, plus meta=filerepoinfo ---
  {
    // list=random: entries key the id as `id` (not `pageid`).
    path: "core/query/random.json",
    params: {
      action: "query",
      list: "random",
      rnnamespace: "0",
      rnfilterredir: "nonredirects",
      rnlimit: "3",
    },
  },
  {
    // list=querypage: a report whose rows carry a `value` and a `timestamp`.
    path: "core/query/querypage-ancient.json",
    params: { action: "query", list: "querypage", qppage: "Ancientpages", qplimit: "3" },
  },
  {
    // list=querypage: the minimal row shape (ns/title only), same wiki.
    path: "core/query/querypage-plain.json",
    params: { action: "query", list: "querypage", qppage: "Lonelypages", qplimit: "3" },
  },
  {
    // list=alllinks: `alprop=ids|title` yields `fromid` (the linking page), no `pageid`.
    path: "core/query/alllinks.json",
    params: { action: "query", list: "alllinks", alprop: "ids|title", allimit: "3" },
  },
  {
    // list=allredirects: rows share the alllinks shape, plus this module's own
    // `arprop` values — the first row's target carries a `#fragment` on the
    // fixture wiki (no interwiki prefix is configured locally).
    path: "core/query/allredirects.json",
    params: {
      action: "query",
      list: "allredirects",
      arprop: "ids|title|fragment|interwiki",
      arfrom: "MT2 1790361822",
      arlimit: "3",
    },
  },
  {
    // meta=authmanagerinfo with merged fields: `amimergerequestfields=1` moves
    // the field descriptors to a top-level `fields` map and omits the
    // per-request ones.
    path: "core/query/authmanagerinfo-merged.json",
    params: {
      action: "query",
      meta: "authmanagerinfo",
      amirequestsfor: "create",
      amimergerequestfields: "1",
    },
  },
  {
    // list=allrevisions: revisions grouped per page, rows identical to prop=revisions.
    path: "core/query/allrevisions.json",
    params: {
      action: "query",
      list: "allrevisions",
      arvnamespace: "0",
      arvprop: "ids|timestamp|user|userid|size|sha1|contentmodel|comment|tags|roles",
      arvslots: "main",
      arvlimit: "3",
      arvdir: "newer",
    },
  },
  {
    // list=allfileusages: the alllinks family over imagelinks (`af*` prefix), so
    // `afunique` and `afprop=ids` are likewise exclusive.
    path: "core/query/allfileusages.json",
    api: "https://www.mediawiki.org/w/api.php",
    params: { action: "query", list: "allfileusages", afprop: "ids|title", aflimit: "3" },
  },
  {
    // list=alltransclusions: needs template transclusions, which the fixture wiki lacks.
    path: "core/query/alltransclusions.json",
    api: "https://www.mediawiki.org/w/api.php",
    params: { action: "query", list: "alltransclusions", atprop: "ids|title", atlimit: "3" },
  },
  {
    // list=exturlusage: the fixture wiki has no external links in content.
    path: "core/query/exturlusage.json",
    api: "https://www.mediawiki.org/w/api.php",
    params: {
      action: "query",
      list: "exturlusage",
      euquery: "mediawiki.org",
      euprop: "ids|title|url",
      eulimit: "3",
    },
  },
  {
    // list=pageswithprop + list=pagepropnames: the fixture wiki defines no page props.
    path: "core/query/pageswithprop.json",
    api: "https://www.mediawiki.org/w/api.php",
    params: {
      action: "query",
      list: "pageswithprop",
      pwppropname: "disambiguation",
      pwpprop: "ids|title|value",
      pwplimit: "3",
    },
  },
  {
    path: "core/query/pagepropnames.json",
    api: "https://www.mediawiki.org/w/api.php",
    params: { action: "query", list: "pagepropnames", ppnlimit: "8" },
  },
  {
    // list=imageusage: title-based sibling of prop=fileusage (which needs a used file).
    path: "core/query/imageusage.json",
    api: "https://www.mediawiki.org/w/api.php",
    params: {
      action: "query",
      list: "imageusage",
      iutitle: "File:01-wikitech-phpstorm-winscp-instance-name.png",
      iulimit: "3",
    },
  },
  {
    // list=iwbacklinks / list=langbacklinks: need interwiki / interlanguage links.
    // en.wikipedia has the sparse `q:` usage; mediawiki.org carries the de-link.
    path: "core/query/iwbacklinks.json",
    api: "https://en.wikipedia.org/w/api.php",
    params: {
      action: "query",
      list: "iwbacklinks",
      iwblprefix: "q",
      iwbltitle: "MediaWiki",
      iwblprop: "iwprefix|iwtitle",
      iwbllimit: "3",
    },
  },
  {
    path: "core/query/langbacklinks.json",
    api: "https://www.mediawiki.org/w/api.php",
    params: {
      action: "query",
      list: "langbacklinks",
      lbllang: "de",
      lbltitle: "MediaWiki",
      lblprop: "lllang|lltitle",
      lbllimit: "3",
    },
  },
  {
    // meta=filerepoinfo: repo config; the local wiki contributes one `local` repo.
    path: "core/query/filerepoinfo.json",
    params: {
      action: "query",
      meta: "filerepoinfo",
      friprop:
        "url|local|name|displayname|rootUrl|thumbUrl|scriptDirUrl|canUpload|initialCapital|favicon",
    },
  },
  // --- non-query actions consumed by MoegirlPedia (read-only, anonymously fetchable) ---
  {
    // action=parse: fixed wikitext keeps the sample reproducible. Under fv2 `text`
    // is a plain HTML string (fv1 wrapped it in `{'*': ...}`).
    path: "core/parse/parse.json",
    params: {
      action: "parse",
      contentmodel: "wikitext",
      text: "== Head ==\nSome '''bold''' with a [[MediaWiki]] link, [[Category:Fixture]] and [https://example.org an external link].",
      prop: "text|displaytitle|categories|links|templates|images|externallinks|langlinks|parsewarnings|properties",
      title: "Project:Types-mediawiki-response fixture",
    },
  },
  {
    // action=compare: two revisions of a tiny page, so the diff (fv2 `body`) stays small
    // while the full from*/to* metadata is still exercised.
    path: "core/compare/compare.json",
    api: ORG_API,
    params: {
      action: "compare",
      fromrev: "1",
      torev: "935",
      prop: "diff|diffsize|title|user|comment|parsedcomment|ids|size",
    },
  },
  {
    // action=expandtemplates: expands wikitext without a full parse; returns the
    // expanded text plus, with prop=categories, the parsed `properties`.
    path: "core/expandtemplates/expandtemplates.json",
    params: {
      action: "expandtemplates",
      title: "Project:Types-mediawiki-response fixture",
      text: "{{DEFAULTSORT:Sort Me}} [[Category:FixtureCat]] some {{PAGENAME}} text",
      prop: "wikitext|categories|properties|volatile|ttl",
    },
  },
  {
    // action=parse, second pass over the props the base sample omits. `modules` must
    // be paired with `jsconfigvars`/`encodedjsconfigvars` or the API warns, and it
    // also emits `modulescripts`/`modulestyles` on its own. `headitems` is left out
    // (deprecated since 1.28) and `limitreporthtml` (a plain string whose numbers
    // change every run); `limitreportdata` is kept for its numeric-key quirk.
    path: "core/parse/parse-deep.json",
    params: {
      action: "parse",
      contentmodel: "wikitext",
      text: "= A =\n== B ==\n[<gallery>\nFile:Nope.png|Caption\n</gallery>\nSome {{PAGENAME}} text with a [[MediaWiki]] link.",
      title: "Project:Types-mediawiki-response fixture",
      prop: "modules|jsconfigvars|encodedjsconfigvars|tocdata|indicators|properties|parsewarnings|parsewarningshtml|limitreportdata",
    },
  },
  {
    path: "envelope/error/badvalue.json",
    params: { action: "nonexistentaction" },
    expect: "error",
  },
  {
    // Modern errorformat: `errors` array + top-level docref (vs bc's `error` object).
    path: "envelope/error/modern.json",
    params: { action: "nonexistentaction", errorformat: "plaintext" },
    expect: "error",
  },
  {
    // errorformat=raw: `errors` entries carry only the i18n `key` + `params`.
    path: "envelope/error/raw.json",
    params: { action: "nonexistentaction", errorformat: "raw" },
    expect: "error",
  },
  {
    // Default (bc) warning: module-keyed `warnings` object. Unknown param warns on `main`.
    path: "envelope/warnings/bc.json",
    params: { action: "query", meta: "tokens", type: "csrf", unknownparam: "1" },
    expect: "warnings",
  },
  {
    // Modern errorformat warning: `warnings` array of message objects.
    path: "envelope/warnings/modern.json",
    params: {
      action: "query",
      meta: "tokens",
      type: "csrf",
      unknownparam: "1",
      errorformat: "plaintext",
    },
    expect: "warnings",
  },
];

/** Base params applied to every request; this package targets `formatversion=2`. */
const BASE_PARAMS = { format: "json", formatversion: "2" } as const;

/** Descriptive UA (WMF wikis throttle generic/missing ones). */
const USER_AGENT =
  "types-mediawiki-response/0.1 (fixture fetcher; https://github.com/BearBin1215/types-mediawiki-response)";

/** Minimum gap between requests, to stay polite and avoid 429s. */
const REQUEST_GAP_MS = 2000;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Root-level keys that carry no module payload. */
const ENVELOPE_KEYS = new Set([
  "batchcomplete",
  "continue",
  "warnings",
  "servedby",
  "curtimestamp",
  "requestid",
  "error",
  "errors",
  "docref",
]);

/**
 * Keys a `query.pages[]` entry carries even when the requested prop returned
 * nothing (missing page, no prop data). Only that list is filtered by them: a
 * `list=` row may legitimately consist of `pageid`/`ns`/`title` plus an empty
 * string value (e.g. `list=pageswithprop` on a switch-like page property).
 */
const IDENTITY_KEYS = new Set(["ns", "title", "pageid", "missing", "invalid", "known", "special"]);

/** An empty list, or an object whose every member is itself empty, has no data. */
function hasData(value: unknown, via?: string): boolean {
  if (Array.isArray(value)) return value.length > 0 && value.some((item) => hasData(item, via));
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const payload = via === "pages" ? entries.filter(([key]) => !IDENTITY_KEYS.has(key)) : entries;
    return payload.some(([key, member]) => hasData(member, key));
  }
  return value !== undefined && value !== null && value !== "";
}

/**
 * Reject a response that would make a useless fixture: an unexpected error, an
 * incidental `warnings` (usually a mistyped parameter), or an empty payload —
 * the last one is how a spec written against a content-rich wiki silently blanks
 * a committed fixture when re-run against the sparse local baseline.
 */
function assertUsable(spec: FixtureSpec, body: Record<string, unknown>): void {
  const errored = body.error !== undefined || body.errors !== undefined;
  if (spec.expect === "error") {
    if (!errored) throw new Error(`${spec.path}: expected an error response, got success`);
    return;
  }
  if (errored) {
    throw new Error(`${spec.path}: unexpected error ${JSON.stringify(body.error ?? body.errors)}`);
  }
  if (spec.expect === "warnings") {
    if (body.warnings === undefined) {
      throw new Error(`${spec.path}: expected a warnings response, got none`);
    }
  } else if (body.warnings !== undefined) {
    throw new Error(`${spec.path}: unexpected warnings ${JSON.stringify(body.warnings)}`);
  }
  const payload = Object.entries(body).filter(([key]) => !ENVELOPE_KEYS.has(key));
  if (!payload.some(([key, value]) => hasData(value, key))) {
    throw new Error(`${spec.path}: returned no data (the endpoint lacks this content)`);
  }
}

/**
 * Fixtures are captured verbatim with one exception: an anonymous request makes
 * the API report live addresses — `meta=userinfo` reports the *operator's own*
 * IP, and `action=compare` / `prop=revisions` / `list=globalblocks` report third
 * parties'. Those must not be committed, so the known IP-bearing fields are
 * rewritten to RFC 5737 documentation addresses before writing. Keeping the
 * last octet keeps distinct sources distinct.
 */
const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;

const asDocIp = (value: unknown): unknown =>
  typeof value === "string" && IPV4.test(value) ? `192.0.2.${value.split(".")[3]}` : value;

function sanitizeFixture(path: string, body: Record<string, unknown>): void {
  const query = body.query as Record<string, unknown> | undefined;
  const rows = (key: string): Record<string, unknown>[] =>
    (query?.[key] as Record<string, unknown>[] | undefined) ?? [];
  switch (path) {
    case "core/query/userinfo.json": {
      const userinfo = query?.userinfo as Record<string, unknown> | undefined;
      if (userinfo) userinfo.name = asDocIp(userinfo.name);
      break;
    }
    case "core/compare/compare.json": {
      const compare = body.compare as Record<string, unknown> | undefined;
      if (compare) {
        compare.fromuser = asDocIp(compare.fromuser);
        compare.touser = asDocIp(compare.touser);
      }
      break;
    }
    case "core/query/revisions.json": {
      for (const page of rows("pages")) {
        for (const rev of (page.revisions as Record<string, unknown>[] | undefined) ?? []) {
          rev.user = asDocIp(rev.user);
        }
      }
      break;
    }
    case "core/query/globalblocks.json": {
      for (const block of rows("globalblocks")) {
        for (const key of ["target", "rangestart", "rangeend"]) block[key] = asDocIp(block[key]);
      }
      break;
    }
  }
}

/** Endpoint → `query.general.generator`, probed once per run for the version guard. */
const generatorCache = new Map<string, string>();

async function generatorVersion(endpoint: string): Promise<string> {
  const cached = generatorCache.get(endpoint);
  if (cached) return cached;
  const url = new URL(endpoint);
  for (const [key, value] of Object.entries(BASE_PARAMS)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("action", "query");
  url.searchParams.set("meta", "siteinfo");
  url.searchParams.set("siprop", "general");
  const response = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  if (!response.ok) {
    throw new Error(`version probe ${endpoint}: HTTP ${response.status} ${response.statusText}`);
  }
  const body = (await response.json()) as { query?: { general?: { generator?: string } } };
  const generator = body.query?.general?.generator ?? "";
  // Strip the "MediaWiki " product prefix so specs pin bare versions ("1.43").
  const version = generator.replace(/^MediaWiki /, "");
  if (!version) {
    throw new Error(`version probe ${endpoint}: no generator in response`);
  }
  generatorCache.set(endpoint, version);
  return version;
}

/** Fail a spec whose serving endpoint runs a version outside the declared baseline. */
async function assertVersion(spec: FixtureSpec): Promise<void> {
  const expected = spec.expectVersion ?? (spec.api ? undefined : "1.43");
  if (!expected) return;
  const actual = await generatorVersion(spec.api ?? API);
  if (!actual.startsWith(expected)) {
    throw new Error(
      `${spec.path}: ${spec.api ?? API} runs ${actual}, expected ${expected} — re-verify ` +
        "the fixture's shape against that version before keeping it",
    );
  }
}

async function fetchFixture(spec: FixtureSpec, checkOnly: boolean, attempt = 1): Promise<void> {
  const url = new URL(spec.api ?? API);
  for (const [key, value] of Object.entries({ ...BASE_PARAMS, ...spec.params })) {
    url.searchParams.set(key, value);
  }

  await assertVersion(spec);
  const response = await fetch(url, { headers: { "user-agent": USER_AGENT } });

  // Retry on rate-limit / transient server errors with linear backoff.
  if ((response.status === 429 || response.status >= 500) && attempt <= 5) {
    const backoff = REQUEST_GAP_MS * attempt;
    console.warn(
      `[fetch-fixtures] ${spec.path}: HTTP ${response.status}, retry #${attempt} in ${backoff}ms`,
    );
    await sleep(backoff);
    return fetchFixture(spec, checkOnly, attempt + 1);
  }
  if (!response.ok) {
    throw new Error(`${spec.path}: HTTP ${response.status} ${response.statusText}`);
  }
  const body = (await response.json()) as Record<string, unknown>;
  assertUsable(spec, body);
  sanitizeFixture(spec.path, body);
  if (checkOnly) {
    console.log(`[fetch-fixtures] ok ${spec.path}`);
    return;
  }

  const outPath = join(FIXTURES_DIR, spec.path);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(body, null, 2)}\n`, "utf8");
  console.log(`[fetch-fixtures] wrote ${spec.path}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const checkOnly = args.includes("--check");
  // Positional filters (everything that is not a flag).
  const filter = args.filter((arg) => !arg.startsWith("--"));
  console.log(`[fetch-fixtures] endpoint: ${API}${checkOnly ? " (--check: no writes)" : ""}`);
  const selected = filter.length
    ? SPECS.filter((spec) => filter.some((f) => spec.path === f || spec.path.includes(f)))
    : SPECS;
  if (!selected.length) {
    throw new Error(`no fixture matches ${filter.join(" ")}`);
  }
  const failures: string[] = [];
  // Sequential on purpose: fetch fixtures one at a time, spaced, to stay polite.
  for (const spec of selected) {
    try {
      // oxlint-disable-next-line no-await-in-loop
      await fetchFixture(spec, checkOnly);
    } catch (error) {
      // Keep going in check mode: one pass should report every stale spec.
      if (!checkOnly) throw error;
      failures.push(`${spec.path}: ${(error as Error).message}`);
      console.warn(`[fetch-fixtures] FAIL ${spec.path}: ${(error as Error).message}`);
    }
    // oxlint-disable-next-line no-await-in-loop
    await sleep(REQUEST_GAP_MS);
  }
  if (failures.length) {
    throw new Error(
      `${failures.length}/${selected.length} specs not reproducible:\n${failures.join("\n")}`,
    );
  }
  console.log(`[fetch-fixtures] done (${selected.length} fixtures)`);
}

main().catch((error: unknown) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
