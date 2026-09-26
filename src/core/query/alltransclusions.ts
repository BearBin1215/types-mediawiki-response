/**
 * `list=alltransclusions` — enumerate titles that are transcluded, merged into
 * {@link ApiQueryResult}. Shares {@link ApiAllLink} with the `alllinks` family
 * (same MediaWiki class, `at*` parameters).
 *
 * @see https://www.mediawiki.org/wiki/API:Alltransclusions
 */
import type { ApiAllLink } from "./alllinks";

declare module "./index" {
  interface ApiQueryResult {
    /** Transcluded titles on the wiki (`list=alltransclusions`). */
    alltransclusions?: ApiAllLink[];
  }
}
