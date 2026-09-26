/**
 * Type-level assertions for `list=imageusage`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiImageUsage, ApiQueryResponse, ApiQueryResult, Flag } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/imageusage.json";

export const sample = {
  batchcomplete: true,
  query: {
    imageusage: [{ pageid: 181915, ns: 0, title: "JetBrains IDEs" }],
  },
  continue: { iucontinue: "0|1752624", continue: "-||" },
} satisfies ApiQueryResponse;

// With `iuredirect=1` a redirect entry nests the pages using the file through it.
export const redirectSample = {
  pageid: 3131,
  ns: 0,
  title: "Redirect page",
  redirect: true,
  redirlinks: [{ pageid: 181915, ns: 0, title: "JetBrains IDEs" }],
} satisfies ApiImageUsage;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("imageusage")
  .toEqualTypeOf<ApiImageUsage[] | undefined>();

// `redirect` only appears when true.
expectTypeOf<ApiImageUsage>().toHaveProperty("redirect").toEqualTypeOf<Flag | undefined>();
expectTypeOf<ApiImageUsage>()
  .toHaveProperty("redirlinks")
  .toEqualTypeOf<ApiImageUsage[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.imageusage)[number], keyof ApiImageUsage>
>().toEqualTypeOf<never>();
