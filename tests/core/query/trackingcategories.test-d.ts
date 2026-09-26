/**
 * Type-level assertions for `list=trackingcategories`, checked against a real
 * fixture captured from mediawiki.org (module added in 1.45). Compiled by
 * `pnpm typecheck`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiQueryResponse, ApiQueryResult, ApiTrackingCategory } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/trackingcategories.json";

export const sample = {
  batchcomplete: true,
  query: {
    trackingcategories: [
      {
        category: "Pages with broken file links",
        catid: "broken-file-category",
        size: 12,
        pages: 10,
        files: 2,
        subcats: 0,
        hidden: true,
      },
    ],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("trackingcategories")
  .toEqualTypeOf<ApiTrackingCategory[] | undefined>();

// Widening-tolerant structural checks on the real fixture.
expectTypeOf(fixture.query.trackingcategories).toExtend<ApiTrackingCategory[]>();
expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof fixture.query, keyof ApiQueryResult>>().toEqualTypeOf<never>();
