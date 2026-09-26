/**
 * Type-level assertions for `list=recentchanges`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiQueryResponse, ApiQueryResult, ApiRecentChange } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import recentchangesFixture from "../../fixtures/core/query/recentchanges.json";

export const sample = {
  batchcomplete: true,
  query: {
    recentchanges: [
      {
        type: "edit",
        ns: 12,
        title: "Help:Import/zh",
        pageid: 2479668,
        revid: 8621042,
        old_revid: 8621040,
        rcid: 10979350,
        user: "Pristome",
        userid: 18203310,
        bot: false,
        new: false,
        minor: false,
        oldlen: 8290,
        newlen: 8238,
        timestamp: "2026-09-25T17:47:32Z",
        comment: "x",
        parsedcomment: "x",
        tags: ["translate-translation-pages"],
        sha1: "e8eedb61b66853aeb15583211b91085ad10b6b47",
      },
    ],
  },
  continue: { rccontinue: "20260925174654|10979346", continue: "-||" },
} satisfies ApiQueryResponse;

// `type` is an open union; log-only fields are optional on the shared entry shape.
expectTypeOf<ApiRecentChange>().toHaveProperty("type");
expectTypeOf<ApiQueryResult>()
  .toHaveProperty("recentchanges")
  .toEqualTypeOf<ApiRecentChange[] | undefined>();

expectTypeOf(recentchangesFixture.query.recentchanges).toExtend<unknown[]>();
expectTypeOf<
  ExtraKeys<typeof recentchangesFixture, keyof ApiQueryResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof recentchangesFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof recentchangesFixture.query.recentchanges)[number], keyof ApiRecentChange>
>().toEqualTypeOf<never>();

// Visibility/temporary-account flags come from `rcprop=user|userid|sha1` on rows
// whose actor or content is restricted; they appear only when true (a `Flag`),
// unlike this module's always-present `bot`/`new`/`minor` booleans.
export const hiddenSample = {
  type: "edit",
  ns: 0,
  title: "Spied on page",
  rcid: 12,
  minor: false,
  new: false,
  bot: false,
  anon: true,
  temp: true,
  userhidden: true,
  commenthidden: true,
  sha1hidden: true,
  suppressed: true,
  actionhidden: true,
} satisfies ApiRecentChange;
