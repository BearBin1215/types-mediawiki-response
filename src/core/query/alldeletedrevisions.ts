/**
 * `list=alldeletedrevisions` — deleted revisions across the wiki, grouped per
 * page, merged into {@link ApiQueryResult}. The list-side counterpart of
 * `prop=deletedrevisions` (which is keyed by the titles you ask for).
 *
 * Grouping keys the page with `pageid: 0` when the page itself is deleted rather
 * than merely some of its revisions, so `0` is meaningful, not a placeholder.
 *
 * @see https://www.mediawiki.org/wiki/API:Alldeletedrevisions
 */
import type { ApiPageRef } from "./shared";
import type { ApiRevision } from "./revisions";

/** One page carrying at least one deleted revision. */
export interface ApiAllDeletedRevisions extends ApiPageRef {
  /** Page id; `0` when the whole page is deleted. */
  pageid: number;

  /** The page's deleted revisions, ordered per `ardir` (default `older`). */
  revisions: ApiRevision[];
}

declare module "./index" {
  interface ApiQueryResult {
    /** Deleted revisions grouped by page (`list=alldeletedrevisions`). */
    alldeletedrevisions?: ApiAllDeletedRevisions[];
  }
}
