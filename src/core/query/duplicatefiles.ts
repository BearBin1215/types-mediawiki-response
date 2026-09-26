/**
 * `prop=duplicatefiles` — other files that share a file's checksum, merged into
 * the shared {@link ApiPage}. How a client discovers a “this file already exists”
 * answer after the fact; `list=allimages` and `prop=imageinfo` reach the same
 * rows by `sha1`.
 *
 * The module takes no `prop` parameter; `user` needs a visible uploader.
 * `dflocalonly` limits it to the local repo, `dfdir`/`dfcontinue` page it.
 *
 * @see https://www.mediawiki.org/wiki/API:Duplicatefiles
 */
import type { Timestamp } from "../../common";

/** One other file with the same content. */
export interface ApiDuplicateFile {
  /** File name with underscores, without the `File:` prefix. */
  name: string;

  /** When that file's current version was uploaded. */
  timestamp: Timestamp;

  /** Whether the file lives on a shared repo rather than this wiki. A real `boolean`. */
  shared: boolean;

  /** Uploader of that file's current version. Absent when the uploader is hidden. */
  user?: string;
}

declare module "./index" {
  interface ApiPage {
    /** Files whose content matches this one (`prop=duplicatefiles`). */
    duplicatefiles?: ApiDuplicateFile[];
  }
}
