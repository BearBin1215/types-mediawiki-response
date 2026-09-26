/**
 * `prop=categoryinfo` — membership counts for a category page, merged into
 * {@link ApiPage} as an object (not an array).
 *
 * @see https://www.mediawiki.org/wiki/API:Categoryinfo
 */

/** Category size statistics (`prop=categoryinfo`). */
export interface ApiCategoryInfo {
  /** Total member count: pages + subcategories + files (the raw `cat_pages` counter). */
  size: number;

  /** Number of content pages, excluding both subcategories and files. */
  pages: number;

  /** Number of files. */
  files: number;

  /** Number of subcategories. */
  subcats: number;

  /** Whether the category is a hidden category. A real `boolean`. */
  hidden: boolean;
}

declare module "./index" {
  interface ApiPage {
    /** Category membership counts (`prop=categoryinfo`). */
    categoryinfo?: ApiCategoryInfo;
  }
}
