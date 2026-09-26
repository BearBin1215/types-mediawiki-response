/**
 * `action=upload` response — uploads (or stashes) a file via multipart POST;
 * needs CSRF and the `upload` right. The result keys under `upload`; a
 * `warnings` sub-object (distinct from the response {@link ApiEnvelope}'s
 * `warnings`) reports recoverable issues such as a duplicate sha1.
 *
 * `imageinfo` embeds a subset of the `prop=imageinfo` shape for the
 * uploaded revision — including `extmetadata`, whose per-field objects carry a
 * `value`, a `source` and a `hidden` marker (empty string when the field is
 * outside the visible list); `GetExtendedMetadata` hook handlers can add
 * further per-field keys.
 *
 * @see https://www.mediawiki.org/wiki/API:Upload
 */
import type { Timestamp } from "../common";
import type { ApiEnvelope } from "../envelope";

/** A single `extmetadata` field on an uploaded file's imageinfo. */
export interface ApiUploadExtMetadataField {
  /** Field value (usually a string; may be a timestamp or HTML). */
  value?: string;

  /** Where the value came from (e.g. `mediawiki-metadata`, `exif`). */
  source?: string;

  /** Empty string marking the field as hidden from default display. */
  hidden?: string;
}

/** One `{ name, value }` metadata entry (values nest for structured types). */
export interface ApiUploadMetadataItem {
  /** Field label, e.g. `frameCount`. */
  name?: string;

  /** Field value; a list of further entries when the format groups fields. */
  value?: unknown;
}

/** The embedded `imageinfo` of an `action=upload` result, for the uploaded revision. */
export interface ApiUploadImageinfo {
  /** Upload timestamp of the new file. */
  timestamp?: Timestamp;

  /** Uploader user name. */
  user?: string;

  /** Uploader user id. */
  userid?: number;

  /** Raw upload comment. */
  comment?: string;

  /** HTML-rendered upload comment. */
  parsedcomment?: string;

  /** File size in bytes. */
  size?: number;

  /** Width in pixels; `0` for files without dimensions (e.g. audio). */
  width?: number;

  /** Height in pixels; `0` for files without dimensions (e.g. audio). */
  height?: number;

  /** SHA-1 of the file contents. */
  sha1?: string;

  /** Detected MIME type. */
  mime?: string;

  /** MediaWiki media type classification. */
  mediatype?: string;

  /** Color bit depth, for images that report one. */
  bitdepth?: number;

  /** Canonical localized file title. */
  canonicaltitle?: string;

  /** Direct URL to the file. */
  url?: string;

  /** URL of the file description page. */
  descriptionurl?: string;

  /** Exists-warning HTML from `Special:Upload` (`iiprop=uploadwarning`). */
  html?: string;

  /** Per-file metadata as `{ name, value }` entries. */
  metadata?: ApiUploadMetadataItem[];

  /** Metadata shared across the file's revisions. */
  commonmetadata?: ApiUploadMetadataItem[];

  /** Extended metadata (EXIF and similar), keyed by field name. */
  extmetadata?: Record<string, ApiUploadExtMetadataField>;
}

/** In-band upload warnings (values are strings, string arrays, or objects). */
export interface ApiUploadWarnings {
  /** Files sharing the same sha1. */
  duplicate?: string[];
  /** Name of a previously deleted file with the same sha1 (`""` when its content is hidden). */
  "duplicate-archive"?: string;
  /** The target exists; the upload was applied anyway when `ignorewarnings` set. */
  exists?: string;
  /** Per-warning detail (bad-filetype, others, …). */
  [warning: string]: unknown;
}

/** Response of `action=upload`. */
export interface ApiUploadResponse extends ApiEnvelope {
  /** Result of `action=upload`. */
  upload: {
    /**
     * Outcome of the upload, set by the result builders (`getStashResult`,
     * `getWarningsResult`, `getChunkResult`, `performUpload`).
     */
    result: "Success" | "Warning" | "Poll" | "Continue" | "Failure" | (string & {});

    /** Stored file name (spaces underscored). */
    filename?: string;

    /** File key when the upload was stashed (`stash=1`) or published from a stash. */
    filekey?: string;

    /** Session key mirroring `filekey` on a stashed upload. */
    sessionkey?: string;

    /** Async/chunked stage (present on `Poll`/`Continue` results). */
    stage?: "queued" | "uploading" | "assembling" | (string & {});

    /** Chunked-upload byte offset (present on `Continue` results). */
    offset?: number;

    /** Imageinfo for the newly stored revision (added only on `Success`). */
    imageinfo?: ApiUploadImageinfo;

    /** Recoverable warnings (distinct from the envelope `warnings`). */
    warnings?: ApiUploadWarnings;
  };
}
