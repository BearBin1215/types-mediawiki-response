/**
 * Type-level assertions for `list=allredirects`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiAllLink, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/allredirects.json";

export const sample = {
  batchcomplete: true,
  query: {
    allredirects: [{ fromid: 8, ns: 0, title: "MT2 1790361822" }],
  },
  continue: { arcontinue: "MT2_1790362397088|36", continue: "-||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("allredirects")
  .toEqualTypeOf<ApiAllLink[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.allredirects)[number], keyof ApiAllLink>
>().toEqualTypeOf<never>();
