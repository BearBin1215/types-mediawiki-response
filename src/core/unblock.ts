/**
 * `action=unblock` response — removing a block, returned under a top-level
 * `unblock` object. Requires the `block` right.
 *
 * fv2 note: the unblock result uses `userid` (lowercase), unlike the block
 * result's `userID`.
 *
 * @see https://www.mediawiki.org/wiki/API:Block
 */
import type { Timestamp } from "../common";
import type { ApiEnvelope } from "../envelope";

/** The `unblock` object of an `action=unblock` response. */
export interface ApiUnblockResult {
  /** Removed block id. */
  id: number;

  /** Unblocked user name / IP; empty string when removing an autoblock. */
  user: string;

  /** Unblocked user id (`0` for IPs and autoblocks). Note lowercase, unlike the block result. */
  userid: number;

  /** Unblock reason (echoed back). */
  reason: string;

  /** Whether the unblock added the unblocked user to the unblocker's watchlist. */
  watchuser: boolean;

  /**
   * Expiry applied to the watched user page, present only when the request
   * passed `watchlistexpiry` with `watchuser`; `null` when the page is not
   * actually watched.
   */
  watchlistexpiry?: Timestamp | null;
}

/** Response of `action=unblock`. */
export interface ApiUnblockResponse extends ApiEnvelope {
  /** Result of `action=unblock`. */
  unblock: ApiUnblockResult;
}
