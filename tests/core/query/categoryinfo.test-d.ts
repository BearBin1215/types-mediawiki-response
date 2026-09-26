/**
 * Type-level assertions for `prop=categoryinfo`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiCategoryInfo, ApiPage, ApiQueryResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import categoryinfoFixture from "../../fixtures/core/query/categoryinfo.json";

export const sample = {
  batchcomplete: true,
  query: {
    pages: [
      {
        pageid: 6418,
        ns: 14,
        title: "Category:Manual",
        categoryinfo: { size: 53, pages: 33, files: 0, subcats: 20, hidden: false },
      },
    ],
  },
} satisfies ApiQueryResponse;

// categoryinfo is a per-page object; `hidden` is a real boolean.
expectTypeOf<ApiPage>().toHaveProperty("categoryinfo").toEqualTypeOf<ApiCategoryInfo | undefined>();

expectTypeOf<
  ExtraKeys<typeof categoryinfoFixture, keyof ApiQueryResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof categoryinfoFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof categoryinfoFixture.query.pages)[number]["categoryinfo"], keyof ApiCategoryInfo>
>().toEqualTypeOf<never>();
