/**
 * Type-level assertions for a generator (`generator=links`) feeding `query.pages`.
 * A generator contributes no new list/meta result keys — it populates `pages`,
 * which then carries whichever `prop=` fields were requested (here `info`). The
 * search generators additionally inject hit fields; see `search.test-d.ts` and
 * `prefixsearch.test-d.ts`. Compiled by `pnpm typecheck`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiPage, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import generatorFixture from "../../fixtures/core/query/generator-links.json";

export const sample = {
  batchcomplete: true,
  query: {
    pages: [
      {
        pageid: 1738,
        ns: 12,
        title: "Help:Contents",
        contentmodel: "wikitext",
        pagelanguage: "en",
        pagelanguagehtmlcode: "en",
        pagelanguagedir: "ltr",
        touched: "2026-09-25T14:46:24Z",
        lastrevid: 8557653,
        length: 4933,
      },
    ],
  },
} satisfies ApiQueryResponse;

// `pagelanguagedir` is a closed literal union, and `resolveJsonModule` widens
// the fixture's `"ltr"` to `string`, so the fixture can never extend `ApiPage`
// as a whole; check every other field.
expectTypeOf(generatorFixture.query.pages).toExtend<Omit<ApiPage, "pagelanguagedir">[]>();
expectTypeOf<ExtraKeys<typeof generatorFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof generatorFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof generatorFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
