/**
 * `list=allimages` — enumerate uploaded files, merged into {@link ApiQueryResult}.
 * Each entry carries the image-info fields selected by `aiprop` (default
 * `timestamp|url`) plus the identifying `name` / `ns` / `title`; `aimime` only
 * filters which files are listed.
 *
 * @see https://www.mediawiki.org/wiki/API:Allimages
 */
import type { NamespaceIndex } from "../../common";
import type { ApiImageInfo } from "./imageinfo";

/** One file listed by `list=allimages`. */
export interface ApiAllImage extends ApiImageInfo {
  /** File name without the `File:` prefix. */
  name: string;

  /** Namespace index (the File namespace, 6). */
  ns: NamespaceIndex;

  /** Full file title, e.g. `File:Wiki.png`. */
  title: string;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Uploaded files (`list=allimages`). */
    allimages?: ApiAllImage[];
  }
}
