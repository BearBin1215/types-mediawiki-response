/**
 * `meta=languageinfo` — information about languages, merged into
 * {@link ApiQueryResult} as an object keyed by language code. Which fields
 * appear depends on `liprop`.
 *
 * @see https://www.mediawiki.org/wiki/API:Languageinfo
 */

/** Information about one language (`meta=languageinfo`, keyed by code). */
export interface ApiLanguageInfo {
  /** Language code. `liprop=code`. */
  code?: string;

  /** BCP 47 language tag. `liprop=bcp47`. */
  bcp47?: string;

  /** Writing direction. `liprop=dir`. */
  dir?: "ltr" | "rtl";

  /** Name in the language itself. `liprop=autonym`. */
  autonym?: string;

  /** Name in the content/`uselang` language. `liprop=name`. */
  name?: string;

  /** Fallback language codes, in order. `liprop=fallbacks`. */
  fallbacks?: string[];

  /** Language-variant codes. `liprop=variants`. */
  variants?: string[];

  /**
   * Variant display names, keyed by variant code. `liprop=variantnames`.
   *
   * @since MediaWiki 1.40
   */
  variantnames?: Record<string, string>;

  /**
   * Digit transforms: an ASCII-digit → localized-digit mapping. `liprop=digittransforms`.
   * A PHP map keyed `0..9`; when a language omits some entries it serializes as an
   * object, and an empty table surfaces as `[]`.
   *
   * @since MediaWiki 1.47
   */
  digittransforms?: string[] | Record<string, string>;

  /**
   * CLDR digit-grouping pattern (e.g. `#,##0.###`). `liprop=digitgroupingpattern`.
   *
   * @since MediaWiki 1.47
   */
  digitgroupingpattern?: string;

  /**
   * Minimum number of digits required before grouping applies. `liprop=minimumgroupingdigits`.
   *
   * @since MediaWiki 1.47
   */
  minimumgroupingdigits?: number;

  /**
   * Localized namespace names, keyed by numeric namespace id. `liprop=namespacenames`;
   * the main namespace's value is the empty string.
   *
   * @since MediaWiki 1.47
   */
  namespacenames?: Record<string, string>;

  /**
   * Localized namespace aliases, mapping each alias to its namespace id.
   * `liprop=namespacealiases`.
   *
   * @since MediaWiki 1.47
   */
  namespacealiases?: Record<string, number>;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Language information keyed by language code (`meta=languageinfo`). */
    languageinfo?: Record<string, ApiLanguageInfo>;
  }
}
