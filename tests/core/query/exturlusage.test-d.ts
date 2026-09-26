/**
 * Type-level assertions for `list=exturlusage`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiExtUrlUsage, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/exturlusage.json";

export const sample = {
  batchcomplete: true,
  query: {
    exturlusage: [
      {
        pageid: 70295,
        ns: 0,
        title: "NOLA Hackathon 2011/Saturday",
        url: "http://integration.mediawiki.org/ci",
      },
    ],
  },
  continue: { eucontinue: "27872", continue: "-||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("exturlusage")
  .toEqualTypeOf<ApiExtUrlUsage[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.exturlusage)[number], keyof ApiExtUrlUsage>
>().toEqualTypeOf<never>();
