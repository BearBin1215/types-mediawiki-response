/**
 * `action=query` response skeleton and page framework.
 *
 * Per-module page data (`prop=info`, `prop=revisions`, ...) is contributed
 * to {@link ApiPage} from each module file via declaration merging, so the
 * page shape grows as coverage expands without this file depending on them.
 */
import type { Flag, NamespaceIndex } from "../../common";
import type { ApiEnvelope } from "../../envelope";

/**
 * Continuation tokens returned by `action=query`. @see https://www.mediawiki.org/wiki/API:Continue
 *
 * A module used as a generator emits its cursor under the `g`-prefixed form of
 * its list-mode name (`generator=allpages` → `gapcontinue`), so each
 * generator-capable module registers both forms. Modules that cannot act as
 * generators have no `g`-prefixed form (e.g. `list=allusers`, `prop=extlinks`).
 *
 * A module with data left contributes its own cursor. A generator's `g`-prefixed
 * cursor is only emitted once the `prop=` modules it drives have finished, which
 * is also when `batchcomplete: true` appears; while a `prop=` module still has
 * data the generator is not advanced, and only that module's cursor plus the
 * generator parameters carried over come back. Once everything is finished the
 * `continue` key is omitted entirely, though `batchcomplete` is still `true`.
 *
 * The generic {@link continue} string reads `<generator keys>||<finished modules>`:
 * `-` means the generator itself is finished, a non-empty first segment names the
 * generator parameters carried into the next request, and an empty first segment
 * means a `prop=` module is still unfinished — it says nothing about the
 * generator. The second segment names the modules a client may skip.
 */
export interface ApiQueryContinue {
  /** Generic opaque continue token (often `"||"` or `"-||"`). */
  continue?: string;

  /** `prop=revisions` */
  rvcontinue?: string;

  /** `generator=revisions` */
  grvcontinue?: string;

  /** `prop=categories` */
  clcontinue?: string;

  /** `generator=categories` */
  gclcontinue?: string;

  /** `prop=linkshere` */
  lhcontinue?: string;

  /** `generator=linkshere` */
  glhcontinue?: string;

  /** `prop=redirects` */
  rdcontinue?: string;

  /** `generator=redirects` */
  grdcontinue?: string;

  /** `prop=transcludedin` */
  ticontinue?: string;

  /** `generator=transcludedin` */
  gticontinue?: string;

  /** `prop=fileusage` */
  fucontinue?: string;

  /** `generator=fileusage` */
  gfucontinue?: string;

  /** `list=categorymembers` */
  cmcontinue?: string;

  /** `generator=categorymembers` */
  gcmcontinue?: string;

  /** `list=usercontribs` */
  uccontinue?: string;

  /** `list=recentchanges` */
  rccontinue?: string;

  /** `generator=recentchanges` */
  grccontinue?: string;

  /** `list=tags` */
  tgcontinue?: string;

  /** `prop=links` */
  plcontinue?: string;

  /** `generator=links` */
  gplcontinue?: string;

  /** `prop=images` */
  imcontinue?: string;

  /** `generator=images` */
  gimcontinue?: string;

  /** `prop=extlinks` */
  elcontinue?: string;

  /** `prop=templates` */
  tlcontinue?: string;

  /** `generator=templates` */
  gtlcontinue?: string;

  /** `prop=iwlinks` */
  iwcontinue?: string;

  /** `meta=languageinfo` */
  licontinue?: string;

  /** `list=allimages` */
  aicontinue?: string;

  /** `generator=allimages` */
  gaicontinue?: string;

  /** `list=allpages` */
  apcontinue?: string;

  /** `generator=allpages` */
  gapcontinue?: string;

  /** `prop=langlinks` */
  llcontinue?: string;

  /** `list=prefixsearch` offset (a number, like `sroffset`). */
  psoffset?: number;

  /** `generator=prefixsearch` offset (a number). */
  gpsoffset?: number;

  /** `list=allcategories` */
  accontinue?: string;

  /** `generator=allcategories` */
  gaccontinue?: string;

  /**
   * `list=trackingcategories`
   *
   * @since MediaWiki 1.45
   */
  tccontinue?: string;

  /**
   * `generator=trackingcategories`
   *
   * @since MediaWiki 1.45
   */
  gtccontinue?: string;

  /** `list=backlinks` */
  blcontinue?: string;

  /** `generator=backlinks` */
  gblcontinue?: string;

  /** `list=embeddedin` */
  eicontinue?: string;

  /** `generator=embeddedin` */
  geicontinue?: string;

  /** `list=watchlist` */
  wlcontinue?: string;

  /** `generator=watchlist` */
  gwlcontinue?: string;

  /** `list=logevents` */
  lecontinue?: string;

  /** `list=blocks` */
  bkcontinue?: string;

