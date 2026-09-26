/**
 * Type-level assertions for `prop=categories`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiCategory, ApiPage, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import categoriesFixture from "../../fixtures/core/query/categories.json";

// A realistic prop=categories response (mirrors the fixture) must satisfy the type.
export const sample = {
  batchcomplete: true,
  query: {
    pages: [
      {
        pageid: 6411,
        ns: 100,
        title: "Manual:Contents",
        categories: [
          {
            ns: 14,
            title: "Category:Manual",
            sortkey: "0403062e4644503244504e010e01c4dc0b",
            sortkeyprefix: " ",
            timestamp: "2025-02-17T16:56:40Z",
            hidden: false,
          },
        ],
      },
    ],
  },
  limits: { categories: 500 },
} satisfies ApiQueryResponse;

// `prop=categories` adds a `categories` array to pages.
expectTypeOf<ApiPage>().toHaveProperty("categories").toEqualTypeOf<ApiCategory[] | undefined>();
// `clprop=hidden` returns `false` for non-hidden entries, so `hidden` is a real
// boolean, not a `Flag`.
expectTypeOf<ApiCategory>().toHaveProperty("hidden").toEqualTypeOf<boolean | undefined>();

// Widening-tolerant structural check on the real fixture.
expectTypeOf(categoriesFixture.query.pages).toExtend<unknown[]>();

// No omissions at each level the fixture exercises (bounded by fixture
// coverage; pair with the paraminfo enum checklist).
expectTypeOf<ExtraKeys<typeof categoriesFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof categoriesFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
type CategoriesPage = (typeof categoriesFixture.query.pages)[number];
expectTypeOf<ExtraKeys<CategoriesPage, keyof ApiPage>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<CategoriesPage["categories"][number], keyof ApiCategory>
>().toEqualTypeOf<never>();
