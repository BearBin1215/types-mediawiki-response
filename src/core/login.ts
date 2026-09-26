/**
 * `action=login` response — the legacy main-account login. **Deprecated** in
 * favour of `action=clientlogin`; core emits a `login` deprecation warning
 * (an {@link ApiEnvelope} `warnings` fact) alongside the result. Modeled anyway
 * because clients still call it.
 *
 * `ApiLogin` emits `result` (`Success`/`Failed`/`NeedToken`/`WrongToken`/
 * `Aborted`) plus, on success, `lguserid`/`lgusername`; `token` and `reason`
 * appear on the respective paths. Throttled logins are not a separate result —
 * they surface as `Failed` with a `login-throttled` reason. The response
 * carries no `cookieprefix`/`sessionid`.
 *
 * @see https://www.mediawiki.org/wiki/API:Login
 */
import type { ApiEnvelope } from "../envelope";

/** Response of the deprecated `action=login`. */
export interface ApiLoginResponse extends ApiEnvelope {
  /** Result of `action=login`. */
  login: {
    /** Login outcome. */
    result: "Success" | "Failed" | "NeedToken" | "WrongToken" | "Aborted" | (string & {});

    /** Human-readable reason, emitted when `result` is `Failed` or `Aborted`. */
    reason?: string;

    /** Login token echoed back on a `NeedToken` round trip. */
    token?: string;

    /** User id of the logged-in account (legacy `lguserid` spelling). */
    lguserid?: number;

    /** User name of the logged-in account (legacy `lgusername` spelling). */
    lgusername?: string;
  };
}
