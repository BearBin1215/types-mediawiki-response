/**
 * Type-level assertions for `action=setnotificationtimestamp` (local MediaWiki
 * 1.43 fv2 fixture). Per-page mode yields a top-level **array**;
 * `entirewatchlist=1` yields a single object. See `info.test-d.ts`.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiSetNotificationTimestampEntry,
  ApiSetNotificationTimestampResponse,
  ApiSetNotificationTimestampWatchlistResult,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/setnotificationtimestamp/setnotificationtimestamp.json";
import missingPageIdFixture from "../../fixtures/core/setnotificationtimestamp/missing-pageid.json";
import missingRevidFixture from "../../fixtures/core/setnotificationtimestamp/missing-revid.json";
import invalidTitleFixture from "../../fixtures/core/setnotificationtimestamp/invalid-title.json";

export const sample = {
  batchcomplete: true,
  setnotificationtimestamp: [{ ns: 0, title: "Gap spl target", notificationtimestamp: "" }],
} satisfies ApiSetNotificationTimestampResponse;

// Entire-watchlist mode yields a single object, not an array.
export const entireWatchlistSample = {
  batchcomplete: true,
  setnotificationtimestamp: { notificationtimestamp: "" },
} satisfies ApiSetNotificationTimestampResponse;

expectTypeOf<ApiSetNotificationTimestampResponse>()
  .toHaveProperty("setnotificationtimestamp")
  .toEqualTypeOf<ApiSetNotificationTimestampEntry[] | ApiSetNotificationTimestampWatchlistResult>();

// The identity triple is optional: problem entries may lack a resolved title.
expectTypeOf<ApiSetNotificationTimestampEntry>()
  .toHaveProperty("ns")
  .toEqualTypeOf<number | undefined>();
expectTypeOf<ApiSetNotificationTimestampEntry>()
  .toHaveProperty("title")
  .toEqualTypeOf<string | undefined>();

// The module never reports `special`: special titles never enter its page set.
expectTypeOf<ApiSetNotificationTimestampEntry>().not.toHaveProperty("special");

// `notificationtimestamp` allows the empty-string sentinel, not just a timestamp.
expectTypeOf<ApiSetNotificationTimestampEntry>()
  .toHaveProperty("notificationtimestamp")
  .toEqualTypeOf<string | undefined>();

expectTypeOf<
  (typeof fixture.setnotificationtimestamp)[number]
>().toExtend<ApiSetNotificationTimestampEntry>();
expectTypeOf<
  ExtraKeys<typeof fixture, keyof ApiSetNotificationTimestampResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof fixture.setnotificationtimestamp)[number],
    keyof ApiSetNotificationTimestampEntry
  >
>().toEqualTypeOf<never>();

// Captured problem entries (1.43.11): `ns`/`title` are absent, `invalidreason`
// is a plain string under the default `errorformat`.
expectTypeOf<
  ExtraKeys<
    (typeof missingPageIdFixture.setnotificationtimestamp)[number],
    keyof ApiSetNotificationTimestampEntry
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof missingRevidFixture.setnotificationtimestamp)[number],
    keyof ApiSetNotificationTimestampEntry
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof invalidTitleFixture.setnotificationtimestamp)[number],
    keyof ApiSetNotificationTimestampEntry
  >
>().toEqualTypeOf<never>();
