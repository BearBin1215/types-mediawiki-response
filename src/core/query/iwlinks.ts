/**
 * `prop=iwlinks` — interwiki links on a page, merged into the shared
 * {@link ApiPage} shape via declaration merging.
 *
 * @see https://www.mediawiki.org/wiki/API:Iwlinks
 */

/** One interwiki link. */
export interface ApiInterwikiLink {
  /** Interwiki prefix, e.g. `en` / `m`. */
  prefix: string;

  /** Target title. */
  title: string;

  /** Resolved target URL. `iwprop=url`, or the deprecated boolean `iwurl` parameter. */
  url?: string;
}

declare module "./index" {
  interface ApiPage {
    /** Interwiki links on the page (`prop=iwlinks`). */
    iwlinks?: ApiInterwikiLink[];
  }
}
