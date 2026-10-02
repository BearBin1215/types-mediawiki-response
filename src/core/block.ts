/**
 * `action=block` response — blocking a user or IP range, returned under a
 * top-level `block` object. Requires the `block` right.
 *
 * fv2 note: the block result uses **`userID`** (capital `D`), unlike the
 * unblock result's `userid`. Block flags are real booleans (present as
 * `false`); partial-block restrictions come back as `null` when the block is
 * sitewide.
 *
 * @see https://www.mediawiki.org/wiki/API:Block
 */
import type { BlockExpiry, Timestamp } from "../common";
import type { ApiEnvelope } from "../envelope";

/** The `block` object of an `action=block` response. */
export interface ApiBlockResult {
  /** Blocked user name / IP. */
  user: string;

  /** Blocked user id (`0` for IPs / autoblocks). Note the capital `D`. */
  userID: number;

  /** Block id. */
  id: number;

  /** Expiry timestamp, or `infinite` for an indefinite block. */
  expiry: BlockExpiry;

  /** Block reason (echoed back). */
  reason: string;

  /** Block only anonymous users editing from an IP address range. */
  anononly: boolean;

  /** Prevent new account creation from the blocked user or IP range. */
  nocreate: boolean;

  /** Also block the IP addresses this user edits from. */
  autoblock: boolean;

  /** Prevent the user from sending email via `Special:Emailuser`. */
  noemail: boolean;

  /** Hide the username in logs and contributions. */
  hidename: boolean;

  /** Let the blocked user keep editing their own user talk page. */
  allowusertalk: boolean;

  /** Add the blocked user's user and talk pages to the blocker's watchlist. */
  watchuser: boolean;

  /** Restrict the block to specific pages or namespaces instead of sitewide. */
  partial: boolean;

  /** Page restrictions of a partial block; `null` when sitewide. */
  pagerestrictions: unknown;

  /** Namespace restrictions of a partial block; `null` when sitewide. */
  namespacerestrictions: unknown;

  /**
   * Expiry applied to the watched user page, present only when the request
   * passed `watchlistexpiry`; `null` when the page is not actually watched.
   */
  watchlistexpiry?: Timestamp | null;

  /**
   * Restricted actions of a partial action block; only emitted when
   * `$wgEnablePartialActionBlocks` is enabled.
   */
  actionrestrictions?: string[];

  /**
   * When the block was applied, in ISO 8601.
   *
   * @since MediaWiki 1.47
   */
  timestamp?: Timestamp;

  /**
   * Extra statuses set by extensions during a successful block; `[]` when none
   * is set.
   *
   * @since MediaWiki 1.46
   */
  additionalBlocksStatuses?: Record<string, unknown> | unknown[];
}

/** Response of `action=block`. */
export interface ApiBlockResponse extends ApiEnvelope {
  /** Result of `action=block`. */
  block: ApiBlockResult;
}
