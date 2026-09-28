/**
 * Opt-in extension pack: **TimedMediaHandler** (audio/video;
 * `prop=videoinfo`, `prop=transcodestatus`, `action=transcodereset`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/timedmediahandler';
 * ```
 *
 * `action=timedtext` serves raw subtitle text (an srt/vtt body, not a JSON
 * object).
 *
 * fv2 notes: `transcodestatus` maps each transcode key to the transcode record
 * (minus `id`/`image_name`/`key`); its `time_*` keys are nullable 14-digit
 * MediaWiki timestamps (`null` — not omission — when the step has not run), and
 * `final_bitrate` may be a number or a string. A file without transcodes
 * reports `[]`, since PHP's empty map serializes as an array.
 *
 * @see https://www.mediawiki.org/wiki/Extension:TimedMediaHandler
 */
import type { ApiEnvelope } from "../envelope";
import type { ApiImageInfo } from "../core/query/imageinfo";

/**
 * One source of a video's `derivatives` list (the original file first, then
 * each ready transcode). Audio files report `width`/`height` as `0`.
 */
export interface ApiVideoSource {
  /** Direct URL to the file / transcode. */
  src?: string;

  /** MIME type, e.g. `video/webm; codecs="vp9, opus"`. */
  type?: string;

  /** Transcode key of a derivative (absent for the original file source). */
  transcodekey?: string;

  /** Video width in pixels (`0` for audio). */
  width?: number;

  /** Video height in pixels (`0` for audio). */
  height?: number;

  /** Average bandwidth in bit/s, when the handler reports one. */
  bandwidth?: number;

  /**
   * Human-readable label, carried only by the HLS playlist source
   * (`transcodekey` `m3u8`).
   */
  title?: string;

  /** Short form of {@link title}. */
  shorttitle?: string;
}

/** One subtitle track of `viprop=timedtext` (one entry per track format). */
export interface ApiVideoTimedTextTrack {
  /**
   * URL of the subtitle stream (an `action=timedtext` API URL, already carrying
   * `origin=*` for cross-origin playback).
   */
  src?: string;

  /** Track kind; `subtitles` for text tracks TMH generates. */
  kind?: "subtitles" | (string & {});

  /** MIME type of the track, e.g. `text/x-srt` or `text/vtt`. */
  type?: string;

  /** Track language (BCP 47). */
  srclang?: string;

  /** Text direction of the track language, `ltr` or `rtl`. */
  dir?: "ltr" | "rtl" | (string & {});

  /** Human-readable track label including the language name. */
  label?: string;
}

/**
 * One video-info entry for a file page: the imageinfo fields (`viprop` mirrors
 * the `iiprop` names) plus TMH's `derivatives` and `timedtext` lists.
 */
export interface ApiVideoInfo extends ApiImageInfo {
  /** Original file source followed by every ready transcode. `viprop=derivatives`. */
  derivatives?: ApiVideoSource[];

  /**
   * Available subtitle tracks (one per language and format); `[]` when the file
   * has none. `viprop=timedtext`.
   */
  timedtext?: ApiVideoTimedTextTrack[];
}

/**
 * One transcode state of `prop=transcodestatus`, keyed by transcode key (e.g.
 * `240p.vp9.webm`) on the file page. The keys mirror the `transcode` table
 * columns with the `transcode_` prefix stripped.
 */
export interface ApiTranscodeState {
  /** Error output of the transcode run; `""` unless the transcode failed. */
  error?: string;

  /** When the job was queued; a 14-digit MediaWiki timestamp or `null`. */
  time_addjob?: string | null;

  /** When the job started working; a 14-digit MediaWiki timestamp or `null`. */
  time_startwork?: string | null;

  /** When the transcode finished; a 14-digit MediaWiki timestamp or `null`. */
  time_success?: string | null;

  /** When the transcode failed; a 14-digit MediaWiki timestamp or `null`. */
  time_error?: string | null;

  /**
   * Achieved bitrate in bit/s of the finished transcode; may be a number or a
   * numeric string.
   */
  final_bitrate?: number | string;

  /**
   * Transcode job state as a numeric string (e.g. `"3"` while working, `"4"`
   * when ready).
   *
   * @since MediaWiki 1.46
   */
  state?: string;

  /**
   * When the transcode state was last touched; a 14-digit MediaWiki timestamp.
   *
   * @since MediaWiki 1.46
   */
  touched?: string;

  /**
   * Size in bytes of the finished transcode, `null` while unfinished; a numeric
   * string.
   *
   * @since MediaWiki 1.46
   */
  size?: string | null;
}

/** Response of `action=transcodereset` (requires the `transcode-reset` right). */
export interface ApiTranscodeResetResponse extends ApiEnvelope {
  /** `removed transcode` on success; failures are top-level error responses. */
  success?: string;
}

declare module "types-mediawiki-response" {
  interface ApiPage {
    /** File info extended with video sources and subtitle tracks. */
    videoinfo?: ApiVideoInfo[];

    /**
     * Per-transcode job states, keyed by transcode key; `[]` — an empty array,
     * not an empty object — when the file has no transcodes at all.
     */
    transcodestatus?: Record<string, ApiTranscodeState> | unknown[];
  }
}
