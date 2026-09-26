/**
 * `action=delete` / `action=undelete` responses — page deletion and its undo,
 * each returned under a top-level object. Requires the `delete` right.
 *
 * Under `formatversion=2` a successful delete carries **no `result` key**
 * (older clients branched on `result: "Success"`).
 *
 * @see https://www.mediawiki.org/wiki/API:Delete
 */
import type { Flag } from "../common";
import type { ApiEnvelope } from "../envelope";

/** The `delete` object of an `action=delete` response. */
export interface ApiDeleteResult {
  /** Deleted page title. */
  title: string;

  /** Deletion reason (echoed back). */
  reason: string;

  /**
   * The deletion was scheduled for asynchronous processing instead of running
   * inline (large pages, above `$wgDeleteRevisionsBatchSize`). Mutually
   * exclusive with {@link logid}: a scheduled deletion has no log entry yet.
   */
  scheduled?: Flag;

  /** Log id of the new deletion log entry. */
  logid?: number;
}

/** Response of `action=delete`. */
export interface ApiDeleteResponse extends ApiEnvelope {
  /** Result of `action=delete`. */
  delete: ApiDeleteResult;
}

/** The `undelete` object of an `action=undelete` response. */
export interface ApiUndeleteResult {
  /** Restored page title. */
  title: string;

  /** Number of revisions restored. */
  revisions: number;

  /** Number of file versions restored. */
  fileversions: number;

  /** Undelete reason (echoed back). */
  reason: string;
}

/** Response of `action=undelete`. */
export interface ApiUndeleteResponse extends ApiEnvelope {
  /** Result of `action=undelete`. */
  undelete: ApiUndeleteResult;
}
