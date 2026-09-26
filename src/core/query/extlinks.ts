/**
 * `prop=extlinks` — external (non-wiki) URLs linked by a page, merged into
 * {@link ApiPage}.
 *
 * @see https://www.mediawiki.org/wiki/API:Extlinks
 */

/** One external link used by a page. */
export interface ApiExternalLink {
  /** Full external URL. */
  url: string;
}

declare module "./index" {
  interface ApiPage {
    /** External links on this page (`prop=extlinks`). */
    extlinks?: ApiExternalLink[];
  }
}
