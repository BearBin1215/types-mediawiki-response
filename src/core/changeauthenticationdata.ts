/**
 * `action=changeauthenticationdata` response — AuthManager flow that changes a
 * logged-in user's authentication data (e.g. email, password); needs a session
 * token, the `editmyprivateinfo` right, and a fully-configured secondary-provider
 * session. On success `ApiChangeAuthenticationData` emits a single field:
 * `changeauthenticationdata.status` = `success`. Any refusal or incomplete flow
 * is a top-level `ApiErrorResponse` (dieStatus / badrequest).
 *
 * @see https://www.mediawiki.org/wiki/API:Changeauthenticationdata
 */
import type { ApiEnvelope } from "../envelope";

/** Response of `action=changeauthenticationdata`. */
export interface ApiChangeAuthenticationDataResponse extends ApiEnvelope {
  /** Result of `action=changeauthenticationdata`. */
  changeauthenticationdata: {
    /** Flow outcome; `success` when the change was applied. */
    status: "success";
  };
}
