/**
 * Opt-in extension pack: **Universal Language Selector** (`ulssetlang`,
 * `ulslocalization`).
 *
 * Not in the default export: importing anything from this file — even just a
 * response type — is all that is needed; both modules return standalone action
 * payloads, so no declaration merging is involved:
 *
 * ```ts
 * import type {
 *   ApiUlsLocalizationResponse,
 *   ApiUlsSetLanguageResponse,
 * } from 'types-mediawiki-response/ext/uls';
 * ```
 *
 * `action=languagesearch` used to be the third ULS module; it now ships with
 * core as `ApiLanguageSearchResponse` in the core package.
 *
 * @see https://www.mediawiki.org/wiki/Extension:UniversalLanguageSelector
 */
import type { ApiEnvelope } from "../envelope";

/**
 * Response of `action=ulssetlang` (CSRF-token POST): stores the interface
 * language in the named user's preferences. A success response carries no
 * payload keys. Anonymous callers only succeed when `$wgULSAnonCanChangeLanguage`
 * is enabled (then only a cookie is set, likewise with no payload).
 */
export interface ApiUlsSetLanguageResponse extends ApiEnvelope {}

/**
 * Metadata block of a ULS localization bundle, carried over from the source
 * i18n files. Only the keys the wiki's ULS files actually use appear.
 */
export interface ApiUlsLocalizationMetadata {
  /** translators: credited in the source file. */
  authors?: string[];

  /** Message documentation language code, typically `qqq`. */
  "message-documentation"?: string;
}

/**
 * Response of `action=ulslocalization`: the ULS message bundle for one language
 * (its fallback chain merged in), returned raw as JSON — there is no envelope and
 * no `ulslocalization` wrapper. Keys are ULS message ids (e.g.
 * `uls-region-WW`) mapped to their translation; `@metadata` holds the source
 * file credits. The module is internal to ULS; responses are cached publicly
 * for 28 days.
 */
export interface ApiUlsLocalizationResponse {
  /** Credits and provenance of the merged source files. */
  "@metadata"?: ApiUlsLocalizationMetadata;

  [key: string]: string | ApiUlsLocalizationMetadata | undefined;
}
