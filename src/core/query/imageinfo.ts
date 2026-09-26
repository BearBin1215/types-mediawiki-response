/**
 * `prop=imageinfo` — metadata about a file (image) page's current (or archived)
 * version, merged into the shared {@link ApiPage} via declaration merging.
 * Central to any file-heavy wiki. Which sub-fields appear depends on `iiprop`.
 *
 * @see https://www.mediawiki.org/wiki/API:Imageinfo
 */
import type { Flag, Timestamp } from "../../common";
import type { ApiHiddenFlags } from "./shared";
import type { QueryPage } from "./index";

/** One entry in a file's raw format `metadata` array (may nest further items). */
export interface ApiImageMetadataItem {
  /**
   * Metadata field name, e.g. `width`, `XResolution`; positional entries of
   * list-shaped fields (e.g. `ComponentsConfiguration`) use numeric names.
   */
  name?: string | number;

  /**
   * Field value; a scalar (booleans occur, e.g. through `META_BC_BOOLS`
   * serialization; EXIF RATIONALs serialize as `"num/den"` strings, GPS
   * coordinates arrive as numbers) or a nested list of
   * {@link ApiImageMetadataItem}.
   */
  value?: string | number | boolean | ApiImageMetadataItem[];
}

/**
 * A multilang metadata value (`iiextmetadatamultilang=1`): the map of language
 * codes to values that the API otherwise collapses to the best-matching
 * language. `x-default` holds the fallback translation.
 */
export interface ApiExtMetadataMultilangValue {
  /** Serialization marker of the multilang map. */
  _type?: "lang";

  /** The value per language code (e.g. `en`, `de`, `x-default`). */
  [lang: string]: string | number | undefined;
}

/** One structured `extmetadata` field. */
export interface ApiExtMetadataField {
  /**
   * Field value: a string for most fields, numeric for a few (e.g. the
   * extension version), or the raw {@link ApiExtMetadataMultilangValue} map
   * when the request set `iiextmetadatamultilang=1`.
   */
  value?: string | number | ApiExtMetadataMultilangValue;

  /** Where the value came from, e.g. `mediawiki-metadata`. */
  source?: string;

  /** Presentation hint; serialized as an empty string when set (fv2 quirk). */
  hidden?: string;
}

/** One scaled thumbnail entry (a keyed value of {@link ApiImageInfo.thumburls}). */
export interface ApiThumbUrlEntry {
  /** Thumbnail source URL. */
  url?: string;

  /** Rendered width in pixels. */
  width?: number;

  /** Rendered height in pixels. */
  height?: number;

  /**
   * Additional pre-rendered `<img>` attributes merged by the transform
   * (typically `src`, `decoding` and `loading`, plus `srcset` when HiDPI
   * variants exist), same shape as {@link ApiImageInfo.thumbattribs}.
   */
  [attribute: string]: string | number | undefined;
}

/** One image-info entry for a file page. */
export interface ApiImageInfo extends ApiHiddenFlags {
  /** Timestamp of the file's upload/reversion. `iiprop=timestamp`. */
  timestamp?: Timestamp;

  /** Uploader user name. `iiprop=user`. */
  user?: string;

  /** Uploader user id. `iiprop=userid`. */
  userid?: number;

  /** Raw upload comment. `iiprop=comment`. */
  comment?: string;

  /** HTML-rendered comment. `iiprop=parsedcomment`. */
  parsedcomment?: string;

  /** File size in bytes. `iiprop=size|dimensions`. */
  size?: number;

  /**
   * Width in pixels; `0` for files without dimensions (e.g. audio).
   * `iiprop=size|dimensions`.
   */
  width?: number;

  /**
   * Height in pixels; `0` for files without dimensions (e.g. audio).
   * `iiprop=size|dimensions`.
   */
  height?: number;

  /** Canonical localized file title. `iiprop=canonicaltitle`. */
  canonicaltitle?: string;

  /** Direct URL to the file. `iiprop=url`. */
  url?: string;

  /** URL of the file description page. `iiprop=url`. */
  descriptionurl?: string;

  /** Shortened description-page URL. `iiprop=url`. */
  descriptionshorturl?: string;

  /**
   * Scaled thumbnail URL. Requires `iiprop=url`, plus a transform requested
   * via `iiurlwidth`, `iiurlheight` or `iiurlparam`.
   */
  thumburl?: string;

  /**
   * Scaled thumbnail width (px). Falls back to the file's own width when the
   * thumbnail URL equals the original URL (no resize happened). Same
   * requirements as {@link thumburl}.
   */
  thumbwidth?: number;

  /**
   * Scaled thumbnail height (px). Falls back to the file's own height like
   * {@link thumbwidth}.
   */
  thumbheight?: number;

