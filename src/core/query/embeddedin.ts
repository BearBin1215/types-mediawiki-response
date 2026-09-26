/**
 * `list=embeddedin` — pages that transclude (embed) a given title, merged into
 * {@link ApiQueryResult}. The title-based sibling of `prop=transcludedin`.
 *
 * The module has no `eiprop` parameter: every entry carries `pageid`,
 * `ns` and `title`. Unlike `list=backlinks`, there is no redirect parameter, so
 * results are never nested.
 *
 * @see https://www.mediawiki.org/wiki/API:Embeddedin
 */
import type { Flag } from "../../common";
import type { ApiPageRef } from "./shared";

/** One page that embeds the target title. */
export interface ApiEmbeddedIn extends ApiPageRef {
  /** The embedding page is itself a redirect. A {@link Flag}. */
  redirect?: Flag;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Pages embedding `eititle` (`list=embeddedin`). */
    embeddedin?: ApiEmbeddedIn[];
  }
}
