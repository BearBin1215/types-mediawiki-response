/**
 * `action=createaccount` response — AuthManager-driven account creation. The
 * result keys under `createaccount`: `status` drives the flow (`PASS` on
 * success, plus in-band `FAIL`/`UI`/`RESTART`/`REDIRECT`), and failures carry
 * `message`/`messagecode`.
 *
 * These are **in-band** AuthManager outcomes, not a top-level
 * {@link ApiErrorResponse}. `username` appears on `PASS`; `UI`/`RESTART`/
 * `REDIRECT` outcomes add the `requests` descriptors; `canpreservestate` marks
 * whether state can be kept.
 *
 * @see https://www.mediawiki.org/wiki/API:Createaccount
 */
import type {
  ApiAuthManagerMessage,
  ApiAuthManagerStatus,
  ApiQueryAuthManagerInfoRequest,
} from "./query/authmanagerinfo";
import type { ApiEnvelope } from "../envelope";

/** Response of `action=createaccount`. */
export interface ApiCreateAccountResponse extends ApiEnvelope {
  /** Result of `action=createaccount`. */
  createaccount: {
    /** AuthManager outcome of the account-creation flow. */
    status?: ApiAuthManagerStatus;

    /** Created (or attempted) user name; present on `PASS`. */
    username?: string;

    /**
     * Failure / interaction message, rendered per the `messageformat`
     * parameter: a string under `wikitext`/`html`, a `{ key, params }` object
     * under `raw`, absent under `none`. `FAIL`/`UI`/`RESTART` only.
     */
    message?: ApiAuthManagerMessage;

    /** Machine-readable message code (e.g. `invaliduser`). */
    messagecode?: string;

    /** Whether the current AuthManager state can be preserved across requests; `FAIL`/`RESTART` only. */
    canpreservestate?: boolean;

    /** Redirect target for a `REDIRECT` outcome. */
    redirecttarget?: string;

    /** Extra API data accompanying a `REDIRECT` outcome. */
    redirectdata?: Record<string, unknown>;

    /** AuthManager request descriptors for interactive (`UI`/`RESTART`) and `REDIRECT` steps. */
    requests?: ApiQueryAuthManagerInfoRequest[];
  };
}
