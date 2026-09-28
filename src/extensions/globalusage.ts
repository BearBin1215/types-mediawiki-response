/**
 * Opt-in extension pack: **GlobalUsage** (`prop=globalusage`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/globalusage';
 * ```
 *
 * @see https://www.mediawiki.org/wiki/API:Globalusage
 */

/** One global-usage record. `guprop` is `namespace|pageid|url`. */
export interface ApiGlobalUsage {
  /** Title of the using page on the remote wiki (underscores, not spaces). */
  title: string;

  /** Domain of the wiki using the file, e.g. `www.mediawiki.org`. */
  wiki: string;

  /**
   * Namespace index of the using page. `guprop=namespace`. Note: serialized as
   * a **string** here (unlike the numeric `ns` elsewhere), like `pageid`.
   */
  ns?: string;

  /** Full URL of the using page. `guprop=url`. */
  url?: string;

  /**
   * Page id on the remote wiki. `guprop=pageid`. Note: serialized as a
   * **string** here (unlike the numeric `pageid` elsewhere).
   */
  pageid?: string;
}

declare module "types-mediawiki-response" {
  interface ApiPage {
    /** Wikis using this image, one entry per using page (`prop=globalusage`). */
    globalusage?: ApiGlobalUsage[];
  }
}
