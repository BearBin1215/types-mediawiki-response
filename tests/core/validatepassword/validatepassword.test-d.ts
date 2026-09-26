/**
 * Type-level assertions for `action=validatepassword` (local MediaWiki 1.43 fv2
 * fixtures: an acceptable password and a too-short one). See `info.test-d.ts`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiSpecMessage, ApiValidatePasswordResponse } from "../../../src";
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

expectTypeOf<ApiValidatePasswordResponse["validatepassword"]>()
  .toHaveProperty("validitymessages")
  .toEqualTypeOf<ApiSpecMessage[] | undefined>();

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
