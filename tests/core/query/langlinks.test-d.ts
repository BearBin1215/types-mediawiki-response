/**
 * Type-level assertions for `prop=langlinks`, checked against a real fixture
 * (captured from en.wikipedia.org, since the reference site has no interlanguage
 * links). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiLangLink, ApiPage, ApiQueryResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import langlinksFixture from "../../fixtures/core/query/langlinks.json";

export const sample = {
  query: {
    pages: [
      {
        pageid: 22989,
        ns: 0,
        title: "Paris",
        langlinks: [
          {
            lang: "de",
            title: "Paris",
            url: "https://de.wikipedia.org/wiki/Paris",
            langname: "German",
            autonym: "Deutsch",
          },
        ],
      },
    ],
  },
  continue: { llcontinue: "22989|als", continue: "||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiPage>().toHaveProperty("langlinks").toEqualTypeOf<ApiLangLink[] | undefined>();

expectTypeOf<ExtraKeys<typeof langlinksFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof langlinksFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof langlinksFixture.query.pages)[number]["langlinks"][number], keyof ApiLangLink>
>().toEqualTypeOf<never>();
