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
import type { Flag, NamespaceIndex, Timestamp } from "../common";
import type { ApiEnvelope } from "../envelope";

/** One page entry of an `action=setnotificationtimestamp` response. */
export interface ApiSetNotificationTimestampEntry {
  /** Namespace index. */
  ns: NamespaceIndex;

  /** Page title. */
  title: string;

  /** New notification timestamp, or `""` when there is nothing pending. */
  notificationtimestamp?: Timestamp | "";

  /** The title does not correspond to an existing page. A {@link Flag}. */
  missing?: Flag;

  /** A `missing` title that is nonetheless "known". A {@link Flag}. */
  known?: Flag;

  /** The supplied title/revision id is not valid. A {@link Flag}. */
  invalid?: Flag;

  /** The (logged-in) user is not watching this page, so nothing was set. A {@link Flag}. */
  notwatched?: Flag;

  /** Page id of a missing page (`titles`/`pageids` input). */
  pageid?: number;

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
