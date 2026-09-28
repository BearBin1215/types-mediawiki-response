/**
 * Opt-in extension pack: **Babel** (`meta=babel`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/babel';
 * ```
 *
 * `ApiQueryBabel` (prefix `bab`, requiring `babuser`) returns a **flat map** of
 * language code to Babel level (`"babel": { "en": "1", "de": "2", … }`) — one
 * entry per language, no further grouping. The keys are site-configured Babel
 * codes, so the object is open-ended; a user with no Babel entry yields an
 * empty object (the module forces an associative type, so an empty result
 * stays `{}` rather than `[]`).
 *
 * @see https://www.mediawiki.org/wiki/Extension:Babel
 */

/**
 * A `meta=babel` result: language code → Babel level string (e.g. `"N"`, `"1"`…
 * `"5"`). Site-configured, so the key set is open. An unknown user is an
 * {@link ApiErrorResponse}, not this type.
 */
export type ApiBabelResult = Record<string, string>;

declare module "types-mediawiki-response" {
  interface ApiQueryResult {
    /** Babel levels of the user named in `babuser` (`meta=babel`). */
    babel?: ApiBabelResult;
  }
}
