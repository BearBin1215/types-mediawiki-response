/**
 * `action=rollback` response — reverts the most recent contiguous revisions of a
 * single author on a page. Requires the `rollback` right and the (dedicated)
 * `rollbacktoken` (`meta=tokens&type=rollback`).
 *
 * @see https://www.mediawiki.org/wiki/API:Rollback
 */
import type { ApiEnvelope } from "../envelope";

/** The `rollback` object of an `action=rollback` response. */
export interface ApiRollbackResult {
  /** Rolled-back page title. */
  title: string;

  /** Page id. */
  pageid: number;

  /** Auto-generated rollback summary. */
  summary: string;

  /** Revision id created by the rollback. */
  revid: number;

  /** Revision id that was reverted (the latest bad one). */
  old_revid: number;

  /** Revision id rolled back to (the last good one). */
  last_revid: number;
}

/** Response of `action=rollback`. */
export interface ApiRollbackResponse extends ApiEnvelope {
  /** Result of `action=rollback`. */
  rollback: ApiRollbackResult;
}
