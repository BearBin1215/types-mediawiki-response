/**
 * `list=filearchive` — files removed by deletion (whole-page deletes and
 * overwritten uploads alike), merged into {@link ApiQueryResult}. Viewing the
 * description fields needs `deletedhistory`; the file itself needs `deletedtext`.
 *
 * Sizes are **strings** here (`"70"`, `"1"`, `"8"`): the module passes the
 * `filearchive` columns through without casting, unlike `prop=imageinfo` (numbers)
 * and `list=mystashedfiles` (numbers).
 *
 * @see https://www.mediawiki.org/wiki/API:Filearchive
 */
import type { Flag, NamespaceIndex, Timestamp } from "../../common";
import type { ApiImageMetadataItem } from "./imageinfo";
import type { ApiHiddenFlags } from "./shared";

/**
 * One archived file. `faprop` selects the optional fields; `id`, `name`, `ns`
 * and `title` are emitted regardless of `faprop`.
 */
export interface ApiFileArchiveEntry extends ApiHiddenFlags {
  /** `filearchive` row id. */
  id: number;

  /** File name with underscores, without the `File:` prefix. */
  name: string;

  /** Namespace the file page lived in (always the File namespace). */
  ns: NamespaceIndex;

  /** Full file page title. */
  title: string;

  /**
   * Stored name of a superseded version. Only on an archived *old* version —
   * absent for the newest stored file, even with `faprop=archivename`.
   */
  archivename?: string;

  /** Upload timestamp. `faprop=timestamp`. */
  timestamp?: Timestamp;

  /** Uploader name. `faprop=user`. */
  user?: string;

  /** Uploader id. `faprop=user`. */
  userid?: number;

  /** The file's stored content is missing. A {@link Flag}. */
  filemissing?: Flag;

  /** Raw upload description (the file page's text). `faprop=description`. */
  description?: string;

  /** HTML-rendered upload description. `faprop=parseddescription`. */
  parseddescription?: string;

  /**
   * File size in bytes, as a string. Emitted with either `faprop=size` or
   * `faprop=dimensions`.
   */
  size?: string;

  /**
   * Number of pages, for multi-page formats; absent for formats without pages.
   * Emitted with either `faprop=size` or `faprop=dimensions`.
   */
  pagecount?: number;

  /** Pixel height, as a string. Emitted with either `faprop=size` or `faprop=dimensions`. */
  height?: string;

  /** Pixel width, as a string. Emitted with either `faprop=size` or `faprop=dimensions`. */
  width?: string;

  /** Content checksum (hex). `faprop=sha1`. */
  sha1?: string;

  /**
   * MIME type, e.g. `image/png`. `faprop=mime`; requires the file content to be
   * visible to the requester (revision-delete bitfield) and present.
   */
  mime?: string;

  /** MediaWiki media bucket, e.g. `BITMAP`. `faprop=mediatype`. */
  mediatype?: string;

  /**
   * Colour depth in bits, as a string. `faprop=bitdepth`; same visibility gate
   * as `mime`.
   */
  bitdepth?: string;

  /**
   * Raw format metadata (EXIF / PNG chunks / …). `faprop=metadata`; `null` when the
   * row carries none.
   */
  metadata?: ApiImageMetadataItem[] | null;

  /** The file itself is hidden. A {@link Flag}. */
  filehidden?: Flag;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Deleted/overwritten files (`list=filearchive`). */
    filearchive?: ApiFileArchiveEntry[];
  }
}
