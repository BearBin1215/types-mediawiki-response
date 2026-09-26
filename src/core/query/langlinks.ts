/**
 * `prop=langlinks` — interlanguage links (links to the same subject in other
 * language wikis), merged into {@link ApiPage}. Rows appear when the pages
 * carry interlanguage links; a wiki (or page) without any yields none.
 *
 * `url` / `langname` / `autonym` come from `llprop`.
 *
 * @see https://www.mediawiki.org/wiki/API:Langlinks
 */

/** One interlanguage link. */
export interface ApiLangLink {
  /** Target language code, e.g. `de`. */
  lang: string;

  /** Title of the linked page on the target wiki. */
  title: string;

  /** Full URL of the linked page. `llprop=url`. */
  url?: string;

  /**
   * Language name, localized to `inlanguagecode`, which defaults to the site's
   * content language (not the requesting user's UI language). `llprop=langname`.
   */
  langname?: string;

  /** Language name in its own language. `llprop=autonym`. */
  autonym?: string;
}

declare module "./index" {
  interface ApiPage {
    /** Interlanguage links from this page (`prop=langlinks`). */
    langlinks?: ApiLangLink[];
  }
}
