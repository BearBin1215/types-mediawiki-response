/**
 * Opt-in extension pack: **SiteMatrix** (`action=sitematrix`).
 *
 * A standalone action response — import and use it directly (no declaration
 * merging needed):
 *
 * ```ts
 * import type { ApiSiteMatrixResponse } from 'types-mediawiki-response/ext/sitematrix';
 * ```
 *
 * Lists the wikis of a wiki farm as configured through `$wgLocalDatabases` and
 * the `$wgSiteMatrix*` settings. Anonymously readable.
 *
 * fv2 notes: the matrix is keyed by numeric string (`"0"`, `"1"`, …) because
 * the `count` and `specials` keys break the array form, and the language
 * entries keep their string index keys. State flags on language-site
 * rows can only ever be `closed`; `private`/`fishbowl`/`nonglobal` are only
 * reported for special wikis. All flags are real booleans and appear even with
 * the default `smstate=all`.
 *
 * @see https://www.mediawiki.org/wiki/Extension:SiteMatrix
 */
import type { ApiEnvelope } from "../envelope";

/** One project-family wiki of a language entry. */
export interface ApiSiteMatrixSite {
  /** Canonical server URL of the wiki. */
  url?: string;

  /** Database name, `<lang><family>` for language-split sites (e.g. `<lang>wiki`). */
  dbname?: string;

  /** Project family code, e.g. `wiki`. */
  code?: string;

  /** Wiki content language (BCP 47); requires `smsiteprop=lang`. */
  lang?: string;

  /** Site name of the wiki. */
  sitename?: string;

  /** Whether the wiki is closed for editing; `smsiteprop` irrelevant. */
  closed?: boolean;
}

/** One language row of the matrix: every wiki in that language. */
export interface ApiSiteMatrixLanguage {
  /** Language host code (dashes preserved, e.g. `zh-min-nan`). */
  code?: string;

  /** Language name in the language itself (autonym), e.g. `Deutsch`. */
  name?: string | null;

  /** Localized language name (in the interface language); `smlangprop=localname`. */
  localname?: string;

  /** Text direction of the language. */
  dir?: "ltr" | "rtl";

  /** Wikis of this language in each project family. */
  site?: ApiSiteMatrixSite[];
}

/** One special (non-language-split) wiki, e.g. `www.mediawiki.org`. */
export interface ApiSiteMatrixSpecial {
  /** Canonical server URL of the wiki. */
  url?: string;

  /** Database name, e.g. `mediawikiwiki`. */
  dbname?: string;

  /**
   * Wiki code without the family suffix, e.g. `mediawiki` (the corresponding
   * {@link dbname} is `mediawikiwiki`).
   */
  code?: string;

  /** Wiki content language (BCP 47). */
  lang?: string;

  /** Site name of the wiki. */
  sitename?: string;

  /** Whether the wiki is private; only reported for special wikis. */
  private?: boolean;

  /** Whether the wiki is fishbowl (read-public, write-restricted); special wikis only. */
  fishbowl?: boolean;

  /** Whether the wiki is excluded from SUL; only reported for special wikis. */
  nonglobal?: boolean;

  /** Whether the wiki is closed for editing. */
  closed?: boolean;
}

/**
 * The `sitematrix` object: `count`, `specials` and one key per language
 * (numeric strings, `"0"`, `"1"`, …), so entries keep an open index signature.
 */
export interface ApiSiteMatrixResult {
  /** Total number of wikis in the matrix. */
  count?: number;

  /** Special (non-language-split) wikis; only with `smtype=special` (default). */
  specials?: ApiSiteMatrixSpecial[];

  /** Language entries keyed by numeric string. */
  [lang: string]: ApiSiteMatrixLanguage | ApiSiteMatrixSpecial[] | number | undefined;
}

/** Response of `action=sitematrix`. */
export interface ApiSiteMatrixResponse extends ApiEnvelope {
  /** Result of `action=sitematrix`. */
  sitematrix: ApiSiteMatrixResult;
}

declare module "types-mediawiki-response" {
  interface ApiSiteGeneral {
    /**
     * This wiki is closed for editing in the farm; present as an empty string
     * only when in that state. Contrast with the same-named real-boolean field
     * of {@link ApiSiteMatrixSpecial}.
     */
    closed?: "";

    /** This wiki is a special (non-language-split) site; present as an empty string only when in that state. */
    special?: "";

    /** This wiki is private (restricted read access); present as an empty string only when in that state. */
    private?: "";

    /** This wiki is fishbowl (public read, restricted write); present as an empty string only when in that state. */
    fishbowl?: "";

    /** This wiki is excluded from SUL (single sign-on); present as an empty string only when in that state. */
    nonglobal?: "";
  }
}
