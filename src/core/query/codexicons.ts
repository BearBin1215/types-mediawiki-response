/**
 * `list=codexicons` — fetch Codex icon definitions by name, merged into
 * {@link ApiQueryResult}.
 *
 * @see https://www.mediawiki.org/wiki/API:CodexIcons
 * @since MediaWiki 1.44
 */

/**
 * Directionality/language-aware icon definition (object form of
 * {@link ApiCodexIcon}).
 */
export interface ApiCodexIconDefinition {
  /** SVG markup used when no direction-specific variant applies. */
  default?: string;

  /** SVG markup for left-to-right contexts. */
  ltr?: string;

  /** SVG markup for right-to-left contexts. */
  rtl?: string;

  /** Whether the icon should be flipped in right-to-left contexts. */
  shouldFlip?: boolean;

  /** Languages excluded from flipping, e.g. `["he", "yi"]`. */
  shouldFlipExceptions?: string[];

  /** Language-specific SVG markup, keyed by language code. */
  langCodeMap?: Record<string, string>;
}

/** A Codex icon: raw SVG markup, or a directionality/language-aware definition. */
export type ApiCodexIcon = string | ApiCodexIconDefinition;

declare module "./index" {
  interface ApiQueryResult {
    /**
     * Codex icon definitions, keyed by icon name (e.g. `cdxIconInfo`).
     * `list=codexicons&names=…` (`names` is required). Simple icons are raw
     * SVG markup strings; directionality/language-aware icons are definition
     * objects.
     *
     * @since MediaWiki 1.44
     */
    codexicons?: Record<string, ApiCodexIcon> | unknown[];
  }
}
