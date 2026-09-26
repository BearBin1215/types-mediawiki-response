/**
 * `action=validatepassword` response — checks a password against the site's
 * password policy. The result keys under `validatepassword`.
 *
 * When `user` is supplied it must be a creatable (non-existent) username — an
 * existing account fails with a `userexists` error — and there is no
 * current-password comparison; `email`/`realname` merely populate the fresh
 * user object so policy checks that depend on them apply.
 *
 * `ApiValidatePassword` maps `checkPasswordValidity`'s Status to `validity`:
 * `Good` (`isGood`), `Change` (`isOK`) or `Invalid`. A non-`Good` verdict
 * carries policy messages in `validitymessages`.
 *
 * @see https://www.mediawiki.org/wiki/API:Validatepassword
 */
import type { ApiSpecMessage } from "../common";
import type { ApiEnvelope } from "../envelope";

/** Password-policy verdict mapped from `checkPasswordValidity`'s Status. Open union. */
export type ApiPasswordValidity = "Good" | "Change" | "Invalid" | (string & {});

/** Response of `action=validatepassword`. */
export interface ApiValidatePasswordResponse extends ApiEnvelope {
  /** Result of `action=validatepassword`. */
  validatepassword: {
    /** Password-policy verdict for the submitted password. */
    validity: ApiPasswordValidity;

    /** Policy messages explaining a non-`Good` verdict. */
    validitymessages?: ApiSpecMessage[];
  };
}
