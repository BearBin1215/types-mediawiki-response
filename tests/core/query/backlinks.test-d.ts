/**
 * Type-level assertions for `list=backlinks`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiBacklink, ApiQueryResponse, ApiQueryResult, Flag } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import backlinksFixture from "../../fixtures/core/query/backlinks.json";

export const sample = {
  batchcomplete: true,
  query: {
    backlinks: [{ pageid: 1588, ns: 2, title: "User:Bdk/Translation Core" }],
  },
  continue: { blcontinue: "4|3131", continue: "-||" },
} satisfies ApiQueryResponse;

// With `blredirect=1` a redirect entry nests the pages linking through it.
export const redirectSample = {
  pageid: 3131,
  ns: 0,
  title: "Redirect page",
  redirect: true,
  redirlinks: [{ pageid: 1588, ns: 2, title: "User:Bdk/Translation Core" }],
} satisfies ApiBacklink;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("backlinks")
  .toEqualTypeOf<ApiBacklink[] | undefined>();

// `redirect` only appears when true, and there is no `timestamp` field.
expectTypeOf<ApiBacklink>().toHaveProperty("redirect").toEqualTypeOf<Flag | undefined>();
expectTypeOf<ApiBacklink>().toHaveProperty("redirlinks").toEqualTypeOf<ApiBacklink[] | undefined>();
expectTypeOf<"timestamp" extends keyof ApiBacklink ? true : false>().toEqualTypeOf<false>();

expectTypeOf<ExtraKeys<typeof backlinksFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof backlinksFixture.query.backlinks)[number], keyof ApiBacklink>
>().toEqualTypeOf<never>();
