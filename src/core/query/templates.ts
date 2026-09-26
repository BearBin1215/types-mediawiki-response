/**
 * `prop=templates` — templates (and other pages) transcluded by a page, merged
 * into the shared {@link ApiPage} shape via declaration merging.
 *
 * @see https://www.mediawiki.org/wiki/API:Templates
 */
import type { NamespaceIndex } from "../../common";

/** One page transcluded by the subject page. */
export interface ApiTemplate {
  /** Namespace index of the transcluded page. */
  ns: NamespaceIndex;

  /** Title of the transcluded page. */
  title: string;
}

declare module "./index" {
  interface ApiPage {
    /** Pages transcluded by this page (`prop=templates`). */
    templates?: ApiTemplate[];
  }
}
