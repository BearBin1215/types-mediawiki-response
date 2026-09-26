/**
 * `action=mergehistory` response — merges the revision history of one page into
 * another; needs CSRF and the `mergehistory` (sysop) right. The result keys under
 * `mergehistory`.
 *
 * @see https://www.mediawiki.org/wiki/API:Mergehistory
 */
import type { Timestamp } from "../common";
import type { ApiEnvelope } from "../envelope";

/** Response of `action=mergehistory`. */
export interface ApiMergeHistoryResponse extends ApiEnvelope {
  /** Result of `action=mergehistory`. */
  mergehistory: {
    /** Source page title (history moved out of). */
    from: string;

    /** Destination page title (history merged into). */
    to: string;

    /**
     * Cutoff timestamp up to which revisions were merged, as ISO 8601. Echoes
     * the `timestamp` parameter when supplied; with a full-history merge (no
     * `timestamp` given) it is the current server time.
     */
    timestamp: Timestamp;

    /** Reason supplied with the merge; `''` when none was given. */
    reason: string;
  };
}
