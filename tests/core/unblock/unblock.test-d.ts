/**
 * Type-level assertions for `action=unblock` (local MediaWiki 1.43 fv2
 * fixture). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiUnblockResponse, ApiUnblockResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import unblockFixture from "../../fixtures/core/unblock/unblock.json";

export const unblockSample = {
  unblock: { id: 1, user: "10.0.0.99", userid: 0, reason: "fixture unblock", watchuser: false },
} satisfies ApiUnblockResponse;

// fv2 asymmetry: unblock reports `userid` (lowercase).
expectTypeOf<ApiUnblockResult>().toHaveProperty("userid").toEqualTypeOf<number>();

expectTypeOf<ExtraKeys<typeof unblockFixture, keyof ApiUnblockResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof unblockFixture.unblock, keyof ApiUnblockResult>
>().toEqualTypeOf<never>();
