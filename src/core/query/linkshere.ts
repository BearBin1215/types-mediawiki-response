/**
 * `prop=linkshere` — pages that link to the queried page, merged into
 * {@link ApiPage} via declaration merging. Each entry is a lightweight page
 * reference (not a full {@link ApiPage}).
 *
 * @see https://www.mediawiki.org/wiki/API:Linkshere
 */
import type { NamespaceIndex } from "../../common";

/** One page in a `linkshere` result. `lhprop` controls which fields appear. */
export interface ApiLinksHere {
  /** Page id. `lhprop=pageid`. */
  pageid?: number;

  /** Namespace index. */
  ns?: NamespaceIndex;

  /** Full page title. */
  title?: string;

  /** Whether the linking page is a redirect. `lhprop=redirect`; a real `boolean`. */
  redirect?: boolean;
}

declare module "./index" {
  interface ApiPage {
    /** Pages linking to this page (`prop=linkshere`). */
    linkshere?: ApiLinksHere[];
  }
}
