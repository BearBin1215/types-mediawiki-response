/**
 * `list=search` — full-text search results, merged into {@link ApiQueryResult}
 * via declaration merging, together with the `searchinfo` summary object.
 *
 * As `generator=search` the same hit fields are injected into `query.pages`
 * entries — and into a `query.redirects` entry whose source is one of those
 * pages — where the `g`-prefixed parameter forms apply (`gsrprop` / `gsrinfo`)
 * and the framework adds `index`.
 *
 * Interwiki hits are reported outside `query.search`: `srinterwiki=1` collects
 * them under `query.interwikisearch` keyed by interwiki prefix, and
 * `enablerewrites=1` may surface backend-rewritten hits inline under
 * `query.additionalsearch`. Each section carries its own totalhits counter
 * under `<section>searchinfo`.
 *
 * @see https://www.mediawiki.org/wiki/API:Search
 */
import type { Flag, NamespaceIndex, Timestamp } from "../../common";
import type { QueryPage } from "./index";

/**
 * One search hit (`list=search`), and the page data `generator=search` injects
 * into a `query.pages` entry.
 *
 * Which fields appear is controlled by `srprop` for `list=search` and by
 * `gsrprop` for `generator=search`. The two differ in their default: `gsrprop`
 * defaults to empty in generator mode, so only `ns`, `title`, `pageid` and the
 * injected `index` appear unless `gsrprop` is passed explicitly.
 */
export interface ApiSearchResult {
  /** Namespace index. */
  ns?: NamespaceIndex;

  /** Full page title. */
  title?: string;

  /** Page id. */
  pageid?: number;

  /** Page size in bytes. `srprop=size`. */
  size?: number;

  /** Word count. `srprop=wordcount`. */
  wordcount?: number;

  /** Last-edit timestamp. `srprop=timestamp`. */
  timestamp?: Timestamp;

  /** HTML snippet of the match, with highlights. `srprop=snippet`. */
  snippet?: string;

  /** HTML snippet of the title. `srprop=titlesnippet`. */
  titlesnippet?: string;

  /** Snippet of the matching category. `srprop=categorysnippet`. */
  categorysnippet?: string;

  /** Title of the section the match is in. `srprop=sectiontitle`. */
  sectiontitle?: string;

  /** HTML snippet of the section heading. `srprop=sectionsnippet`. */
  sectionsnippet?: string;

  /** Title of the redirect target, if this hit redirects. `srprop=redirecttitle`. */
  redirecttitle?: string;

  /** HTML snippet of the redirect target title. `srprop=redirectsnippet`. */
  redirectsnippet?: string;

  /** Whether the hit matched a file. `srprop=isfilematch`; a real `boolean`. */
  isfilematch?: boolean;

  /** Search-backend extension data, keyed by augmentor name. `srprop=extensiondata`. */
  extensiondata?: unknown;
}

/**
 * A `list=search` hit. The module writes `ns`, `title` and `pageid` for every
 * hit, before any `srprop` value is considered, so they are required here —
 * unlike {@link ApiSearchResult}, which stays all-optional because
 * `generator=search` merges the same shape into {@link ApiPage} entries.
 */
export type ApiSearchHit = ApiSearchResult & {
  /** Namespace index. */
  ns: NamespaceIndex;

  /** Full page title. */
  title: string;

  /** Page id. */
  pageid: number;
};

/**
 * One interwiki search hit, an element of
 * {@link ApiQueryResult.interwikisearch} / {@link ApiQueryResult.additionalsearch}.
 * Fields follow `srprop` exactly like {@link ApiSearchResult}, except `title`
 * is the bare page name without the namespace, `pageid` is always `0`, and the
 * interwiki namespace/URL fields below are added.
 */
export interface ApiSearchInterwikiResult extends ApiSearchResult {
  /** Namespace name on the foreign wiki, as text. */
  namespace?: string;

  /** Full URL of the hit on the foreign wiki. */
  url?: string;
}

/** Total-hit counter of an interwiki search section. */
export interface ApiSearchInterwikiInfo {
  /** Total number of interwiki hits across prefixes. */
  totalhits?: number;
}

/** Per-search metadata (`list=search`'s `searchinfo` sibling). */
export interface ApiSearchInfo {
  /** Total number of matches (may be capped by the search backend). */
  totalhits?: number;

  /**
   * Present (and `true`) when {@link totalhits} is only an approximation, i.e.
   * the backend stopped counting early. A {@link Flag}: the key is omitted
   * rather than set to `false`.
   *
   * @since MediaWiki 1.44
   */
  approximate_totalhits?: Flag;

  /** Suggested rewrite when the query had no/few results (`srinfo=suggestion`). */
  suggestion?: string;

  /** HTML snippet of the suggestion, with the changed terms highlighted (`srinfo=suggestion`). */
  suggestionsnippet?: string;

  /** The query after search-side rewriting (`srinfo=rewrittenquery`). */
  rewrittenquery?: string;

  /** HTML snippet of the rewritten query, with the changes highlighted (`srinfo=rewrittenquery`). */
  rewrittenquerysnippet?: string;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Search results (`list=search`). */
    search?: ApiSearchHit[];

    /**
     * Search summary metadata. Emitted by `list=search`, or by
     * `generator=search` when the request passes `gsrinfo` — the generator
     * form defaults to no `searchinfo` at all.
     */
    searchinfo?: ApiSearchInfo;

    /**
     * Interwiki search hits keyed by interwiki prefix (`srinterwiki=1`).
     */
    interwikisearch?: Record<string, ApiSearchInterwikiResult[]>;

    /** Total-hit counter for {@link interwikisearch}. */
    interwikisearchinfo?: ApiSearchInterwikiInfo;

    /**
     * Interwiki hits the backend matched inline (`enablerewrites=1`), same
     * shape as {@link interwikisearch}.
     */
    additionalsearch?: Record<string, ApiSearchInterwikiResult[]>;

    /** Total-hit counter for {@link additionalsearch}. */
    additionalsearchinfo?: ApiSearchInterwikiInfo;
  }

  interface ApiPage extends ApiSearchResult {}

  interface ApiQueryResolvedRedirect extends ApiSearchResult {}
}

/**
 * A page projected to the hit fields `generator=search` injects, plus the
 * framework-injected {@link ApiPage.index}.
 */
export type SearchPage = QueryPage<keyof ApiSearchResult>;
