/**
 * `action=languagesearch` response — searches language names for autocomplete
 * UIs. Matches by exact code, then by prefix/infix on the name in the user's
 * language or the autonym; `typos` enables Levenshtein-tolerant matching
 * (default 1).
 *
 * Core since 1.46 (previously served by the Universal Language Selector
 * extension).
 *
 * @see https://www.mediawiki.org/wiki/API:Languagesearch
 * @since MediaWiki 1.46
 */
import type { ApiEnvelope } from "../envelope";

/** Response of `action=languagesearch`. */
export interface ApiLanguageSearchResponse extends ApiEnvelope {
  /**
   * Matched languages keyed by language code, with the display name as the
   * value (e.g. `"zh": "zh – chinese"`). Exact code matches come first; the
   * remaining order is deterministic (grouped by the script of the first
   * character, prefix matches before infix). A PHP map, so an empty result
   * serializes as `[]`.
   */
  languagesearch?: Record<string, string> | unknown[];
}
