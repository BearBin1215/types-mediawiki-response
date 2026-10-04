/**
 * Type-level assertions for `action=emailuser` (local MediaWiki 1.43 fv2 fixture;
 * captured on a wiki without a mail transport, so the result is in-band
 * `Failure`). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiEmailUserResponse, ApiMessage, ApiSpecMessage } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/emailuser/emailuser.json";

export const successSample = {
  emailuser: { result: "Success" },
} satisfies ApiEmailUserResponse;

export const failureSample = {
  emailuser: {
    result: "Failure",
    warnings: [],
    errors: [
      {
        message: "php-mail-error-unknown",
        params: [],
        code: "php-mail-error-unknown",
        type: "error",
      },
    ],
  },
} satisfies ApiEmailUserResponse;

// Under a modern `errorformat` the in-band messages are full `ApiMessage`s.
export const modernFailureSample = {
  emailuser: {
    result: "Failure",
    errors: [{ code: "php-mail-error-unknown", text: "PHP mail() returned an unknown error." }],
  },
} satisfies ApiEmailUserResponse;

// `result` is a union, not a single literal.
expectTypeOf<ApiEmailUserResponse["emailuser"]>()
  .toHaveProperty("result")
  .toMatchTypeOf<string | undefined>();

// The in-band messages follow the request's `errorformat`.
expectTypeOf<ApiEmailUserResponse["emailuser"]>()
  .toHaveProperty("errors")
  .toEqualTypeOf<ApiSpecMessage[] | ApiMessage[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiEmailUserResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.emailuser, keyof ApiEmailUserResponse["emailuser"]>
>().toEqualTypeOf<never>();
