/**
 * `list=iwbacklinks` — pages that link to a given interwiki target, merged into
 * {@link ApiQueryResult}. The reverse of `prop=iwlinks`.
 *
 * @see https://www.mediawiki.org/wiki/API:Iwbacklinks
 */
import type { Flag } from "../../common";
import type { ApiPageRef } from "./shared";

/** One page carrying the searched interwiki link. */
export interface ApiIwbacklink extends ApiPageRef {
  /** `true` when the linking page is a redirect. A {@link Flag}. */
  redirect?: Flag;

  /** Interwiki prefix of the matched link, e.g. `q`. `iwblprop=iwprefix`. */
  iwprefix?: string;

  /** Target title on the remote wiki. `iwblprop=iwtitle`. */
  iwtitle?: string;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Pages linking to `iwblprefix`:`iwbltitle` (`list=iwbacklinks`). */
    iwbacklinks?: ApiIwbacklink[];
  }
}
