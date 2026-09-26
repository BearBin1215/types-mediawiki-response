/**
 * Type-level assertions for `list=embeddedin`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiEmbeddedIn, ApiQueryResponse, ApiQueryResult, Flag } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import embeddedinFixture from "../../fixtures/core/query/embeddedin.json";

export const sample = {
  batchcomplete: true,
  query: {
    embeddedin: [{ pageid: 1748, ns: 12, title: "Help:Magic words" }],
  },
  continue: { eicontinue: "12|37872", continue: "-||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("embeddedin")
  .toEqualTypeOf<ApiEmbeddedIn[] | undefined>();

// `redirect` only appears when true; no `timestamp`, and no nested
// `redirlinks` (this module has no redirect parameter).
expectTypeOf<ApiEmbeddedIn>().toHaveProperty("redirect").toEqualTypeOf<Flag | undefined>();
expectTypeOf<"timestamp" extends keyof ApiEmbeddedIn ? true : false>().toEqualTypeOf<false>();
expectTypeOf<"redirlinks" extends keyof ApiEmbeddedIn ? true : false>().toEqualTypeOf<false>();

expectTypeOf<ExtraKeys<typeof embeddedinFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof embeddedinFixture.query.embeddedin)[number], keyof ApiEmbeddedIn>
>().toEqualTypeOf<never>();
