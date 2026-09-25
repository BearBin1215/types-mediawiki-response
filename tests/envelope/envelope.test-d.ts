/**
 * Type-level assertions for the response envelope: errors and warnings under
 * both `errorformat` families. See `query/info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiBcErrorResponse,
  ApiEnvelope,
  ApiErrorResponse,
  ApiMessage,
  ApiMessageParamSpec,
  ApiModernErrorResponse,
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
expectTypeOf<ApiMessageParamSpec>().toHaveProperty("plaintext").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiMessageParamSpec>()
  .toHaveProperty("list")
  .toEqualTypeOf<ApiMessageParamSpec[] | undefined>();

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
