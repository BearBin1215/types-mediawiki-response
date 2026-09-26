/**
 * `prop=deletedrevisions` — revisions of a page that have been deleted
 * (revision-deleted), merged into the shared {@link ApiPage}. Viewing revision
 * comment fields requires the `deletedhistory` right, and viewing slot content
 * requires `deletedtext` (or `undelete`).
 *
 * Rows share {@link ApiRevision} with `prop=revisions`: MediaWiki formats both
 * with the same revision formatter, so the suppressed-field flags
 * (`userhidden`/`commenthidden`/`texthidden`) apply here as well.
 *
 * Fully deleted pages come back with `missing` plus their archived revisions.
 *
 * @see https://www.mediawiki.org/wiki/API:Deletedrevisions
 */
import type { ApiRevision } from "./revisions";

declare module "./index" {
  interface ApiPage {
    /** Deleted revisions of the page (`prop=deletedrevisions`). */
    deletedrevisions?: ApiRevision[];
  }
}
