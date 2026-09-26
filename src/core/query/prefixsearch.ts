/**
 * `list=prefixsearch` — titles beginning with a given prefix (the autocomplete
 * backend of the search box), merged into {@link ApiQueryResult}.
 *
 * As `generator=prefixsearch` it populates `query.pages`, injecting only `index`
 * into each entry.
 *
 * @see https://www.mediawiki.org/wiki/API:Prefixsearch
 */
import type { Flag, NamespaceIndex } from "../../common";

/** One prefix-search hit. */
export interface ApiPrefixSearchResult {
  /** Page id. Absent on a {@link special} hit, which takes its place. */
  pageid?: number;

  /** The hit is a special page; takes the place of `pageid`. A {@link Flag}. */
  special?: Flag;

  /** Namespace index. */
  ns: NamespaceIndex;

  /** Full page title. */
  title: string;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Prefix-search results (`list=prefixsearch`). */
    prefixsearch?: ApiPrefixSearchResult[];
  }
}
