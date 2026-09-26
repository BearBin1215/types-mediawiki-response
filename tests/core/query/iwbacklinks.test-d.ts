/**
 * Type-level assertions for `list=iwbacklinks`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiIwbacklink, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/iwbacklinks.json";

export const sample = {
  batchcomplete: true,
  query: {
    iwbacklinks: [
      {
        pageid: 101997,
        ns: 3,
        title: "User talk:Tim Starling",
        iwprefix: "q",
        iwtitle: "MediaWiki",
      },
    ],
  },
  continue: { iwblcontinue: "q|MediaWiki|25334749", continue: "-||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("iwbacklinks")
  .toEqualTypeOf<ApiIwbacklink[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.iwbacklinks)[number], keyof ApiIwbacklink>
>().toEqualTypeOf<never>();
