/**
 * `prop=redirects` — pages that redirect to the queried page, merged into
 * {@link ApiPage} via declaration merging.
 *
 * @see https://www.mediawiki.org/wiki/API:Redirects
 */
import type { NamespaceIndex } from "../../common";

/** One redirect entry. `rdprop` controls which fields appear. */
export interface ApiRedirect {
  /** Page id of the redirect. `rdprop=pageid`. */
  pageid?: number;

  /** Namespace index. */
  ns?: NamespaceIndex;

  /** Full title of the redirect page. */
  title?: string;

  /**
   * Section/anchor fragment the redirect points to. `rdprop=fragment`.
   * Omitted entirely when the redirect has no fragment.
   */
  fragment?: string;
}

declare module "./index" {
  interface ApiPage {
    /** Redirects pointing at this page (`prop=redirects`). */
    redirects?: ApiRedirect[];
  }
}
