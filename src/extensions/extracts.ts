/**
 * Opt-in extension pack: **TextExtracts** (`prop=extracts`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/extracts';
 * ```
 *
 * `exintro` limits to the intro, `explaintext` returns plain text (else HTML).
 *
 * @see https://www.mediawiki.org/wiki/Extension:TextExtracts
 */
import type { PlainText } from "../common";

/** A page content extract ({@link PlainText} with `explaintext`, else HTML). */
export type ApiExtract = PlainText;

declare module "types-mediawiki-response" {
  interface ApiPage {
    /** Page excerpt, limited to the intro with `exintro` (`prop=extracts`). */
    extract?: ApiExtract;
  }
}
