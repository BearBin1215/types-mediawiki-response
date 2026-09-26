/**
 * `list=imageusage` — pages that use a given file, merged into
 * {@link ApiQueryResult}. The title-based sibling of `prop=fileusage` (which is
 * keyed per queried file rather than by a single `iutitle`).
 *
 * The module has no `iuprop` parameter: every entry carries `pageid`,
 * `ns` and `title`. `iufilterredir` selects which using pages are listed
 * (default `all`, i.e. redirects included); a listed page that is itself a
 * redirect carries a `redirect` flag, and with `iuredirect=1` such an entry
 * nests the pages using the file through it under `redirlinks`.
 *
 * @see https://www.mediawiki.org/wiki/API:Imageusage
 */
import type { Flag } from "../../common";
import type { ApiPageRef } from "./shared";

/** One page that uses the target file. */
export interface ApiImageUsage extends ApiPageRef {
  /** The using page is itself a redirect. A {@link Flag}. */
  redirect?: Flag;

  /**
   * Pages that use the file through this redirect. Only on a `redirect`
   * entry, and only with `iuredirect=1`.
   */
  redirlinks?: ApiImageUsage[];
}

declare module "./index" {
  interface ApiQueryResult {
    /** Pages using the file given to `iutitle` (`list=imageusage`). */
    imageusage?: ApiImageUsage[];
  }
}
