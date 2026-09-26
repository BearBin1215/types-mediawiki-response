/**
 * Type-level assertions for `prop=pageprops`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiPage, ApiQueryResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import pagepropsFixture from "../../fixtures/core/query/pageprops.json";

export const sample = {
  batchcomplete: true,
  query: {
    pages: [
      {
        pageid: 1,
        ns: 0,
        title: "MediaWiki",
        pageprops: { displaytitle: "MediaWiki", notoc: "", wikibase_item: "Q5296" },
      },
      { pageid: 1423, ns: 0, title: "Main Page" },
    ],
  },
} satisfies ApiQueryResponse;

// `pageprops` is a flat string map.
expectTypeOf<ApiPage>()
  .toHaveProperty("pageprops")
  .toEqualTypeOf<Record<string, string> | undefined>();

expectTypeOf<ExtraKeys<typeof pagepropsFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof pagepropsFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
