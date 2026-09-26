/**
 * `list=pagepropnames` — every page property name in use on the wiki, merged
 * into {@link ApiQueryResult}. Feeds `pwppropname` of `list=pageswithprop` and
 * `ppprop` of `prop=pageprops`.
 *
 * @see https://www.mediawiki.org/wiki/API:Pagepropnames
 */

/** One page property name in use. */
export interface ApiPagePropName {
  /** Property name as stored in `page_props`, e.g. `displaytitle`. */
  propname: string;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Distinct page property names (`list=pagepropnames`). */
    pagepropnames?: ApiPagePropName[];
  }
}
