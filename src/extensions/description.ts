/**
 * Opt-in extension pack: **Wikibase Client** (`prop=description`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/description';
 * ```
 *
 * @see https://www.mediawiki.org/wiki/Extension:Wikibase_Client
 */

/** Where the description came from. Open union for forward compatibility. */
export type DescriptionSource = "local" | "central" | (string & {});

declare module "types-mediawiki-response" {
  interface ApiPage {
    /** Short description of the page, in the wiki's content language (`prop=description`). */
    description?: string;

    /** Which source supplied the {@link description}: `local` or an upstream repo. */
    descriptionsource?: DescriptionSource;
  }
}