  /** `prop=contributors` */
  pccontinue?: string;

  /** `list=allusers` (name cursor) */
  aufrom?: string;

  /** `list=search` offset (a number, unlike most string cursors). */
  sroffset?: number;

  /** `generator=search` offset (a number). */
  gsroffset?: number;

  /** `list=random` (a `|`-joined random weight and page id, still a string). */
  rncontinue?: string;

  /** `generator=random` */
  grncontinue?: string;

  /** `list=querypage` offset (a number, like `sroffset`). */
  qpoffset?: number;

  /** `generator=querypage` offset (a number). */
  gqpoffset?: number;

  /** `list=alllinks` */
  alcontinue?: string;

  /** `generator=alllinks` */
  galcontinue?: string;

  /** `list=allredirects` */
  arcontinue?: string;

  /** `generator=allredirects` */
  garcontinue?: string;

  /** `list=alltransclusions` */
  atcontinue?: string;

  /** `generator=alltransclusions` */
  gatcontinue?: string;

  /** `list=exturlusage` */
  eucontinue?: string;

  /** `generator=exturlusage` */
  geucontinue?: string;

  /** `list=pageswithprop` */
  pwpcontinue?: string;

  /** `generator=pageswithprop` */
  gpwpcontinue?: string;

  /** `list=pagepropnames` */
  ppncontinue?: string;

  /** `list=imageusage` */
  iucontinue?: string;

  /** `generator=imageusage` */
  giucontinue?: string;

  /** `list=iwbacklinks` */
  iwblcontinue?: string;

  /** `generator=iwbacklinks` */
  giwblcontinue?: string;

  /** `list=langbacklinks` */
  lblcontinue?: string;

  /** `generator=langbacklinks` */
  glblcontinue?: string;

  /** `list=protectedtitles` */
  ptcontinue?: string;

  /** `generator=protectedtitles` */
  gptcontinue?: string;

  /** `list=watchlistraw` */
  wrcontinue?: string;

  /** `generator=watchlistraw` */
  gwrcontinue?: string;

  /** `prop=deletedrevisions` */
  drvcontinue?: string;

  /** `generator=deletedrevisions` */
  gdrvcontinue?: string;

  /** `list=alldeletedrevisions` */
  adrcontinue?: string;

  /** `generator=alldeletedrevisions` */
  gadrcontinue?: string;

  /** `list=allrevisions` */
  arvcontinue?: string;

  /** `generator=allrevisions` */
  garvcontinue?: string;

  /** `list=allfileusages` */
  afcontinue?: string;

  /** `generator=allfileusages` */
  gafcontinue?: string;

  /** `list=deletedrevs` (deprecated module) */
  drcontinue?: string;

  /** `list=filearchive` */
  facontinue?: string;

  /** `list=mystashedfiles` (numeric `uploadstash` row id) */
  msfcontinue?: string;

  /** `prop=duplicatefiles` */
  dfcontinue?: string;

  /** `generator=duplicatefiles` */
  gdfcontinue?: string;

  /** `prop=info` */
  incontinue?: string;

  /** `prop=imageinfo` */
  iistart?: string;

  /** `prop=imageinfo` */
  iicontinue?: string;

  /** `prop=pageprops` */
  ppcontinue?: string;

  /** `prop=categoryinfo` */
  cicontinue?: string;

  /** `list=users` (remaining names, pipe-joined) */
  ususers?: string;

  /** `list=users` queried by id (remaining ids, pipe-joined) */
  ususerids?: string;

  /** `meta=siteinfo` (unprocessed `siprop` values, pipe-joined) */
  siprop?: string;

  /** `meta=allmessages` */
  amfrom?: string;

  /** `meta=tokens` (unprocessed token types, pipe-joined) */
  type?: string;

  /**
   * Cursor for a module not named above, under that module's own
   * `<prefix>continue` / offset parameter name.
   */
  [key: string]: string | number | undefined;
}

/** One title normalization performed by the query framework. */
export interface ApiQueryNormalized {
  /** `true` when the input title was percent-encoded. */
  fromencoded?: boolean;
  /** The title as supplied by the request. */
  from?: string;
  /** The normalized title used for the lookup. */
  to?: string;
}

/**
 * Framework identity fields present on every `query.pages` entry, regardless
 * of which `prop=` modules were requested.
 */
export interface ApiPageIdentity {
  /**
   * Page id. Absent when the id is unknown: a missing page requested by page
   * id keeps its `pageid` alongside `missing`, while title-supplied
   * missing/invalid pages and special pages carry no `pageid`.
   */
  pageid?: number;

  /** Namespace index. */
  ns?: NamespaceIndex;

  /** Full, normalized page title. */
  title?: string;

  /** `true` when the page does not exist. */
  missing?: Flag;

