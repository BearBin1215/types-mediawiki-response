/**
 * `action=setpagelanguage` response — overrides a page's content language; needs
 * CSRF and the `pagelang` right, and the feature must be enabled via
 * `$wgPageLanguageUseDB`. The result keys under `setpagelanguage`.
 *
 * `oldlanguage`/`newlanguage` are language codes; `oldlanguage` may carry the
 * `default` suffix (e.g. `en[def]`) when the page inherited the site language.
 *
 * @see https://www.mediawiki.org/wiki/API:Setpagelanguage
 */
import type { ApiEnvelope } from "../envelope";

/** Response of `action=setpagelanguage`. */
export interface ApiSetPageLanguageResponse extends ApiEnvelope {
  /** Result of `action=setpagelanguage`. */
  setpagelanguage: {
    /** Page title. */
    title: string;

    /** Language code before the change (may be suffixed, e.g. `en[def]`). */
    oldlanguage: string;

    /** Language code after the change. */
    newlanguage: string;

    /** Log entry id recorded for the change. */
    logid: number;
  };
}
