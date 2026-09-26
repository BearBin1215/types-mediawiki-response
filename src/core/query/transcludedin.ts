/**
 * `prop=transcludedin` — pages that transclude (embed) the queried page,
 * merged into {@link ApiPage} via declaration merging. Shape matches
 * `prop=linkshere`.
 *
 * @see https://www.mediawiki.org/wiki/API:Transcludedin
 */
import type { NamespaceIndex } from "../../common";

/** One page in a `transcludedin` result. `tiprop` controls which fields appear. */
export interface ApiTranscludedIn {
  /** Page id. `tiprop=pageid`. */
  pageid?: number;

  /** Namespace index. */
  ns?: NamespaceIndex;

  /** Full page title. */
  title?: string;

  /** Whether the transcluding page is a redirect. `tiprop=redirect`; a real `boolean`. */
  redirect?: boolean;
}

declare module "./index" {
  interface ApiPage {
    /** Pages transcluding this page (`prop=transcludedin`). */
    transcludedin?: ApiTranscludedIn[];
  }
}
