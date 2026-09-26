/**
 * Type-level assertions for `list=search` and its `generator=search` form,
 * checked against real fixtures. Compiled by `pnpm typecheck`. See
 * `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiPage,
  ApiQueryResolvedRedirect,
  ApiQueryResponse,
  ApiQueryResult,
  ApiSearchHit,
  ApiSearchInfo,
  ApiSearchResult,
  Flag,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import searchFixture from "../../fixtures/core/query/search.json";
import generatorSearchFixture from "../../fixtures/core/query/generator-search.json";
import generatorSearchPropsFixture from "../../fixtures/core/query/generator-search-props.json";
import generatorSearchRedirectsFixture from "../../fixtures/core/query/generator-search-redirects.json";

export const sample = {
  batchcomplete: true,
  query: {
    searchinfo: { totalhits: 19144 },
    search: [
      {
        ns: 0,
        title: "MediaWiki",
        pageid: 1,
        size: 250,
        wordcount: 295,
        snippet: "The MediaWiki software…",
        timestamp: "2023-12-29T18:14:25Z",
        titlesnippet: "MediaWiki",
        categorysnippet: "",
      },
    ],
  },
  continue: { sroffset: 3, continue: "-||" },
} satisfies ApiQueryResponse;

// `list=search` adds both `search` and the `searchinfo` summary.
expectTypeOf<ApiQueryResult>().toHaveProperty("search").toEqualTypeOf<ApiSearchHit[] | undefined>();
// The list side always carries the identity keys; `ApiSearchResult` stays
// all-optional because `generator=search` merges it into `ApiPage`.
expectTypeOf<ApiSearchHit>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiSearchHit>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiSearchHit>().toHaveProperty("pageid").toEqualTypeOf<number>();
expectTypeOf<ApiSearchResult>().toHaveProperty("ns").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiQueryResult>()
  .toHaveProperty("searchinfo")
  .toEqualTypeOf<ApiSearchInfo | undefined>();

// `isfilematch` is a real boolean (`false` for ordinary hits, unlike a `Flag`).
expectTypeOf<ApiSearchResult>().toHaveProperty("isfilematch").toEqualTypeOf<boolean | undefined>();
// `searchinfo` carries a snippet alongside each human-readable rewrite/suggestion.
expectTypeOf<ApiSearchInfo>()
  .toHaveProperty("suggestionsnippet")
  .toEqualTypeOf<string | undefined>();
expectTypeOf<ApiSearchInfo>()
  .toHaveProperty("rewrittenquerysnippet")
  .toEqualTypeOf<string | undefined>();
// A marker, not a count: emitted as `true` alongside `totalhits` when the
// backend stopped counting early (1.44+).
expectTypeOf<ApiSearchInfo>()
  .toHaveProperty("approximate_totalhits")
  .toEqualTypeOf<Flag | undefined>();

expectTypeOf(searchFixture.query.search).toExtend<unknown[]>();
expectTypeOf<ExtraKeys<typeof searchFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof searchFixture.query, keyof ApiQueryResult>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof searchFixture.query.searchinfo, keyof ApiSearchInfo>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof searchFixture.query.search)[number], keyof ApiSearchResult>
>().toEqualTypeOf<never>();

// As a generator, `gsrprop` defaults to empty: only the identity keys plus the
// injected `index` reach `pages`.
export const generatorPageSample = {
  pageid: 1,
  ns: 0,
  title: "MediaWiki",
  index: 1,
} satisfies ApiPage;

// With `gsrprop` the hit fields are injected too.
export const generatorPropsPageSample = {
  pageid: 1,
  ns: 0,
  title: "MediaWiki",
  size: 250,
  wordcount: 295,
  snippet: "The <span>MediaWiki</span> software…",
  timestamp: "2024-01-15T08:30:00Z",
  titlesnippet: "MediaWiki",
  categorysnippet: "",
  isfilematch: false,
  index: 1,
} satisfies ApiPage;

// A `redirects` entry whose source was one of those pages carries the same data.
export const generatorRedirectSample = {
  ns: 0,
  title: "Example",
  pageid: 5,
  size: 20,
  wordcount: 2,
  snippet: "#REDIRECT [[Example (target)]]",
  timestamp: "2024-01-15T08:30:00Z",
  index: 2,
  from: "Example",
  to: "Example (target)",
} satisfies ApiQueryResolvedRedirect;

expectTypeOf<ApiPage>().toHaveProperty("index").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiQueryResolvedRedirect>()
  .toHaveProperty("index")
  .toEqualTypeOf<number | undefined>();
expectTypeOf<ApiQueryResolvedRedirect>()
  .toHaveProperty("pageid")
  .toEqualTypeOf<number | undefined>();

expectTypeOf(generatorSearchFixture.query.pages).toExtend<ApiPage[]>();
expectTypeOf<
  ExtraKeys<typeof generatorSearchFixture, keyof ApiQueryResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof generatorSearchFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof generatorSearchFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();

expectTypeOf<
  ExtraKeys<typeof generatorSearchPropsFixture, keyof ApiQueryResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof generatorSearchPropsFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof generatorSearchPropsFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof generatorSearchPropsFixture.query.searchinfo, keyof ApiSearchInfo>
>().toEqualTypeOf<never>();

// With `redirects=1` the redirect source's generator data is merged into the
// `query.redirects` entry, so those entries carry the hit fields too.
expectTypeOf<
  ExtraKeys<typeof generatorSearchRedirectsFixture, keyof ApiQueryResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof generatorSearchRedirectsFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof generatorSearchRedirectsFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof generatorSearchRedirectsFixture.query.redirects)[number],
    keyof ApiQueryResolvedRedirect
  >
>().toEqualTypeOf<never>();
