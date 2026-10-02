/**
 * `action=undelete` response — restoring a deleted page, returned under a
 * top-level `undelete` object. Requires the `delete` right.
 *
 * @see https://www.mediawiki.org/wiki/API:Undelete
 */
import type { ApiEnvelope } from "../envelope";

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
