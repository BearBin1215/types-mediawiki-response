/**
 * `action=resetpassword` response — password reset via `PasswordResetter`. On a
 * completed (or queued) reset `ApiResetPassword` emits a single field:
 * `resetpassword.status` = `success`; every other outcome is a top-level
 * {@link ApiErrorResponse} (dieStatus).
 *
 * @see https://www.mediawiki.org/wiki/API:Resetpassword
 */
import type { ApiEnvelope } from "../envelope";

/** Response of `action=resetpassword`. */
export interface ApiResetPasswordResponse extends ApiEnvelope {
  /** Result of `action=resetpassword`. */
  resetpassword: {
    /** Reset outcome; `success` when the reset was performed or queued. */
    status: "success";
  };
}
