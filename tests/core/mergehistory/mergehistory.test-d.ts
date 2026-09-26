/**
 * Type-level assertions for `action=mergehistory` (local MediaWiki 1.43 fv2
 * fixture). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiMergeHistoryResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/mergehistory/mergehistory.json";

export const sample = {
  mergehistory: {
    from: "Gap mh src",
    to: "Gap mh dst",
    timestamp: "2026-09-26T17:31:36Z",
    reason: "fixture mergehistory",
  },
} satisfies ApiMergeHistoryResponse;

expectTypeOf<ApiMergeHistoryResponse["mergehistory"]>()
  .toHaveProperty("timestamp")
  .toEqualTypeOf<string>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiMergeHistoryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.mergehistory, keyof ApiMergeHistoryResponse["mergehistory"]>
>().toEqualTypeOf<never>();
