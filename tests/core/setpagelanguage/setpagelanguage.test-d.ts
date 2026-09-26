/**
 * Type-level assertions for `action=setpagelanguage` (local MediaWiki 1.43 fv2
 * fixture). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiSetPageLanguageResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/setpagelanguage/setpagelanguage.json";

export const sample = {
  setpagelanguage: {
    title: "Gap spl target",
    oldlanguage: "en[def]",
    newlanguage: "de",
    logid: 752,
  },
} satisfies ApiSetPageLanguageResponse;

expectTypeOf<ApiSetPageLanguageResponse["setpagelanguage"]>()
  .toHaveProperty("newlanguage")
  .toEqualTypeOf<string>();
expectTypeOf<ApiSetPageLanguageResponse["setpagelanguage"]>()
  .toHaveProperty("logid")
  .toEqualTypeOf<number>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiSetPageLanguageResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.setpagelanguage, keyof ApiSetPageLanguageResponse["setpagelanguage"]>
>().toEqualTypeOf<never>();
