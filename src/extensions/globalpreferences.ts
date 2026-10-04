/**
 * Opt-in extension pack: **GlobalPreferences** (`meta=globalpreferences`,
 * `action=globalpreferences`, `action=globalpreferenceoverrides`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/globalpreferences';
 * ```
 *
 * The write modules extend core `ApiOptions` (same `change`/`reset` parameter
 * style, csrf token) and reply with the string `"success"` at the module key.
 * The query module requires a logged-in user who already has at least one
 * global preference (an `apierror-globalpreferences-notglobalized` error
 * otherwise). Local overrides apply per-wiki on top of the global value.
 *
 * @see https://www.mediawiki.org/wiki/Extension:GlobalPreferences
 */
import type { ApiEnvelope } from "../envelope";

/**
 * Value of a global preference: the stored value, returned verbatim (always a
 * string).
 */
export type ApiGlobalPreferenceValue = string;

/**
 * Value of a local override: the user's option value on this wiki, passed
 * through as whatever scalar the option store holds.
 */
export type ApiGlobalPreferenceOverrideValue = string | number | boolean;

/** The `globalpreferences` object of a `meta=globalpreferences` response. */
export interface ApiGlobalPreferencesResult {
  /** Global preference values keyed by preference name; `gprprop=preferences`. */
  preferences?: Record<string, ApiGlobalPreferenceValue>;

  /**
   * Per-wiki overrides on top of the global values, keyed by preference name;
   * `gprprop=localoverrides`.
   */
  localoverrides?: Record<string, ApiGlobalPreferenceOverrideValue>;
}

/**
 * Response of `action=globalpreferences` — the module key carries the plain
 * string `"success"` (inherited from core `ApiOptions`), failures are
 * top-level error responses.
 */
export interface ApiGlobalPreferencesResponse extends ApiEnvelope {
  /** Plain status string rather than a wrapper object; `success` on success. */
  globalpreferences: "success";
}

/**
 * Response of `action=globalpreferenceoverrides` — same reply style as
 * {@link ApiGlobalPreferencesResponse} for the local-override store.
 */
export interface ApiGlobalPreferenceOverridesResponse extends ApiEnvelope {
  /** Plain status string rather than a wrapper object; `success` on success. */
  globalpreferenceoverrides: "success";
}

declare module "types-mediawiki-response" {
  interface ApiQueryResult {
    /** The user's farm-wide preferences and their per-wiki overrides (`meta=globalpreferences`). */
    globalpreferences?: ApiGlobalPreferencesResult;
  }
}
