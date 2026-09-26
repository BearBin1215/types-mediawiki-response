/**
 * Type-level assertions for `prop=contributors`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiContributor, ApiPage, ApiQueryResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import contributorsFixture from "../../fixtures/core/query/contributors.json";

export const sample = {
  query: {
    pages: [
      {
        pageid: 1,
        ns: 0,
        title: "MediaWiki",
        anoncontributors: 314,
        contributors: [{ userid: 422134, name: "MusikAnimal" }],
      },
    ],
  },
  continue: { pccontinue: "1|13103", continue: "||" },
} satisfies ApiQueryResponse;

// `prop=contributors` adds per-page `contributors` + `anoncontributors`.
expectTypeOf<ApiPage>()
  .toHaveProperty("contributors")
  .toEqualTypeOf<ApiContributor[] | undefined>();
expectTypeOf<ApiPage>().toHaveProperty("anoncontributors").toEqualTypeOf<number | undefined>();

expectTypeOf(contributorsFixture.query.pages).toExtend<unknown[]>();
expectTypeOf<
  ExtraKeys<typeof contributorsFixture, keyof ApiQueryResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof contributorsFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof contributorsFixture.query.pages)[number]["contributors"][number],
    keyof ApiContributor
  >
>().toEqualTypeOf<never>();
