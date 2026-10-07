/**
 * Opt-in extension pack: **BetaFeatures** (`list=betafeatures`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/betafeatures';
 * ```
 *
 * The result is a flat map keyed by feature id — one entry per feature
 * registered through `$wgBetaFeatures` or the
 * `GetBetaFeaturePreferences` hook, so the key set is site-configured and open.
 * A wiki with no beta features omits the whole `betafeatures` bucket.
 *
 * @see https://www.mediawiki.org/wiki/Extension:BetaFeatures
 */

/**
 * One `list=betafeatures` entry: a feature id with its user count.
 */
export interface ApiBetaFeature {
  /** The feature id, e.g. `mw-vector-2022-default-title`. */
  name: string;

  /**
   * Number of users who enabled the feature; `0` unless `bfcounts` was
   * requested.
   */
  count: number;
}

declare module "types-mediawiki-response" {
  interface ApiQueryResult {
    /**
     * Beta features registered on this wiki, keyed by feature id
     * (`list=betafeatures`). Absent when no features are registered.
     */
    betafeatures?: Record<string, ApiBetaFeature>;
  }
}
