/**
 * Type-level assertions for `prop=linkshere`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiLinksHere, ApiPage, ApiQueryResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import linkshereFixture from "../../fixtures/core/query/linkshere.json";

export const sample = {
  query: {
    pages: [
      {
        pageid: 1,
        ns: 0,
        title: "MediaWiki",
        linkshere: [{ pageid: 1423, ns: 0, title: "Main Page", redirect: true }],
      },
    ],
  },
  continue: { lhcontinue: "3416", continue: "||" },
} satisfies ApiQueryResponse;

// `prop=linkshere` adds a `linkshere` array to pages; `redirect` is a real boolean.
expectTypeOf<ApiPage>().toHaveProperty("linkshere").toEqualTypeOf<ApiLinksHere[] | undefined>();
expectTypeOf<ApiLinksHere>().toHaveProperty("redirect").toEqualTypeOf<boolean | undefined>();

expectTypeOf(linkshereFixture.query.pages).toExtend<unknown[]>();
expectTypeOf<ExtraKeys<typeof linkshereFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof linkshereFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof linkshereFixture.query.pages)[number]["linkshere"][number], keyof ApiLinksHere>
>().toEqualTypeOf<never>();
