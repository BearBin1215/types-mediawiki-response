/**
 * Type-level assertions for `list=categorymembers`, checked against a real
 * fixture. Compiled by `pnpm typecheck`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiCategoryMember, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import categorymembersFixture from "../../fixtures/core/query/categorymembers.json";

export const sample = {
  batchcomplete: true,
  query: {
    categorymembers: [
      {
        pageid: 6411,
        ns: 100,
        title: "Manual:Contents",
        sortkey: "0403062e4644503244504e010e01c4dc0b",
        sortkeyprefix: " ",
        type: "page",
        timestamp: "2025-02-17T16:56:40Z",
      },
    ],
  },
  continue: { cmcontinue: "page|2a2e503a|14588", continue: "-||" },
} satisfies ApiQueryResponse;

// `list=categorymembers` adds a top-level `categorymembers` array; `type` is an open union.
expectTypeOf<ApiQueryResult>()
  .toHaveProperty("categorymembers")
  .toEqualTypeOf<ApiCategoryMember[] | undefined>();

expectTypeOf(categorymembersFixture.query.categorymembers).toExtend<unknown[]>();
expectTypeOf<
  ExtraKeys<typeof categorymembersFixture, keyof ApiQueryResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof categorymembersFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof categorymembersFixture.query.categorymembers)[number], keyof ApiCategoryMember>
>().toEqualTypeOf<never>();
