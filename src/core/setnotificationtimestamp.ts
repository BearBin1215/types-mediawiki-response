/**
 * `action=setnotificationtimestamp` response — sets the watchlist notification
 * timestamp for one or more watched pages (marking them read/unread); needs CSRF
 * and a logged-in session. The result is a top-level `setnotificationtimestamp`
 **array** with one entry per targeted page — except with `entirewatchlist=1`,
 * where it is a single object.
 *
 * `notificationtimestamp` may be an empty string (rather than omitted) when the
 * page has no pending notifications — see the fv2 "empty value" convention.
 *
 * @see https://www.mediawiki.org/wiki/API:Setnotificationtimestamp
 */
import type { Flag, Timestamp } from "../common";
import type { ApiEnvelope } from "../envelope";
import type { ApiPageIdentity } from "./query";

/**
 * One entry of the per-page result: the outcome for a targeted page, or a
 * problem entry for an input it could not resolve (`pageid=` / `revid=` that
 * does not exist, or an invalid title). See {@link ApiPageIdentity} for the
 * shared marker fields.
 */
export interface ApiSetNotificationTimestampEntry extends Omit<ApiPageIdentity, "special"> {
  /** New notification timestamp, or `""` when there is nothing pending. */
  notificationtimestamp?: Timestamp | "";

  /** The (logged-in) user is not watching this page, so nothing was set. A {@link Flag}. */
  notwatched?: Flag;

  /** Revision id of a missing revision (`revids` input). */
  revid?: number;
}

/**
 * Whole-watchlist result (`entirewatchlist=1`): a single object instead of the
 * per-page array.
 */
export interface ApiSetNotificationTimestampWatchlistResult {
  /** Notification timestamp applied to every watched page, or `""` when nothing was pending. */
  notificationtimestamp?: Timestamp | "";
}

/** Response of `action=setnotificationtimestamp`. */
export interface ApiSetNotificationTimestampResponse extends ApiEnvelope {
  /** Result of `action=setnotificationtimestamp`: a per-page list, or one object in `entirewatchlist=1` mode. */
  setnotificationtimestamp:
    | ApiSetNotificationTimestampEntry[]
    | ApiSetNotificationTimestampWatchlistResult;
}
