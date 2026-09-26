/**
 * `list=alllinks` — enumerate titles that are linked to, merged into
 * {@link ApiQueryResult}.
 *
 * MediaWiki implements `alllinks`, `allredirects` and `alltransclusions` with one
 * class, so all three emit the same row shape ({@link ApiAllLink}); the other two
 * merge their own result keys in their own files.
 *
 * @see https://www.mediawiki.org/wiki/API:Alllinks
 */
import type { NamespaceIndex } from "../../common";

/** One linked (or redirected-to / transcluded) title. */
export interface ApiAllLink {
  /**
   * Page id of the page holding the link (`alprop=ids`). Without `alunique` a
   * target appears once per linking page, each row carrying that page's id;
   * `alunique` lists each target once and drops the source page id, so it
   * cannot be combined with `*prop=ids`.
   */
  fromid?: number;

  /** Namespace index of the linked title. `alprop=title` (default). */
  ns?: NamespaceIndex;

  /** Full title of the linked page. */
  title?: string;
}

declare module "./index" {
  interface ApiQueryResult {
    /**
     * Titles linked to (`list=alllinks`), ordered by link target — title, or
     * target id on the linktarget schema — then by source page id.
     */
    alllinks?: ApiAllLink[];
  }
}
