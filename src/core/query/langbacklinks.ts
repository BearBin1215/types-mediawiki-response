/**
 * `list=langbacklinks` — pages that link to a given interlanguage target,
 * merged into {@link ApiQueryResult}. The reverse of `prop=langlinks`.
 *
 * @see https://www.mediawiki.org/wiki/API:Langbacklinks
 */
import type { Flag } from "../../common";
import type { ApiPageRef } from "./shared";

/** One page carrying the searched language link. */
export interface ApiLangbacklink extends ApiPageRef {
  /** `true` when the linking page is a redirect. A {@link Flag}. */
  redirect?: Flag;

  /** Language code of the matched link, e.g. `de`. `lblprop=lllang`. */
  lllang?: string;

  /** Target title on the other language's wiki. `lblprop=lltitle`. */
  lltitle?: string;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Pages linking to `lbllang`:`lbltitle` (`list=langbacklinks`). */
    langbacklinks?: ApiLangbacklink[];
  }
}
