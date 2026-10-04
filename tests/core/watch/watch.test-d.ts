/**
 * Type-level assertions for `action=watch` (watch / unwatch), checked against
 * local MediaWiki 1.43 fv2 fixtures. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiWatchEntry, ApiWatchResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import watchFixture from "../../fixtures/core/watch/watch.json";
import unwatchFixture from "../../fixtures/core/watch/unwatch.json";

export const watchSample = {
  batchcomplete: true,
  watch: [{ title: "Fixture edit target", ns: 0, watched: true }],
} satisfies ApiWatchResponse;

// Legacy `title` mode yields a single object instead of an array.
export const legacyTitleSample = {
  batchcomplete: true,
  watch: { title: "Fixture edit target", ns: 0, watched: true },
} satisfies ApiWatchResponse;

// A modern `errorformat` renders the in-band messages as `ApiMessage`s.
export const watchErrorModernSample = {
  batchcomplete: true,
  watch: [{ title: "Fixture edit target", ns: 0, errors: [{ code: "hookaborted", text: "…" }] }],
} satisfies ApiWatchResponse;

// A watchlist-label failure is a `formatMessage` result appended to the same
// `errors` array: `{ code, info }` under `bc` (verified on 1.46), an
// `ApiMessage` otherwise.
export const watchLabelErrorSample = {
  batchcomplete: true,
  watch: [
    {
      title: "Main Page",
      ns: 0,
      watched: true,
      errors: [{ code: "labels-disabled", info: "Watchlist labels are not enabled on this wiki." }],
    },
  ],
} satisfies ApiWatchResponse;

// Pageset mode yields a per-title array; the legacy `title` parameter a single object.
expectTypeOf<ApiWatchResponse>()
  .toHaveProperty("watch")
  .toEqualTypeOf<ApiWatchEntry | ApiWatchEntry[]>();

// `watched` / `unwatched` are real booleans (operation-success indicators).
expectTypeOf<ApiWatchEntry>().toHaveProperty("watched").toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiWatchEntry>().toHaveProperty("unwatched").toEqualTypeOf<boolean | undefined>();

expectTypeOf<ExtraKeys<typeof watchFixture, keyof ApiWatchResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof watchFixture.watch)[number], keyof ApiWatchEntry>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof unwatchFixture.watch)[number], keyof ApiWatchEntry>
>().toEqualTypeOf<never>();
