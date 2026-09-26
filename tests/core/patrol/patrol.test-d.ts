/**
 * Type-level assertions for `action=patrol`, checked against a local MediaWiki
 * 1.43 fv2 fixture. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiPatrolResponse, ApiPatrolResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import patrolFixture from "../../fixtures/core/patrol/patrol.json";

export const sample = {
  patrol: { rcid: 128, ns: 0, title: "Patrol target" },
} satisfies ApiPatrolResponse;

// `action=patrol` writes `rcid` and the title info unconditionally.
expectTypeOf<ApiPatrolResult>().toHaveProperty("rcid").toEqualTypeOf<number>();
expectTypeOf<ApiPatrolResult>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiPatrolResult>().toHaveProperty("title").toEqualTypeOf<string>();

expectTypeOf<ExtraKeys<typeof patrolFixture, keyof ApiPatrolResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof patrolFixture.patrol, keyof ApiPatrolResult>
>().toEqualTypeOf<never>();
