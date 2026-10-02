/**
 * Type-level assertions for `action=delete` (local MediaWiki 1.43 fv2
 * fixtures). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiDeleteResponse, ApiDeleteResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import deleteFixture from "../../fixtures/core/delete/delete.json";
import deleteScheduledFixture from "../../fixtures/core/delete/delete-scheduled.json";

export const deleteSample = {
  delete: { title: "Delete target", reason: "fixture delete", logid: 68 },
} satisfies ApiDeleteResponse;

// Large pages are queued for the job queue instead: `scheduled` (no `logid`).
export const deleteScheduledSample = {
  delete: { title: "Delete target", reason: "fixture delete", scheduled: true },
} satisfies ApiDeleteResponse;

// A successful delete has no `result` key.
expectTypeOf<ApiDeleteResult>().not.toHaveProperty("result");

expectTypeOf<ExtraKeys<typeof deleteFixture, keyof ApiDeleteResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof deleteFixture.delete, keyof ApiDeleteResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof deleteScheduledFixture, keyof ApiDeleteResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof deleteScheduledFixture.delete, keyof ApiDeleteResult>
>().toEqualTypeOf<never>();
