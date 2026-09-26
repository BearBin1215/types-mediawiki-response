/**
 * Type-level assertions for `list=querypage` (the special-page report list).
 * Named `list-` to avoid clashing with `querypage.test-d.ts`, which asserts the
 * `QueryPage<K>` scoped-page view. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiQueryPage,
  ApiQueryPageResult,
  ApiQueryResponse,
  ApiQueryResult,
  Flag,
  Timestamp,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import ancientFixture from "../../fixtures/core/query/querypage-ancient.json";
import plainFixture from "../../fixtures/core/query/querypage-plain.json";
import doubleRedirectFixture from "../../fixtures/core/query/querypage-double-redirect.json";

export const sample = {
  batchcomplete: true,
  query: {
    querypage: {
      name: "Ancientpages",
      results: [
        { value: "20260925183926", timestamp: "2026-09-25T18:39:26Z", ns: 0, title: "Main Page" },
      ],
    },
  },
  continue: { qpoffset: 3, continue: "-||" },
} satisfies ApiQueryResponse;

// A report whose rows carry no `value` column at all.
export const plainSample = {
  batchcomplete: true,
  query: { querypage: { name: "Lonelypages", results: [{ ns: 0, title: "Abuse log probe" }] } },
  continue: { qpoffset: 3, continue: "-||" },
} satisfies ApiQueryResponse;

// A report that selects extra columns it does not name: they surface verbatim
// under `databaseResult` rather than as their own fields.
export const doubleRedirectSample = {
  batchcomplete: true,
  query: {
    querypage: {
      name: "DoubleRedirects",
      results: [
        {
          ns: 0,
          title: "Redirect report a 1790419078032",
          databaseResult: {
            b_namespace: "0",
            b_title: "Redirect_report_b_1790419078032",
            b_fragment: "",
          },
        },
      ],
    },
  },
} satisfies ApiQueryResponse;

// A cached report announces the cache state; a cached-but-not-cacheable one
// withholds its rows behind `disabled` instead.
export const cachedSample = {
  batchcomplete: true,
  query: {
    querypage: {
      name: "Ancientpages",
      cached: true,
      cachedtimestamp: "2026-09-25T18:39:26Z",
      maxresults: 5000,
      results: [
        { value: "20260925183926", timestamp: "2026-09-25T18:39:26Z", ns: 0, title: "Main Page" },
      ],
    },
  },
  continue: { qpoffset: 3, continue: "-||" },
} satisfies ApiQueryResponse;

export const disabledSample = {
  batchcomplete: true,
  query: { querypage: { name: "Mostlinked", disabled: true } },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("querypage")
  .toEqualTypeOf<ApiQueryPage | undefined>();
expectTypeOf<ApiQueryPage>()
  .toHaveProperty("results")
  .toEqualTypeOf<ApiQueryPageResult[] | undefined>();
expectTypeOf<ApiQueryPageResult>()
  .toHaveProperty("databaseResult")
  .toEqualTypeOf<Record<string, string> | undefined>();

// `cached` and `disabled` only appear when true.
expectTypeOf<ApiQueryPage>().toHaveProperty("cached").toEqualTypeOf<Flag | undefined>();
expectTypeOf<ApiQueryPage>().toHaveProperty("disabled").toEqualTypeOf<Flag | undefined>();
expectTypeOf<ApiQueryPage>()
  .toHaveProperty("cachedtimestamp")
  .toEqualTypeOf<Timestamp | undefined>();

expectTypeOf<ExtraKeys<typeof ancientFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof ancientFixture.query.querypage)["results"][number], keyof ApiQueryPageResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof plainFixture.query.querypage, keyof ApiQueryPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof doubleRedirectFixture.query.querypage)["results"][number],
    keyof ApiQueryPageResult
  >
>().toEqualTypeOf<never>();
