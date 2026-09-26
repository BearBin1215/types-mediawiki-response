/**
 * `prop=stashimageinfo` — metadata of files sitting in the current user's upload
 * stash, selected by `siifilekey` rather than by title.
 *
 * Because the query is keyed by filekey, the rows come back as `query.stashimageinfo`
 * instead of hanging off a `pages[]` entry, and the response does not echo the
 * `filekey` — entries follow the order of the requested keys.
 *
 * `siiprop` is a subset of `prop=imageinfo`'s `iiprop` in 1.43: `user`, `userid`,
 * `comment`, `parsedcomment`, `mediatype`, `archivename` and `uploadwarning` are
 * not accepted values here. Unlike `list=filearchive`, the measurements here are
 * numbers.
 *
 * @see https://www.mediawiki.org/wiki/API:Stashimageinfo
 */
import type { Timestamp } from "../../common";
import type { ApiExtMetadataField, ApiImageMetadataItem } from "./imageinfo";

/** Metadata of one stashed file. */
export interface ApiStashImageInfo {
  /** When the file was stashed. `siiprop=timestamp`. */
  timestamp?: Timestamp;

  /** Canonical localized file title. `siiprop=canonicaltitle`. */
  canonicaltitle?: string;

  /** Size in bytes. `siiprop=size|dimensions`. */
  size?: number;

  /** Pixel height. `siiprop=size|dimensions`. */
  height?: number;

  /** Pixel width. `siiprop=size|dimensions`. */
  width?: number;

  /** Content checksum (hex). `siiprop=sha1`. */
  sha1?: string;

  /** MIME type, e.g. `image/png`. `siiprop=mime`. */
  mime?: string;

  /**
   * MIME type the thumbnail will be rendered as. `siiprop=thumbmime`; requires
   * `siiprop=url` and a transform via `siiurlwidth`/`siiurlheight`.
   */
  thumbmime?: string;

  /** Colour depth in bits. `siiprop=bitdepth`. */
  bitdepth?: number;

  /** Direct URL to the stashed file (an `Special:UploadStash/file/…` link). `siiprop=url`. */
  url?: string;

  /** URL of the file description page. `siiprop=url`; equals {@link url} for a stashed file. */
  descriptionurl?: string;

  /** Shortened description-page URL. `siiprop=url`; only when the repo returns one. */
  descriptionshorturl?: string;

  /**
   * Scaled thumbnail URL. Requires `siiprop=url`, plus a transform requested
   * via `siiurlwidth`, `siiurlheight` or `siiurlparam`.
   */
  thumburl?: string;

  /**
   * Scaled thumbnail width (px). Falls back to the file's own width when no
   * resize happened. Same requirements as {@link thumburl}.
   */
  thumbwidth?: number;

  /** Scaled thumbnail height (px). Falls back to the file's own height like {@link thumbwidth}. */
  thumbheight?: number;

  /**
   * HiDPI (`2x`, …) source URLs keyed by pixel-density multiplier. Requires
   * `siiprop=url`, plus a successful transform.
   */
  responsiveUrls?: Record<string, string>;

  /**
   * Rendered text of the thumbnail error, when the requested thumbnail could
   * not be made. Requires `siiprop=url`, plus a transform via
   * `siiurlwidth`/`siiurlheight`/`siiurlparam`.
   */
  thumberror?: string;

  /**
   * Raw format metadata (EXIF / PNG chunks / …). `siiprop=metadata`;
   * `null` when the file has none.
   */
  metadata?: ApiImageMetadataItem[] | null;

  /**
   * Metadata keys common to all file types, same item shape as
   * {@link metadata}. `siiprop=commonmetadata`; an empty PHP map, so `[]`
   * when there is none.
   */
  commonmetadata?: ApiImageMetadataItem[];

  /** Structured/extended metadata keyed by field name. `siiprop=extmetadata`. */
  extmetadata?: Record<string, ApiExtMetadataField>;

  /**
   * Media duration in seconds (audio/video), when the handler reports one.
   * Emitted under `siiprop=size|dimensions`; there is no
   * `siiprop=duration`.
   */
  duration?: number;

  /**
   * Page count (multi-page documents such as PDFs/TIFFs), when the handler
   * supports one. Emitted under `siiprop=size|dimensions`; there
   * is no `siiprop=pagecount`.
   */
  pagecount?: number;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Stashed files named by `siifilekey` (`prop=stashimageinfo`). */
    stashimageinfo?: ApiStashImageInfo[];
  }
}
