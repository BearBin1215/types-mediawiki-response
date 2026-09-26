/**
 * Type-level assertions for `action=resetpassword` (local MediaWiki 1.43 fv2
 * fixture). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiResetPasswordResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/resetpassword/resetpassword.json";

export const sample = {
  resetpassword: { status: "success" },
} satisfies ApiResetPasswordResponse;

// `status` is an open AuthManager union (not just the observed `success`).
expectTypeOf<ApiResetPasswordResponse["resetpassword"]>()
  .toHaveProperty("status")
  .toMatchTypeOf<string | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiResetPasswordResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.resetpassword, keyof ApiResetPasswordResponse["resetpassword"]>
>().toEqualTypeOf<never>();
