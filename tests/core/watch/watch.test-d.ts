/**
 * Type-level assertions for `action=watch` (watch / unwatch), checked against
 * local MediaWiki 1.43 fv2 fixtures. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiWatchEntry, ApiWatchResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import watchFixture from "../../fixtures/core/watch/watch.json";
import unwatchFixture from "../../fixtures/core/watch/unwatch.json";
import missingPageIdFixture from "../../fixtures/core/watch/watch-missing-pageid.json";
import missingRevidFixture from "../../fixtures/core/watch/watch-missing-revid.json";
import invalidTitleFixture from "../../fixtures/core/watch/watch-invalid-title.json";

export const watchSample = {
  batchcomplete: true,
  watch: [{ title: "Fixture edit target", ns: 0, watched: true }],
} satisfies ApiWatchResponse;

// Legacy `title` mode yields a single object instead of an array.
export const legacyTitleSample = {
  batchcomplete: true,
  watch: { title: "Fixture edit target", ns: 0, watched: true },
} satisfies ApiWatchResponse;

// The interwiki branch has no live capture; the id/title problem-entry shapes
// are covered by the fixtures below.
export const problemInterwikiSample = {
  batchcomplete: true,
  watch: [{ title: "mw:MediaWiki", iw: "mw" }],
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

// The identity triple is optional: problem entries may lack a resolved title.
expectTypeOf<ApiWatchEntry>().toHaveProperty("title").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiWatchEntry>().toHaveProperty("ns").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiWatchEntry>().toHaveProperty("pageid").toEqualTypeOf<number | undefined>();

// watch never reports `known`: its page set filters out `missingTitles`.
expectTypeOf<ApiWatchEntry>().not.toHaveProperty("known");

expectTypeOf<ExtraKeys<typeof watchFixture, keyof ApiWatchResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof watchFixture.watch)[number], keyof ApiWatchEntry>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof unwatchFixture.watch)[number], keyof ApiWatchEntry>
>().toEqualTypeOf<never>();

// Captured problem entries (1.43.11): `ns`/`title` are absent, and every
// captured key is declared on the type.
expectTypeOf<
  ExtraKeys<(typeof missingPageIdFixture.watch)[number], keyof ApiWatchEntry>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof missingRevidFixture.watch)[number], keyof ApiWatchEntry>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof invalidTitleFixture.watch)[number], keyof ApiWatchEntry>
>().toEqualTypeOf<never>();
