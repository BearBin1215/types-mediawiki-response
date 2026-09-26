/**
 * Type-level assertions for `list=allpages`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiAllPage, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import allpagesFixture from "../../fixtures/core/query/allpages.json";

export const sample = {
  batchcomplete: true,
  query: {
    allpages: [{ pageid: 305090, ns: 0, title: "MediaInclu" }],
  },
  continue: { apcontinue: "MediaInclu/Hooks/RevisionInsert", continue: "-||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>().toHaveProperty("allpages").toEqualTypeOf<ApiAllPage[] | undefined>();

expectTypeOf(allpagesFixture.query.allpages).toExtend<unknown[]>();
expectTypeOf<ExtraKeys<typeof allpagesFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof allpagesFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof allpagesFixture.query.allpages)[number], keyof ApiAllPage>
>().toEqualTypeOf<never>();
