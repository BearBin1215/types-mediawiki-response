/**
 * `list=exturlusage` — pages that carry a given external URL, merged into
 * {@link ApiQueryResult}. The list-side counterpart of `prop=extlinks`, which
 * reads a page's URLs rather than searching for a URL's pages.
 *
 * @see https://www.mediawiki.org/wiki/API:Exturlusage
 */
import type { NamespaceIndex } from "../../common";

/** One page whose content links to the searched URL. */
export interface ApiExtUrlUsage {
  /** Page id. `euprop=ids`. */
  pageid?: number;

  /** Namespace index. `euprop=title` (default). */
  ns?: NamespaceIndex;

  /** Full page title. */
  title?: string;

  /**
   * The matched URL, reconstructed from the `externallinks` row (domain index
   * plus stored path), not verbatim page text. `euprop=url` (default);
   * `euexpandurl=1` expands protocol-relative URLs to the canonical protocol
   * (deprecated since MediaWiki 1.43).
   */
  url?: string;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Pages using the URL given to `euquery` (`list=exturlusage`). */
    exturlusage?: ApiExtUrlUsage[];
  }
}
