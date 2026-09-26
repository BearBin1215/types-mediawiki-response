/**
 * Type-level assertions for `list=pagepropnames`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiPagePropName, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/pagepropnames.json";

export const sample = {
  batchcomplete: true,
  query: {
    pagepropnames: [{ propname: "archivedtalk" }],
  },
  continue: { ppncontinue: "hiddencat", continue: "-||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("pagepropnames")
  .toEqualTypeOf<ApiPagePropName[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.pagepropnames)[number], keyof ApiPagePropName>
>().toEqualTypeOf<never>();