  /**
   * `true` when the page does not exist but its content is known (e.g. a
   * defined but unsaved interface message). Emitted by the framework itself,
   * without requesting `prop=info`.
   */
  known?: Flag;

  /** `true` when the supplied title is not a valid title. */
  invalid?: Flag;

  /** Human-readable reason a title is `invalid`. */
  invalidreason?: string;

  /** `true` for pages in a special namespace. */
  special?: Flag;
}

/**
 * A `query.pages` entry carrying the union of all covered `prop=` fields.
 * `prop=` modules widen this via declaration merging (see `./info`); every
 * field is optional because pages may be missing/invalid and because a response
 * only contains the props that were requested.
 *
 * For a view scoped to the props you actually requested, use {@link QueryPage}.
 */
export interface ApiPage extends ApiPageIdentity {
  /**
   * 1-based rank of the page in the generator's ordering; injected by the query
   * framework for `generator=search` and `generator=prefixsearch`, absent
   * otherwise. A page reached through a redirect takes the smaller of the two
   * ranks.
   */
  index?: number;
}

/**
 * A page scoped to a chosen set of `prop=` fields: identity fields plus the
 * named keys only. Lets callers reflect what they requested and get a compile
 * error when reading a prop they did not ask for. The generator-injected
 * {@link ApiPage.index} is included as well, because it comes from the query
 * framework rather than from a `prop=`.
 *
 * @example
 * // identity + revisions only (categories/links/... are not offered)
 * const pages = Object.values(res.query.pages) as QueryPage<'revisions'>[];
 */
export type QueryPage<K extends keyof ApiPage> = ApiPageIdentity & Pick<ApiPage, K | "index">;

/** Makes the listed keys of `T` required while leaving every other key as-is. */
type Require<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * A `query.pages` entry whose page exists. The framework resolves `pageid`,
 * `ns` and `title` for every existing entry, so they are required here instead
 * of optional as on the merged {@link ApiPage}.
 *
 * The other entry states do not carry all three, which is why the merged
 * {@link ApiPage} keeps them optional: a title-supplied `missing` entry has no
 * `pageid`; a page-id-supplied `missing` entry has neither `ns` nor `title`; an
 * `invalid` title has only `title`/`invalidreason`; a `special` entry has no
 * `pageid`. Narrow to this type only when the request cannot yield those states
 * — a `generator=` feed, or `pageids=` with known-good ids.
 */
export type ApiPageExisting = Require<ApiPage, "pageid" | "ns" | "title">;

/**
 * `prop=` fields their module writes unconditionally on an existing page. On
 * {@link QueryPageExisting} these are required when picked; on the all-state
 * {@link QueryPage} they stay optional, because invalid/special entries never
 * carry prop fields. Every other `prop=` key is omitted when its data is
 * absent (empty lists, non-file pages, non-category pages), so it stays
 * optional even on {@link QueryPageExisting}.
 */
export type PropConstantKeys =
  | "contentmodel"
  | "pagelanguage"
  | "pagelanguagehtmlcode"
  | "pagelanguagedir"
  | "touched"
  | "lastrevid"
  | "length" // `prop=info`
  | "revisions"; // `prop=revisions`

/**
 * {@link QueryPage} for a page that exists: the identity fields are required
 * rather than optional, and picked `prop=` fields that their module writes
 * unconditionally ({@link PropConstantKeys}) are required too. See
 * {@link ApiPageExisting} for when this holds.
 *
 * @example
 * // identity + revisions only, with pageid/ns/title required
 * const pages = Object.values(res.query.pages) as QueryPageExisting<'revisions'>[];
 */
export type QueryPageExisting<K extends keyof ApiPage> = Require<
  QueryPage<K>,
  "pageid" | "ns" | "title" | Extract<K, PropConstantKeys>
>;

/** A `{ from, to }` title pair emitted by the query framework. */
export interface ApiQueryTitlePair {
  /** The title as supplied. */
  from?: string;

  /** The title it resolved to. */
  to?: string;
}

/** One title resolved to a foreign wiki through an interwiki prefix. */
export interface ApiQueryInterwikiTitle {
  /** The supplied title, including its interwiki prefix. */
  title: string;

  /** Interwiki prefix that claimed the title. */
  iw: string;

  /** URL of the target page on the foreign wiki (`iwurl=1`). */
  url?: string;
}

/** One redirect resolved by the framework (`redirects=1`). */
export interface ApiQueryResolvedRedirect extends ApiQueryTitlePair {
  /** Fragment of the target title, when it carries one. */
  tofragment?: string;

  /** Interwiki prefix of the target, when it points off-site. */
  tointerwiki?: string;

  /**
   * 1-based rank of the redirect source in the generator's ordering, present
   * only when that source was fed by a generator (`generator=search` /
   * `generator=prefixsearch`). The rest of the source's generator data is
   * merged into the entry as well, while `from`/`to`/`tofragment`/`tointerwiki`
   * always win over it.
   */
  index?: number;
}

