/**
 * Type-level assertions for `list=allfileusages`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiAllLink, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/allfileusages.json";

export const sample = {
  batchcomplete: true,
  query: {
    allfileusages: [{ fromid: 18666, ns: 6, title: "File:Foo.jpg" }],
  },
  continue: { afcontinue: "18626|18669", continue: "-||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("allfileusages")
  .toEqualTypeOf<ApiAllLink[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.allfileusages)[number], keyof ApiAllLink>
>().toEqualTypeOf<never>();
