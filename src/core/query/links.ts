/**
 * `prop=links` — the wikilinks a page makes (forward links), merged into
 * {@link ApiPage}. The inverse of `prop=linkshere`.
 *
 * Under `formatversion=2` each row is exactly `{ ns, title }`.
 *
 * @see https://www.mediawiki.org/wiki/API:Links
 */
import type { NamespaceIndex } from "../../common";

/** One link made by a page. */
export interface ApiPageLink {
  /** Namespace index. */
  ns: NamespaceIndex;

  /** Linked page title. */
  title: string;
}

declare module "./index" {
  interface ApiPage {
    /** Pages linked-to by this page (`prop=links`). */
    links?: ApiPageLink[];
  }
}
