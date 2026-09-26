/**
 * Type-level assertions for `list=allcategories`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiAllCategory, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import allcategoriesFixture from "../../fixtures/core/query/allcategories.json";

export const sample = {
  batchcomplete: true,
  query: {
    allcategories: [{ category: "Foo", size: 7, pages: 7, files: 0, subcats: 0, hidden: false }],
  },
  continue: { accontinue: "Bar", continue: "-||" },
} satisfies ApiQueryResponse;

// `hidden` is a real boolean, not a Flag.
expectTypeOf<ApiAllCategory>().toHaveProperty("hidden").toEqualTypeOf<boolean | undefined>();

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("allcategories")
  .toEqualTypeOf<ApiAllCategory[] | undefined>();

expectTypeOf<
  ExtraKeys<typeof allcategoriesFixture, keyof ApiQueryResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof allcategoriesFixture.query.allcategories)[number], keyof ApiAllCategory>
>().toEqualTypeOf<never>();
