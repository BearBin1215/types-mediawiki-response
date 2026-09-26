/**
 * Type-level assertions for `list=random`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiQueryResponse, ApiQueryResult, ApiRandomPage } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import randomFixture from "../../fixtures/core/query/random.json";

export const sample = {
  batchcomplete: true,
  query: {
    random: [{ id: 85, ns: 0, title: "MT3 1790390394775" }],
  },
  continue: { rncontinue: "0.045571002965|0.086889066764|17|0", continue: "-||" },
} satisfies ApiQueryResponse;

// With `rnfilterredir=all` a `redirect` boolean rides along, `false` included.
export const nonRedirectSample = {
  id: 17,
  ns: 0,
  title: "MT2 1790390394775",
  redirect: false,
} satisfies ApiRandomPage;

export const redirectSample = {
  id: 23,
  ns: 0,
  title: "MT4 1790390394775",
  redirect: true,
} satisfies ApiRandomPage;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("random")
  .toEqualTypeOf<ApiRandomPage[] | undefined>();

// A real `boolean`, not a `Flag`.
expectTypeOf<ApiRandomPage>().toHaveProperty("redirect").toEqualTypeOf<boolean | undefined>();

expectTypeOf<ExtraKeys<typeof randomFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof randomFixture.query.random)[number], keyof ApiRandomPage>
>().toEqualTypeOf<never>();
