/**
 * Type-level assertions for `list=prefixsearch` and its `generator=prefixsearch`
 * form. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiPage,
  ApiPrefixSearchResult,
  ApiQueryResolvedRedirect,
  ApiQueryResponse,
  ApiQueryResult,
  Flag,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import prefixsearchFixture from "../../fixtures/core/query/prefixsearch.json";
import generatorFixture from "../../fixtures/core/query/generator-prefixsearch.json";

export const sample = {
  batchcomplete: true,
  query: {
    prefixsearch: [{ ns: 0, title: "MediaWiki", pageid: 1 }],
  },
  continue: { psoffset: 3, continue: "-||" },
} satisfies ApiQueryResponse;

// A special-page hit carries a `special` flag instead of `pageid`.
export const specialSample = {
  ns: -1,
  title: "Special:Log",
  special: true,
} satisfies ApiPrefixSearchResult;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("prefixsearch")
  .toEqualTypeOf<ApiPrefixSearchResult[] | undefined>();

// `special` only appears when true, in place of `pageid`.
expectTypeOf<ApiPrefixSearchResult>().toHaveProperty("special").toEqualTypeOf<Flag | undefined>();

expectTypeOf<
  ExtraKeys<typeof prefixsearchFixture, keyof ApiQueryResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof prefixsearchFixture.query.prefixsearch)[number], keyof ApiPrefixSearchResult>
>().toEqualTypeOf<never>();

// As a generator it injects only `index`, into the pages it feeds and into the
// `redirects` entries it merges.
expectTypeOf<ExtraKeys<typeof generatorFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof generatorFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof generatorFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof generatorFixture.query.redirects)[number], keyof ApiQueryResolvedRedirect>
>().toEqualTypeOf<never>();
