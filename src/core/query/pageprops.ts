/**
 * `prop=pageprops` — page properties set by wikitext magic words, parser
 * functions or extensions (e.g. `wikibase_item`, `displaytitle`, `defaultsort`),
 * merged into {@link ApiPage} as a flat map.
 *
 * Values are strings; boolean-ish properties (e.g. `notoc`, `forceuncategorized`)
 * serialize as the empty string `""`. A page that has none of the requested
 * properties is returned without the `pageprops` key at all.
 *
 * @see https://www.mediawiki.org/wiki/API:Pageprops
 */

/** The set of known property values is open-ended and site/extension-specific. */
export type ApiPageProps = Record<string, string>;

declare module "./index" {
  interface ApiPage {
    /** Page properties (`prop=pageprops`), keyed by property name. */
    pageprops?: ApiPageProps;
  }
}
