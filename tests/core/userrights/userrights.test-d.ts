/**
 * Type-level assertions for `action=userrights` (local MediaWiki 1.43 fv2
 * fixture: adding a fresh account to `bot`). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiUserrightsResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/userrights/userrights.json";

export const sample = {
  userrights: {
    user: "GapTarget",
    userid: 12,
    added: ["bot"],
    removed: [],
    watchuser: false,
  },
} satisfies ApiUserrightsResponse;

// `added` lists group names; `watchuser` is a real boolean but only exists from
// 1.41 (1.39/1.40 emitted no such key), so it stays optional.
expectTypeOf<ApiUserrightsResponse["userrights"]>()
  .toHaveProperty("added")
  .toEqualTypeOf<string[]>();
expectTypeOf<ApiUserrightsResponse["userrights"]>()
  .toHaveProperty("watchuser")
  .toEqualTypeOf<boolean | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiUserrightsResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.userrights, keyof ApiUserrightsResponse["userrights"]>
>().toEqualTypeOf<never>();
