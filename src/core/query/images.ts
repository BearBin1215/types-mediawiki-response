/**
 * `prop=images` — the files (images) used/embedded by a page, merged into
 * {@link ApiPage}. `formatversion=2` returns `{ ns, title }` per image.
 *
 * @see https://www.mediawiki.org/wiki/API:Images
 */
import type { NamespaceIndex } from "../../common";

/** One image used by a page. */
export interface ApiUsedImage {
  /** Namespace index (the File namespace). */
  ns: NamespaceIndex;

  /** Full file title, e.g. `File:Example.png`. */
  title: string;
}

declare module "./index" {
  interface ApiPage {
    /** Files embedded by this page (`prop=images`). */
    images?: ApiUsedImage[];
  }
}
