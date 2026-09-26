/**
 * `list=allrevisions` — revisions enumerated across the wiki, grouped per page,
 * merged into {@link ApiQueryResult}. The list-side counterpart of
 * `prop=revisions`, useful without a title list (pair it with a generator, or
 * page the whole namespace with `arvnamespace`).
 *
 * Rows are formatted exactly like `prop=revisions`, so they reuse
 * {@link ApiRevision}; `list=alldeletedrevisions` groups identically.
 *
 * @see https://www.mediawiki.org/wiki/API:Allrevisions
 */
import type { ApiPageRef } from "./shared";
import type { ApiRevision } from "./revisions";

/** One page with the revisions requested for it. */
export interface ApiAllRevisions extends ApiPageRef {
  /** Revisions of the page, ordered per `arvdir`. */
  revisions: ApiRevision[];
}

declare module "./index" {
  interface ApiQueryResult {
    /** Revisions grouped by page (`list=allrevisions`). */
    allrevisions?: ApiAllRevisions[];
  }
}
