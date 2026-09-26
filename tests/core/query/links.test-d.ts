/**
 * Type-level assertions for `prop=links`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiPage, ApiPageLink, ApiQueryResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import linksFixture from "../../fixtures/core/query/links.json";

export const sample = {
  query: {
    pages: [
      {
        pageid: 1,
        ns: 0,
        title: "MediaWiki",
        links: [{ ns: 0, title: "How to report a bug" }],
      },
    ],
  },
  continue: { plcontinue: "1|4|Support_desk", continue: "||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiPage>().toHaveProperty("links").toEqualTypeOf<ApiPageLink[] | undefined>();

expectTypeOf<ExtraKeys<typeof linksFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof linksFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof linksFixture.query.pages)[number]["links"][number], keyof ApiPageLink>
>().toEqualTypeOf<never>();