/** One requested `revid` that does not exist, keyed by revision id. */
export interface ApiQueryBadRev {
  /** The requested revision id. */
  revid?: number;

  /** The revision does not exist. A {@link Flag}. */
  missing?: Flag;
}

/**
 * Accumulated shape of the `query` result object.
 *
 * Framework-level keys live here; per-module list/meta keys are merged in by
 * their own files via declaration merging, keeping this open to extension.
 */
export interface ApiQueryResult {
  /** Title normalizations applied to the request. */
  normalized?: ApiQueryNormalized[];

  /** Page entries, present for title/pageid/generator-based queries. */
  pages?: ApiPage[];

  /**
   * Title conversions applied on a language-variant wiki when the request
   * allowed them (`converttitles`), as `{ from, to }` pairs.
   */
  converted?: ApiQueryTitlePair[];

  /**
   * Titles that resolved to an interwiki prefix; the framework does not
   * process them further.
   */
  interwiki?: ApiQueryInterwikiTitle[];

  /** Redirects resolved when the request set `redirects=1`. */
  redirects?: ApiQueryResolvedRedirect[];

  /**
   * Requested `revids` that do not exist, keyed by revision id. Emitted
   * instead of a `pages` entry for that revision.
   */
  badrevids?: Record<string, ApiQueryBadRev>;

  /**
   * Page ids of the returned pages (`indexpageids=1`). JSON map keys are
   * strings, so ids are strings here even under `formatversion=2`.
   */
  pageids?: string[];

  /** XML dump of the returned pages (`export=1`). */
  export?: string;
}

/** Response of `action=query`. `query` widens as modules get covered. */
export interface ApiQueryResponse extends ApiEnvelope {
  /**
   * Cursors to merge into the next request to fetch the following batch, absent
   * once every requested module is exhausted. The keys present depend on which
   * `prop=`/`list=`/`meta=`/`generator=` modules were requested.
   */
  continue?: ApiQueryContinue;

  /** Output of the requested `prop=`/`list=`/`meta=` modules. */
  query: ApiQueryResult;

  /** Effective limits per module, keyed by module name (e.g. `{ categories: 500 }`). */
  limits?: Record<string, number>;

  /**
   * Legacy continuation cursors, keyed by module and then by parameter name,
   * emitted at the root level (not under `query`) when the request sets
   * `rawcontinue=1`. It replaces `continue` / `batchcomplete`, which are not
   * emitted in that mode; `query-noncontinue` may appear alongside it.
   */
  "query-continue"?: Record<string, Record<string, string | number>>;

  /**
   * Parameters carried over from the previous batch that are not continuation
   * cursors, keyed by module and then by parameter name (`rawcontinue=1`).
   * Array values are joined with `|` before serialization.
   */
  "query-noncontinue"?: Record<string, Record<string, string | number>>;
}

export * from "./shared";
export * from "./info";
export * from "./categories";
export * from "./revisions";
export * from "./linkshere";
export * from "./redirects";
export * from "./transcludedin";
export * from "./fileusage";
export * from "./categorymembers";
export * from "./usercontribs";
export * from "./recentchanges";
export * from "./search";
export * from "./users";
export * from "./allusers";
export * from "./tags";
export * from "./logevents";
export * from "./blocks";
export * from "./contributors";
export * from "./imageinfo";
export * from "./links";
export * from "./images";
export * from "./extlinks";
export * from "./categoryinfo";
export * from "./allimages";
export * from "./allpages";
export * from "./langlinks";
export * from "./pageprops";
export * from "./prefixsearch";
export * from "./allcategories";
export * from "./backlinks";
export * from "./embeddedin";
export * from "./userinfo";
export * from "./watchlist";
export * from "./tokens";
export * from "./siteinfo";
export * from "./allmessages";
export * from "./templates";
export * from "./iwlinks";
export * from "./languageinfo";
export * from "./random";
export * from "./querypage";
export * from "./alllinks";
export * from "./allredirects";
export * from "./alltransclusions";
export * from "./exturlusage";
export * from "./pageswithprop";
export * from "./pagepropnames";
export * from "./imageusage";
export * from "./iwbacklinks";
export * from "./langbacklinks";
export * from "./filerepoinfo";
export * from "./protectedtitles";
export * from "./watchlistraw";
export * from "./deletedrevisions";
export * from "./alldeletedrevisions";
export * from "./allrevisions";
export * from "./allfileusages";
export * from "./deletedrevs";
export * from "./filearchive";
export * from "./mystashedfiles";
export * from "./duplicatefiles";
export * from "./stashimageinfo";
export * from "./authmanagerinfo";
export * from "./codexicons";
export * from "./trackingcategories";
