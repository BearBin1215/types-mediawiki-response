/**
 * Type-level assertions for `action=stashedit` (local MediaWiki 1.43 fv2
 * fixture). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiStashEditResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/stashedit/stashedit.json";

export const sample = {
  stashedit: { status: "stashed", texthash: "1a0d604f72c62c7be86d1cb1822bf39cd6068190" },
} satisfies ApiStashEditResponse;

expectTypeOf<ApiStashEditResponse["stashedit"]>()
  .toHaveProperty("status")
  .toMatchTypeOf<string | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiStashEditResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.stashedit, keyof ApiStashEditResponse["stashedit"]>
>().toEqualTypeOf<never>();
