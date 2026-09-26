/**
 * `prop=categories` — the categories a page belongs to, merged into the shared
 * {@link ApiPage} shape via declaration merging.
 *
 * @see https://www.mediawiki.org/wiki/API:Categories
 */
import type { NamespaceIndex, Timestamp } from "../../common";

/** One category membership entry; `clprop` selects the optional fields. */
export interface ApiCategory {
  /** Namespace index (the Category namespace, 14). */
  ns: NamespaceIndex;

  /** Full category title, e.g. `Category:Manual`. */
  title: string;

  /** Raw (hex) sort key. `clprop=sortkey`. */
  sortkey?: string;

  /** Human-readable sort key prefix. `clprop=sortkey`. */
  sortkeyprefix?: string;

  /** When the page was added to the category. `clprop=timestamp`. */
  timestamp?: Timestamp;

  /** Whether the category is hidden. `clprop=hidden`; a real `boolean` (not a `Flag`). */
  hidden?: boolean;
}

declare module "./index" {
  interface ApiPage {
    /** Categories the page belongs to (`prop=categories`). */
    categories?: ApiCategory[];
  }
}
