/**
 * Type-level assertions for the response envelope: errors and warnings under
 * both `errorformat` families. See `query/info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiBcErrorResponse,
  ApiEnvelope,
  ApiError,
  ApiErrorResponse,
  ApiMessage,
  ApiMessageParam,
  ApiMessageParamSpec,
  ApiModernErrorResponse,
  ApiRawMessage,
  ApiResponseWith,
  ApiWarningDetail,
  ApiWarnings,
} from "../../src";
import type { ExtraKeys } from "../typeutil";
import bcError from "../fixtures/envelope/error/badvalue.json";
import modernError from "../fixtures/envelope/error/modern.json";
import rawError from "../fixtures/envelope/error/raw.json";
import bcWarn from "../fixtures/envelope/warnings/bc.json";
import modernWarn from "../fixtures/envelope/warnings/modern.json";

// --- Precise conformance samples (satisfies preserves literals) ---

export const bcErrorSample = {
  error: { code: "badvalue", info: "Unrecognized value…", docref: "See …" },
  servedby: "mw-api-ext…",
} satisfies ApiErrorResponse;

export const modernErrorSample = {
  errors: [{ code: "badvalue", text: "Unrecognized value…", module: "main" }],
  docref: "See …",
  servedby: "mw-api-ext…",
} satisfies ApiErrorResponse;

// Generic root fields (curtimestamp/requestid) + bc warnings on a success envelope.
export const bcWarnSample = {
  batchcomplete: true,
  curtimestamp: "2026-09-25T17:07:50Z",
  requestid: "test123",
  warnings: { main: { warnings: "Unrecognized parameter: unknownparam." } },
} satisfies ApiEnvelope;

// Modern warnings on a success envelope.
export const modernWarnSample = {
  warnings: [{ code: "unrecognizedparams", text: "Unrecognized parameter…", module: "main" }],
} satisfies ApiEnvelope;

// errorformat=html: parsed HTML lands in an `html` field instead of `text`.
export const htmlErrorSample = {
  errors: [{ code: "badvalue", html: "<strong>Unrecognized value…</strong>", module: "main" }],
} satisfies ApiErrorResponse;

// errorformat=raw: key/params, where a param may itself be a message.
export const rawErrorSample = {
  errors: [
    {
      code: "badvalue",
      key: "unrecognized-value",
      params: ["action", { message: { key: "parameter-desc", params: ["action"] } }],
    },
  ],
} satisfies ApiErrorResponse;

// CHECKS-BELOW

// `warnings` is polymorphic on errorformat: module-keyed object, or message array.
expectTypeOf<ApiWarnings>().toEqualTypeOf<Record<string, ApiWarningDetail> | ApiMessage[]>();

// No omissions on the real fixtures (checked per errorformat family). The
// `error` object carries an open index signature (message `apiData` is merged
// in), so its fixture can only be checked for the named members' types.
expectTypeOf<ExtraKeys<typeof bcError, keyof ApiBcErrorResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof modernError, keyof ApiModernErrorResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof modernError.errors)[number], keyof ApiMessage>
>().toEqualTypeOf<never>();

// Spec-object params, from the captured `raw` fixture (`{plaintext}` /
// `{num}` / `{list,type}`); the sample above shows the `{message}` form.
export const rawErrorSpecSample = {
  errors: [
    {
      code: "badvalue",
      key: "paramvalidator-badvalue-enumnotmulti",
      module: "main",
      params: [
        { plaintext: "action" },
        { num: 93 },
        { list: [{ plaintext: "query" }], type: "text" },
      ],
    },
  ],
} satisfies ApiModernErrorResponse;
expectTypeOf<ExtraKeys<typeof rawError, keyof ApiModernErrorResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof rawError.errors)[number], keyof ApiMessage>
>().toEqualTypeOf<never>();
// A `list` param inlines plain-text items as scalars (verified against the
// server): `{"list":["unknownparam"],"type":"comma"}`.
export const rawListScalarSample = {
  errors: [
    {
      code: "unrecognizedparams",
      key: "apierror-unrecognizedparams",
      params: [{ list: ["unknownparam"], type: "comma" }, 1],
      module: "main",
    },
  ],
} satisfies ApiModernErrorResponse;

// 1.39–1.42 keep the input array's keys, so a non-contiguous list comes back as
// an object (verified on 1.39 and 1.42); 1.43+ emit an array.
export const rawListObjectSample = {
  warnings: [
    {
      code: "unrecognizedparams",
      key: "apierror-unrecognizedparams",
      params: [{ list: { "2": "unknownparam" }, type: "comma" }, 1],
      module: "main",
    },
  ],
} satisfies ApiEnvelope;

// A message nested inside a list serializes bare, without the `message`
// wrapper (verified through the serialization path on 1.46).
export const rawListBareMessageSample = {
  errors: [
    {
      code: "x",
      key: "k",
      params: [{ list: ["x", { raw: "y" }, { key: "innerkey", params: [] }], type: "comma" }],
    },
  ],
} satisfies ApiModernErrorResponse;

// Captured from `prop=pageviews` on 1.43.9 (PageViewInfo's cached-error path).
export const pageviewsDurationSample = {
  errors: [
    {
      code: "pvi-cached-error-title",
      key: "pvi-cached-error-title",
      params: ["Main_Page", { duration: 1800 }],
      module: "query+pageviews",
    },
  ],
} satisfies ApiModernErrorResponse;

// Synthetic (not a captured response): one entry per `ParamType`, each verified
// separately through the real serialization path on 1.43.9 / 1.46.0. Every
// `Message::*Param` factory serializes to `{ <type>: value }`; a plain-text
// parameter is inlined as a scalar instead of `{text}`.
export const rawParamSpecSample = {
  errors: [
    {
      code: "http-contenttoolarge",
      key: "apierror-http-contenttoolarge",
      params: [
        { size: 8388608 },
        { duration: 3600 },
        { period: 3600 },
        { expiry: "infinity" },
        { datetime: "2026-10-04T05:00:00Z" },
        { date: "2026-10-04" },
        { time: "05:00" },
        { group: "sysop" },
        { bitrate: 128000 },
        { raw: "<b>bold</b>" },
        { object: "stringified" },
      ],
    },
  ],
} satisfies ApiModernErrorResponse;

expectTypeOf<ApiMessageParamSpec>().toHaveProperty("plaintext").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiMessageParamSpec>().toHaveProperty("raw").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiMessageParamSpec>().toHaveProperty("num").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiMessageParamSpec>().toHaveProperty("size").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiMessageParamSpec>().toHaveProperty("duration").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiMessageParamSpec>().toHaveProperty("expiry").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiMessageParamSpec>().toHaveProperty("datetime").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiMessageParamSpec>().toHaveProperty("group").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiMessageParamSpec>().toHaveProperty("object").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiMessageParamSpec>()
  .toHaveProperty("list")
  .toEqualTypeOf<ApiMessageParam[] | Record<string, ApiMessageParam> | undefined>();
expectTypeOf<ApiMessageParam>().toEqualTypeOf<
  string | number | ApiRawMessage | ApiMessageParamSpec
>();

// `code` is written unconditionally on every message, and a raw message always
// carries `key` + `params`; the `bc` `error` object always carries `code` +
// `info`, and a `bc` warning entry its text.
expectTypeOf<ApiMessage>().toHaveProperty("code").toEqualTypeOf<string>();
expectTypeOf<ApiMessage>().toHaveProperty("params").toEqualTypeOf<ApiMessageParam[] | undefined>();
expectTypeOf<ApiRawMessage>().toHaveProperty("key").toEqualTypeOf<string>();
expectTypeOf<ApiRawMessage>().toHaveProperty("params").toEqualTypeOf<ApiMessageParam[]>();
expectTypeOf<ApiError>().toHaveProperty("code").toEqualTypeOf<string>();
expectTypeOf<ApiError>().toHaveProperty("info").toEqualTypeOf<string>();
expectTypeOf<ApiWarningDetail>().toHaveProperty("warnings").toEqualTypeOf<string>();

// Warning details (top level skipped: the warning fixtures also carry `query`).
expectTypeOf<
  ExtraKeys<typeof bcWarn.warnings.main, keyof ApiWarningDetail>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof modernWarn.warnings)[number], keyof ApiMessage>
>().toEqualTypeOf<never>();

// `ApiResponseWith<T>`: what a real call returns — the success shape `T`, or an
// error response. Action response types stay success-shaped; wrap with this when
// the value must also model the error branch (narrow via `'error'`/`'errors' in res`).
type EditLike = { edit: { result?: string } };
expectTypeOf<ApiErrorResponse>().toExtend<ApiResponseWith<EditLike>>();
expectTypeOf<EditLike & ApiEnvelope>().toExtend<ApiResponseWith<EditLike>>();
