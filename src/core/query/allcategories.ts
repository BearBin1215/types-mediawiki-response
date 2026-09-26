/**
 * `list=allcategories` — enumerate all categories with their sizes, merged into
 * {@link ApiQueryResult}.
 *
 * @see https://www.mediawiki.org/wiki/API:Allcategories
 */

/** One category summary. `acprop=size|hidden` selects the optional fields. */
export interface ApiAllCategory {
  /** Category name, without the `Category:` prefix. */
  category: string;

  /** Total members (pages + subcats + files). `acprop=size`. */
  size?: number;

  /** Number of pages. `acprop=size`. */
  pages?: number;

  /** Number of files. `acprop=size`. */
  files?: number;

  /** Number of subcategories. `acprop=size`. */
  subcats?: number;

  /** Whether the category is hidden. `acprop=hidden`; a real `boolean`. */
  hidden?: boolean;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Categories listed by `list=allcategories`. */
    allcategories?: ApiAllCategory[];
  }
}
