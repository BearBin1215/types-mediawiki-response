/**
 * Type-level assertions for `list=allrevisions`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiAllRevisions, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/allrevisions.json";

export const sample = {
  batchcomplete: true,
  query: {
    allrevisions: [
      {
        pageid: 2,
        revisions: [
          {
            revid: 2,
            parentid: 0,
            user: "127.0.0.1",
            anon: true,
            userid: 0,
            timestamp: "2026-09-25T18:40:42Z",
            size: 23,
            sha1: "c745ac8ff4c0172ea46a0440d6b4795e35dd7410",
            roles: ["main"],
            slots: { main: { contentmodel: "wikitext" } },
            comment: "create fixture",
            tags: [],
          },
        ],
        ns: 0,
        title: "Fixture edit target",
      },
    ],
  },
  continue: { arvcontinue: "20260925184042|4", continue: "-||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("allrevisions")
  .toEqualTypeOf<ApiAllRevisions[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.allrevisions)[number], keyof ApiAllRevisions>
>().toEqualTypeOf<never>();
