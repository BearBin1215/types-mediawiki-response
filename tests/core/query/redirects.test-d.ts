/**
 * Type-level assertions for `prop=redirects`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiPage, ApiQueryResponse, ApiRedirect } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import redirectsFixture from "../../fixtures/core/query/redirects.json";

export const sample = {
  query: {
    pages: [
      {
        pageid: 1,
        ns: 0,
        title: "MediaWiki",
        redirects: [{ pageid: 1423, ns: 0, title: "Main Page" }],
      },
    ],
  },
  continue: { rdcontinue: "22538", continue: "||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiPage>().toHaveProperty("redirects").toEqualTypeOf<ApiRedirect[] | undefined>();

expectTypeOf(redirectsFixture.query.pages).toExtend<unknown[]>();
expectTypeOf<ExtraKeys<typeof redirectsFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof redirectsFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof redirectsFixture.query.pages)[number]["redirects"][number], keyof ApiRedirect>
>().toEqualTypeOf<never>();