  /**
   * Pre-rendered `<img>` attributes for the thumbnail (e.g. `src`, `width`,
   * `srcset`).
   *
   * @since MediaWiki 1.47
   */
  thumbattribs?: Record<string, string | number>;

  /**
   * Scaled thumbnail URLs at multiple widths, keyed by the produced
   * thumbnail's width (normally the requested width; e.g. `"400"`, `"800"`).
   * `iiprop=thumburls`. Each entry also folds in the transform's HTML `<img>`
   * attributes.
   *
   * @since MediaWiki 1.47
   */
  thumburls?: Record<string, ApiThumbUrlEntry>;

  /**
   * HiDPI (`2x`, …) source URLs keyed by pixel-density multiplier. Requires
   * `iiprop=url`, plus a successful transform.
   */
  responsiveUrls?: Record<string, string>;

  /** File SHA-1 (hex). `iiprop=sha1`. */
  sha1?: string;

  /** MIME type, e.g. `image/png`. `iiprop=mime`. */
  mime?: string;

  /** Media type, e.g. `BITMAP`, `OFFICE`, `ARCHIVE`. `iiprop=mediatype`. */
  mediatype?: string;

  /** Color bit depth; `0` for files without dimensions (e.g. audio). `iiprop=bitdepth`. */
  bitdepth?: number;

  /**
   * Raw format metadata (EXIF / PNG chunks / …). `iiprop=metadata`; an
   * explicit `null` when the file has no metadata at all.
   */
  metadata?: ApiImageMetadataItem[] | null;

  /**
   * Metadata keys common to all file types, same item shape as {@link metadata}.
   * `iiprop=commonmetadata`; an empty PHP map, so `[]` when there is none.
   */
  commonmetadata?: ApiImageMetadataItem[];

  /**
   * Structured/extended metadata keyed by field name. `iiprop=extmetadata`.
   * A bare MediaWiki core only produces `DateTime` and `ObjectName` here; the
   * richer per-file fields (GPS, licensing, …) are contributed by
   * `GetExtendedMetadata` hooks on the serving wiki (e.g. Extension:Metadata).
   */
  extmetadata?: Record<string, ApiExtMetadataField>;

  /**
   * MIME type the thumbnail will be rendered as. `iiprop=thumbmime`, which
   * requires `iiprop=url` and a transform via `iiurlwidth`/`iiurlheight`.
   */
  thumbmime?: string;

  /**
   * Rendered text of the thumbnail error, when the thumbnail could not be
   * made. Requires `iiprop=url`, plus a transform.
   */
  thumberror?: string;

  /**
   * Upload-warning HTML ("a file with this name exists already…").
   * `iiprop=uploadwarning`; `""` when there is nothing to warn about.
   */
  html?: string;

  /** `true` when the file itself does not exist on this wiki (a stub row). A {@link Flag}. */
  filemissing?: Flag;

  /**
   * Media duration in seconds (audio/video), when the handler reports one.
   * Emitted under `iiprop=size|dimensions`; there is no `iiprop=duration`.
   */
  duration?: number;

  /**
   * Page count (multi-page documents such as PDFs/TIFFs), when the handler
   * supports one. Emitted under `iiprop=size|dimensions`; there is no
   * `iiprop=pagecount`.
   */
  pagecount?: number;

  /** Archive name for a historical version. `iiprop=archivename`. */
  archivename?: string;

  /** The file itself is hidden. A {@link Flag}. */
  filehidden?: Flag;

  /** Made by an anonymous (IP) uploader. A {@link Flag}. */
  anon?: Flag;

  /**
   * The uploader is a temporary account. A {@link Flag}.
   *
   * @since MediaWiki 1.42
   */
  temp?: Flag;
}

/**
 * Page-level fields `prop=imageinfo` contributes to {@link ApiPage}.
 * {@link ImageInfoPage} projects exactly this set.
 */
export interface ApiPageImageInfo {
  /**
   * Where the file is hosted: the repository name, `local` for this wiki;
   * `''` when the file does not exist. Framework field for file pages.
   */
  imagerepository?: "local" | "shared" | (string & {});

  /**
   * Whether the file is on the "bad images" list (`$wgBadImageList`).
   * `iiprop=badfile` — a real `boolean`, and a **page-level sibling** of
   * {@link ApiPage.imageinfo}, not a member of the imageinfo entry.
   */
  badfile?: boolean;

  /** Image/file info entries (`prop=imageinfo`); usually one for the current file. */
  imageinfo?: ApiImageInfo[];
}

declare module "./index" {
  interface ApiPage extends ApiPageImageInfo {}
}

/**
 * A page projected to everything `prop=imageinfo` contributes, plus the
 * framework-injected {@link ApiPage.index}.
 */
export type ImageInfoPage = QueryPage<keyof ApiPageImageInfo>;
