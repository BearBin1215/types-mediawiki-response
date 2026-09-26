/**
 * Type-level assertions for `action=expandtemplates` (fv2 fixture).
 * See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiExpandTemplatesCategory,
  ApiExpandTemplatesResponse,
  ApiExpandTemplatesResult,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/expandtemplates/expandtemplates.json";

export const sample = {
  expandtemplates: {
    properties: { defaultsort: "Sort Me" },
    volatile: false,
    wikitext: " [[Category:FixtureCat]] some text",
  },
} satisfies ApiExpandTemplatesResponse;

// Categories carry a name plus a sort key (`''` = default sort key applies).
export const categoriesSample = {
  expandtemplates: {
    categories: [{ category: "FixtureCat", sortkey: "" }],
  },
} satisfies ApiExpandTemplatesResponse;

// `volatile` is a real boolean under fv2.
expectTypeOf<ApiExpandTemplatesResult>()
  .toHaveProperty("volatile")
  .toEqualTypeOf<boolean | undefined>();
// `ttl` is a cache TTL in seconds, not a boolean.
expectTypeOf<ApiExpandTemplatesResult>().toHaveProperty("ttl").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiExpandTemplatesResult>()
  .toHaveProperty("categories")
  .toEqualTypeOf<ApiExpandTemplatesCategory[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiExpandTemplatesResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.expandtemplates, keyof ApiExpandTemplatesResult>
>().toEqualTypeOf<never>();
