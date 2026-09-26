/**
 * `list=mystashedfiles` — files the requesting user has stashed but not yet
 * published, merged into {@link ApiQueryResult}. Requires being logged in.
 *
 * A stash row is produced by `action=upload` with `stash=1` (or by an interrupted
 * chunked upload) and is consumed by a later `action=upload` with `filekey=`, so
 * this list is how a client recovers resumable uploads. Sizes here are **numbers**,
 * unlike the same quantities in `list=filearchive`.
 *
 * @see https://www.mediawiki.org/wiki/API:Mystashedfiles
 */

/** One stashed file. `msfprop` controls the measurement fields. */
export interface ApiStashedFile {
  /** Handle to pass as `action=upload`'s `filekey`. */
  filekey: string;

  /**
   * Stash state. `finished` once the whole file is stored; chunked uploads sit on
   * `chunks` until assembled. Open union for other internal states.
   */
  status: "finished" | "chunks" | (string & {});

  /** Stored size in bytes. `msfprop=size`. */
  size?: number;

  /** Image width; `0` for non-raster files. `msfprop=size`. */
  width?: number;

  /** Image height; `0` for non-raster files. `msfprop=size`. */
  height?: number;

  /** Colour depth in bits. `msfprop=size`. */
  bits?: number;

  /** Full MIME type, e.g. `image/png`. `msfprop=type`. */
  mimetype?: string;

  /** MediaWiki media bucket, e.g. `BITMAP`. `msfprop=type`. */
  mediatype?: string;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Files the caller has stashed but not published (`list=mystashedfiles`). */
    mystashedfiles?: ApiStashedFile[];
  }
}
