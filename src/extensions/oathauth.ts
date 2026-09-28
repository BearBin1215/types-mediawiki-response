/**
 * Opt-in extension pack: **OATHAuth** (two-factor authentication;
 * `meta=oath`, `action=oathvalidate`, `action=webauthn`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/oathauth';
 * ```
 *
 * `meta=oath` needs the `oathauth-api-all` grant or the `oathauth-verify-user`
 * right, and without the grant `oathreason` is required. A `oath`/`verify` log
 * entry is written whenever the caller lacks the grant or supplied a reason, and
 * only for named targets.
 * `action=oathvalidate` requires the `oathauth-api-all` grant. Both are
 * internal modules and both only report the enabled/valid booleans — never
 * secrets.
 *
 * fv2 notes: `enabled`/`valid` are real booleans; they are `false` (not omitted)
 * for users without 2FA.
 *
 * @see https://www.mediawiki.org/wiki/Extension:OATHAuth
 */
import type { Flag } from "../common";
import type { ApiEnvelope } from "../envelope";

/**
 * The `oath` object of a `meta=oath` response.
 *
 * @deprecated since MediaWiki 1.46; OATHAuth dropped the `meta=oath` module in
 * its 1.46 (WebAuthn) rewrite. The TOTP data it reported has no direct
 * replacement in the new API.
 */
export interface ApiOATHStatus {
  /**
   * Whether the queried user (defaults to the current user) has two-factor
   * authentication enabled.
   */
  enabled?: boolean;
}

/**
 * The `oathvalidate` object of an `action=oathvalidate` response.
 *
 * @deprecated since MediaWiki 1.46; OATHAuth removed the `action=oathvalidate`
 * module in its 1.46 (WebAuthn) rewrite.
 */
export interface ApiOATHValidation {
  /** Whether the target user has 2FA enabled (only then is a token verifiable). */
  enabled?: boolean;

  /** Whether the supplied TOTP or recovery code verified successfully. */
  valid?: boolean;
}

/** Response of `action=oathvalidate`. */
export interface ApiOATHValidateResponse extends ApiEnvelope {
  /** Result of `action=oathvalidate`. */
  oathvalidate: ApiOATHValidation;
}

/**
 * The `webauthn` object of an `action=webauthn` response, keyed by the `func`
 * parameter: `getauthinfo` → {@link ApiWebAuthnResult.auth_info},
 * `getregisterinfo` → {@link ApiWebAuthnResult.register_info}, `register` →
 * {@link ApiWebAuthnResult.success}.
 */
export interface ApiWebAuthnResult {
  /** WebAuthn authentication challenge as a JSON string (`func=getauthinfo`). */
  auth_info?: string;

  /** WebAuthn registration challenge as a JSON string (`func=getregisterinfo`). */
  register_info?: string;

  /** The credential was registered (`func=register`). A {@link Flag}. */
  success?: Flag;
}

/**
 * Response of `action=webauthn`, introduced by the 1.46 WebAuthn rewrite that
 * replaced `meta=oath`/`action=oathvalidate`.
 *
 * @since MediaWiki 1.46
 */
export interface ApiWebAuthnResponse extends ApiEnvelope {
  /** Result of `action=webauthn`; which field carries the payload depends on `func`. */
  webauthn?: ApiWebAuthnResult;
}

declare module "types-mediawiki-response" {
  interface ApiQueryResult {
    /**
     * Whether OATH two-factor authentication is enabled for the queried user
     * (`meta=oath`).
     *
     * @deprecated since MediaWiki 1.46; the reported TOTP status has no
     * replacement in the new API.
     */
    oath?: ApiOATHStatus;
  }
}
