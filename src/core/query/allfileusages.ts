/**
 * `list=allfileusages` — enumerate file titles that are used, merged into
 * {@link ApiQueryResult}. Part of the `alllinks` family (`ApiQueryAllLinks` over
 * the `imagelinks` table, `af*` parameters), so rows share {@link ApiAllLink} —
 * including the `afunique` / `afprop=ids` exclusivity.
 *
 * @see https://www.mediawiki.org/wiki/API:Allfileusages
 */
import type { ApiAllLink } from "./alllinks";

declare module "./index" {
  interface ApiQueryResult {
    /** Used file titles, one row per usage (`list=allfileusages`). */
    allfileusages?: ApiAllLink[];
  }
}
