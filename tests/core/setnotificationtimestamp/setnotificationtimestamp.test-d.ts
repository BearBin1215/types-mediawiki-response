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
