/**
 * `list=allredirects` — enumerate titles that are redirect targets, merged into
 * {@link ApiQueryResult}. Shares {@link ApiAllLink} with the `alllinks` family
 * (same MediaWiki class, `ar*` parameters); the redirect-table columns below are
 * this module's own `arprop` values, merged into the shared shape.
 *
 * @see https://www.mediawiki.org/wiki/API:Allredirects
 */
import type { ApiAllLink } from "./alllinks";

declare module "./alllinks" {
  interface ApiAllLink {
    /** Fragment of the redirect target title. `arprop=fragment`. */
    fragment?: string;

    /** Interwiki prefix of the redirect target, when it points off-site. `arprop=interwiki`. */
    interwiki?: string;
  }
}

declare module "./index" {
  interface ApiQueryResult {
    /** Redirect targets on the wiki (`list=allredirects`). */
    allredirects?: ApiAllLink[];
  }
}
