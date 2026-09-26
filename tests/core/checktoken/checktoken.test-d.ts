/**
 * Type-level assertions for `action=checktoken` (local MediaWiki 1.43 fv2
 * fixtures). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiCheckTokenResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import validFixture from "../../fixtures/core/checktoken/valid.json";
import invalidFixture from "../../fixtures/core/checktoken/invalid.json";

export const validSample = {
  checktoken: { result: "valid" },
} satisfies ApiCheckTokenResponse;

export const invalidSample = {
  checktoken: { result: "invalid" },
} satisfies ApiCheckTokenResponse;

// `result` is the outcome discriminator.
expectTypeOf<ApiCheckTokenResponse["checktoken"]>()
  .toHaveProperty("result")
  .toMatchTypeOf<string>();

expectTypeOf<ExtraKeys<typeof validFixture, keyof ApiCheckTokenResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof validFixture.checktoken, keyof ApiCheckTokenResponse["checktoken"]>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof invalidFixture, keyof ApiCheckTokenResponse>
>().toEqualTypeOf<never>();
