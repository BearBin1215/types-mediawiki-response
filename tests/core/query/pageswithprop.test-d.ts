/**
 * Type-level assertions for `list=pageswithprop`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiPagesWithProp, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/pageswithprop.json";

export const sample = {
  batchcomplete: true,
  query: {
    pageswithprop: [{ pageid: 7211, ns: 0, title: "Forum", value: "" }],
  },
  continue: { pwpcontinue: "13349", continue: "-||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("pageswithprop")
  .toEqualTypeOf<ApiPagesWithProp[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.pageswithprop)[number], keyof ApiPagesWithProp>
>().toEqualTypeOf<never>();
