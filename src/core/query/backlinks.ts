/**
 * `list=backlinks` — pages that link to a given title, merged into
 * {@link ApiQueryResult}. The title-based sibling of `prop=linkshere` (which is
 * keyed per queried page rather than by a single `bltitle`).
 *
 * The module has no `blprop` parameter: every entry carries `pageid`,
 * `ns` and `title`. With `blredirect=1`, an entry that is itself a redirect
 * nests the pages linking through it under `redirlinks`.
 *
 * @see https://www.mediawiki.org/wiki/API:Backlinks
 */
import type { Flag } from "../../common";
import type { ApiPageRef } from "./shared";

/** One page that links to the target title. */
export interface ApiBacklink extends ApiPageRef {
  /** The linking page is itself a redirect. A {@link Flag}. */
  redirect?: Flag;

  /**
   * Pages that link through this redirect to the target title. Only on a
   * `redirect` entry, and only with `blredirect=1`.
   */
  redirlinks?: ApiBacklink[];
}

declare module "./index" {
  interface ApiQueryResult {
    /** Pages linking to `bltitle` (`list=backlinks`). */
    backlinks?: ApiBacklink[];
  }
}
