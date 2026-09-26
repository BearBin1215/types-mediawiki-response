/**
 * Type-level assertions for `action=rollback`, checked against a local MediaWiki
 * 1.43 fv2 fixture. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiRollbackResponse, ApiRollbackResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import rollbackFixture from "../../fixtures/core/rollback/rollback.json";

export const sample = {
  rollback: {
    title: "Rollback target",
    pageid: 74,
    summary: "Reverted edit by Edituser",
    revid: 123,
    old_revid: 122,
    last_revid: 121,
  },
} satisfies ApiRollbackResponse;

expectTypeOf<ApiRollbackResult>().toHaveProperty("revid").toEqualTypeOf<number>();
expectTypeOf<ApiRollbackResult>().toHaveProperty("summary").toEqualTypeOf<string>();
expectTypeOf<ApiRollbackResult>().toHaveProperty("last_revid").toEqualTypeOf<number>();

expectTypeOf<ExtraKeys<typeof rollbackFixture, keyof ApiRollbackResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof rollbackFixture.rollback, keyof ApiRollbackResult>
>().toEqualTypeOf<never>();
