/**
 * Opt-in extension pack: **PageImages** (`prop=pageimages`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/pageimages';
 * ```
 *
 * `piprop` selects which parts appear: `name` (`pageimage`), `thumbnail`,
 * `original`. `thumbnail` and `original` share the {@link ApiThumbnail} shape.
 *
 * @see https://www.mediawiki.org/wiki/Extension:PageImages
 */

/** A scaled image reference (`piprop=thumbnail`). */
export interface ApiThumbnail {
  /** Image URL. */
  source: string;

  /** Rendered width in pixels. */
  width: number;

  /** Rendered height in pixels. */
  height: number;
}

declare module "types-mediawiki-response" {
  interface ApiPage {
    /** Name of the page's representative image (`piprop=name`). */
    pageimage?: string;

    /** Representative image, scaled to `pithumbsize` (`piprop=thumbnail`). */
    thumbnail?: ApiThumbnail;

    /** Representative image at its own dimensions (`piprop=original`). */
    original?: ApiThumbnail;
  }
}
