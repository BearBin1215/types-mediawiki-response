/**
 * Type-level assertions for the WikiLove ext pack (`action=wikilove`), checked
 * against a real local 1.43 fv2 fixture.
 */
import { expectTypeOf } from "expect-type";
import type { ApiWikiLoveResponse } from "../../src/extensions/wikilove";
import type { ExtraKeys } from "../typeutil";
import wikiloveFixture from "../fixtures/extensions/wikilove.json";

export const sample = {
  redirect: {
    pageName: "User_talk:Oathx",
    fragment: "Fixture_love",
  },
} satisfies ApiWikiLoveResponse;

// The reply is a root `redirect` object, not a `result` wrapper; both keys are
// written unconditionally.
expectTypeOf<ApiWikiLoveResponse>()
  .toHaveProperty("redirect")
  .toEqualTypeOf<{ pageName: string; fragment: string }>();

expectTypeOf<ExtraKeys<typeof wikiloveFixture, keyof ApiWikiLoveResponse>>().toEqualTypeOf<never>();
