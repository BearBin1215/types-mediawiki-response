/**
 * `list=trackingcategories` — enumerate tracking categories that have members
 * (or an existing category page), merged into {@link ApiQueryResult}.
 *
 * @see https://www.mediawiki.org/wiki/API:Trackingcategories
 * @since MediaWiki 1.45
 */
import type { ApiAllCategory } from "./allcategories";

/** One tracking-category entry. `tcprop=size|hidden` controls the size fields. */
export interface ApiTrackingCategory extends ApiAllCategory {
  /** Message key of the tracking category (e.g. `broken-file-category`). */
  catid: string;
}

declare module "./index" {
  interface ApiQueryResult {
    /**
     * Tracking categories listed by `list=trackingcategories`. Entries share
     * the `list=allcategories` shape plus {@link catid}; `size`/`hidden` only
     * with the matching `tcprop` values.
     *
     * @since MediaWiki 1.45
     */
    trackingcategories?: ApiTrackingCategory[];
  }
}
