/**
 * `action=logout` response — logs the current session out; needs CSRF. 1.43's
 * `ApiLogout` calls `addValue` on **no** key: a successful logout returns an
 * empty body (only the response {@link ApiEnvelope} remains). Logging out an
 * anonymous session adds a `notloggedin` warning to the envelope.
 *
 * @see https://www.mediawiki.org/wiki/API:Logout
 */
import type { ApiEnvelope } from "../envelope";

/**
 * Response of `action=logout`. No payload keys are emitted on success; the type
 * exists so the shape is explicit (the `logout.status` object older builds
 * returned is gone in 1.43).
 */
export interface ApiLogoutResponse extends ApiEnvelope {}
