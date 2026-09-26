/**
 * Type-level assertions for `list=watchlistraw`. See `info.test-d.ts` for the recipe.
 *
 * The interesting assertions are the placement ones: core emits this array as a
 * **root-level** key, so a query for nothing else has no `query` member, and the
 * key must not have been folded into `ApiQueryResult` like ordinary list modules.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiQueryResponse,
  ApiQueryResult,
  ApiWatchlistRawEntry,
  ApiWatchlistRawResponse,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/watchlistraw.json";

export const sample = {
  batchcomplete: true,
  continue: { wrcontinue: "0|Delete_target_1790390753588", continue: "-||" },
  watchlistraw: [{ ns: 0, title: "Abuse log probe" }],
} satisfies ApiWatchlistRawResponse;

// Still visible on a mixed query, where `query` is present too.
export const mixedSample = {
  batchcomplete: true,
  query: { pages: [{ pageid: 1, ns: 0, title: "Main Page" }] },
  watchlistraw: [{ ns: 0, title: "Main Page", changed: "2026-09-26T10:46:46Z" }],
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResponse>()
  .toHaveProperty("watchlistraw")
  .toEqualTypeOf<ApiWatchlistRawEntry[] | undefined>();
// Not merged into `query` — core puts it at the root.
expectTypeOf<"watchlistraw" extends keyof ApiQueryResult ? true : false>().toEqualTypeOf<false>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiWatchlistRawResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.watchlistraw)[number], keyof ApiWatchlistRawEntry>
>().toEqualTypeOf<never>();
