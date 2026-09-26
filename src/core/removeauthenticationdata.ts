/**
 * `action=removeauthenticationdata` response — AuthManager flow that removes a
 * piece of a logged-in user's authentication data (e.g. detaching an email
 * address); needs a session token and the corresponding rights. On success
 * `ApiRemoveAuthenticationData` emits a single field:
 * `removeauthenticationdata.status` = `success`. An unusable removal request is
 * a top-level {@link ApiErrorResponse} (badrequest).
 *
 * @see https://www.mediawiki.org/wiki/API:Removeauthenticationdata
 */
import type { SuccessStatus } from "../common";
import type { ApiEnvelope } from "../envelope";

/** Response of `action=removeauthenticationdata`. */
export interface ApiRemoveAuthenticationDataResponse extends ApiEnvelope {
  /** Result of `action=removeauthenticationdata`. */
  removeauthenticationdata: {
    /** Flow outcome; `success` when the data was removed. */
    status: SuccessStatus;
  };
}
