/**
 * Type-level assertions for `list=alllinks`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiAllLink, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import alllinksFixture from "../../fixtures/core/query/alllinks.json";

export const sample = {
  batchcomplete: true,
  query: {
    alllinks: [{ fromid: 8, ns: 0, title: "MT2 1790361822" }],
  },
  continue: { alcontinue: "6|23", continue: "-||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>().toHaveProperty("alllinks").toEqualTypeOf<ApiAllLink[] | undefined>();

expectTypeOf<ExtraKeys<typeof alllinksFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof alllinksFixture.query.alllinks)[number], keyof ApiAllLink>
>().toEqualTypeOf<never>();
