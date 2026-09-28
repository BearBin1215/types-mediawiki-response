/**
 * Type-level assertions for the TimedMediaHandler ext pack (`prop=videoinfo`,
 * `prop=transcodestatus`, `action=transcodereset`), checked against real local
 * 1.43 fv2 fixtures captured from an uploaded WebM with completed transcodes.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiTranscodeResetResponse,
  ApiTranscodeState,
  ApiVideoInfo,
  ApiVideoSource,
  ApiVideoTimedTextTrack,
} from "../../src/extensions/timedmediahandler";
import type { QueryPage } from "../../src";
import type { ExtraKeys } from "../typeutil";
import transcodeFixture from "../fixtures/extensions/transcodestatus.json";
import transcoderesetFixture from "../fixtures/extensions/transcodereset.json";
import videoinfoFixture from "../fixtures/extensions/videoinfo.json";

export const videoRow = {
  timestamp: "2026-09-29T14:13:35Z",
  user: "Capx",
  userid: 13,
  size: 17985,
  width: 160,
  height: 120,
  duration: 2,
  sha1: "94ab20495c7752e97b6ff9e8815e9ef84ec1f27f",
  mime: "video/webm",
  mediatype: "VIDEO",
  bitdepth: 0,
  derivatives: [
    {
      src: "http://localhost:8080/images/9/92/ApxFixture.webm",
      type: 'video/webm; codecs="vp8"',
      width: 160,
      height: 120,
      bandwidth: 71940,
    },
  ],
  timedtext: [],
} satisfies ApiVideoInfo;

export const derivative = {
  src: "http://localhost:8080/images/transcoded/9/92/ApxFixture.webm/ApxFixture.webm.240p.vp9.webm",
  type: 'video/webm; codecs="vp9, opus"',
  transcodekey: "240p.vp9.webm",
  width: 160,
  height: 120,
  bandwidth: 22472,
} satisfies ApiVideoSource;

export const track = {
  src: "http://localhost:8080/api.php?action=timedtext&title=File%3AApxFixture.webm&lang=en&trackformat=srt",
  kind: "subtitles",
  type: "text/x-srt",
  srclang: "en",
  dir: "ltr",
  label: "English",
} satisfies ApiVideoTimedTextTrack;

export const state = {
  error: "",
  time_addjob: "20260929141335",
  time_startwork: "20260929141336",
  time_success: "20260929141336",
  time_error: null,
  final_bitrate: "22472",
} satisfies ApiTranscodeState;

export const resetSample = {
  success: "removed transcode",
} satisfies ApiTranscodeResetResponse;

// A ready transcode state exposes `time_success` as a timestamp while `time_error`
// stays explicitly `null`; `final_bitrate` passes the DB column through uncast.
expectTypeOf<ApiTranscodeState>()
  .toHaveProperty("time_error")
  .toEqualTypeOf<string | null | undefined>();
expectTypeOf<ApiTranscodeState>()
  .toHaveProperty("final_bitrate")
  .toEqualTypeOf<number | string | undefined>();

// Only derivatives of ready transcodes carry `transcodekey` (the first entry is
// the original file); it stays optional.
expectTypeOf<ApiVideoSource>().toHaveProperty("transcodekey").toEqualTypeOf<string | undefined>();

// The HLS playlist source is the only one carrying `title` / `shorttitle`.
expectTypeOf<ApiVideoSource>().toHaveProperty("title").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiVideoSource>().toHaveProperty("shorttitle").toEqualTypeOf<string | undefined>();

// A file without transcodes reports `[]` (fv2: PHP's empty map serializes as an
// array).
expectTypeOf<QueryPage<"transcodestatus">["transcodestatus"]>().toEqualTypeOf<
  Record<string, ApiTranscodeState> | unknown[] | undefined
>();

expectTypeOf<
  ExtraKeys<(typeof videoinfoFixture.query.pages)[number]["videoinfo"][number], keyof ApiVideoInfo>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof videoinfoFixture.query.pages)[number]["videoinfo"][number]["derivatives"][number],
    keyof ApiVideoSource
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof videoinfoFixture.query.pages)[number]["videoinfo"][number]["timedtext"][number],
    keyof ApiVideoTimedTextTrack
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof transcodeFixture.query.pages)[number]["transcodestatus"]["240p.vp9.webm"],
    keyof ApiTranscodeState
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof transcoderesetFixture, keyof ApiTranscodeResetResponse>
>().toEqualTypeOf<never>();
