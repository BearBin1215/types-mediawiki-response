/**
 * Type-level assertions for `action=validatepassword` (local MediaWiki 1.43 fv2
 * fixtures: an acceptable password and a too-short one). See `info.test-d.ts`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiMessage, ApiSpecMessage, ApiValidatePasswordResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import goodFixture from "../../fixtures/core/validatepassword/good.json";
import weakFixture from "../../fixtures/core/validatepassword/weak.json";

export const goodSample = {
  validatepassword: { validity: "Good" },
} satisfies ApiValidatePasswordResponse;

export const weakSample = {
  validatepassword: {
    validity: "Change",
    validitymessages: [
      { message: "passwordtooshort", params: [8], code: "passwordtooshort", type: "error" },
    ],
  },
} satisfies ApiValidatePasswordResponse;

// Under a modern `errorformat` the policy messages are full `ApiMessage`s.
export const modernWeakSample = {
  validatepassword: {
    validity: "Change",
    validitymessages: [
      { code: "passwordtooshort", text: "Password must be at least 8 characters." },
    ],
  },
} satisfies ApiValidatePasswordResponse;

// The messages follow the request's `errorformat`: `bc` specs or `ApiMessage`s.
expectTypeOf<ApiValidatePasswordResponse["validatepassword"]>()
  .toHaveProperty("validitymessages")
  .toEqualTypeOf<ApiSpecMessage[] | ApiMessage[] | undefined>();

expectTypeOf<
  ExtraKeys<typeof goodFixture, keyof ApiValidatePasswordResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof weakFixture, keyof ApiValidatePasswordResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    typeof weakFixture.validatepassword,
    keyof ApiValidatePasswordResponse["validatepassword"]
  >
>().toEqualTypeOf<never>();
