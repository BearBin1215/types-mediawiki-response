/**
 * `prop=fileusage` — local pages that use (embed) a file, merged into
 * {@link ApiPage} via declaration merging. For usage across the whole wiki farm
 * (including this wiki), use `prop=globalusage`, which offers `gufilterlocal=1`
 * to drop the local wiki's rows.
 *
 * @see https://www.mediawiki.org/wiki/API:Fileusage
 */
import type { NamespaceIndex } from "../../common";

/** One local usage record. `fuprop` controls which fields appear. */
export interface ApiFileUsage {
  /** Page id of the using page. `fuprop=pageid`. */
  pageid?: number;

  /** Namespace index. */
  ns?: NamespaceIndex;

  /** Full title of the using page. */
  title?: string;

  /** Whether the using page is a redirect. `fuprop=redirect`; a real `boolean`. */
  redirect?: boolean;
}

declare module "./index" {
  interface ApiPage {
    /** Local pages using this file (`prop=fileusage`). */
    fileusage?: ApiFileUsage[];
  }
}
