/**
 * `list=allpages` — enumerate all pages in a namespace, merged into
 * {@link ApiQueryResult}. Each entry carries only the page identity:
 * `{ pageid, ns, title }`.
 *
 * @see https://www.mediawiki.org/wiki/API:Allpages
 */
import type { ApiPageRef } from "./shared";

/** One page listed by `list=allpages`. */
export interface ApiAllPage extends ApiPageRef {}

declare module "./index" {
  interface ApiQueryResult {
    /** Enumerated pages (`list=allpages`). */
    allpages?: ApiAllPage[];
  }
}
