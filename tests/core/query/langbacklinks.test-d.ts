/**
 * Type-level assertions for `list=langbacklinks`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiLangbacklink, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/langbacklinks.json";

export const sample = {
  batchcomplete: true,
  query: {
    langbacklinks: [
      {
        pageid: 15934,
        ns: 0,
        title: "How to become a MediaWiki hacker",
        lllang: "de",
        lltitle: "MediaWiki",
      },
    ],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("langbacklinks")
  .toEqualTypeOf<ApiLangbacklink[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.langbacklinks)[number], keyof ApiLangbacklink>
>().toEqualTypeOf<never>();
