/**
 * Type-level assertions for `prop=iwlinks`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `query/info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiInterwikiLink, ApiPage, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import iwlinksFixture from "../../fixtures/core/query/iwlinks.json";

export const sample = {
  continue: { iwcontinue: "3766|m|Special:MyLanguage/Wikimedia_Commons", continue: "||" },
  query: {
    pages: [
      {
        pageid: 3766,
        ns: 100,
        title: "Manual:FAQ",
        iwlinks: [{ prefix: "en", url: "https://en.wikipedia.org/wiki/gzip", title: "gzip" }],
      },
    ],
  },
} satisfies ApiQueryResponse;

// `prop=iwlinks` adds an `iwlinks` array to pages.
expectTypeOf<ApiPage>().toHaveProperty("iwlinks").toEqualTypeOf<ApiInterwikiLink[] | undefined>();

// No omissions at each level the fixture exercises.
expectTypeOf<ExtraKeys<typeof iwlinksFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof iwlinksFixture.query, keyof ApiQueryResult>>().toEqualTypeOf<never>();
type IwPage = (typeof iwlinksFixture.query.pages)[number];
expectTypeOf<ExtraKeys<IwPage, keyof ApiPage>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<IwPage["iwlinks"][number], keyof ApiInterwikiLink>>().toEqualTypeOf<never>();
