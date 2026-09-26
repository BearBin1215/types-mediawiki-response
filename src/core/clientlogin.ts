/**
 * `action=clientlogin` response — the recommended login flow (replaces the
 * deprecated `action=login`), returning a `clientlogin` object.
 *
 * `status` drives the flow: `PASS` (logged in), `FAIL`, `UI` (needs further
 * interaction, e.g. 2FA), `RESTART` (third-party auth succeeded but no local
 * account exists yet), `REDIRECT` (continue at `redirecttarget`). Which other
 * fields appear depends on `status` and the `messageformat` parameter.
 *
 * @see https://www.mediawiki.org/wiki/API:Client_login
 */
import type {
  ApiAuthManagerMessage,
  ApiQueryAuthManagerField,
  ApiQueryAuthManagerInfoRequest,
} from "./query/authmanagerinfo";
import type { ApiEnvelope } from "../envelope";

/** The `clientlogin` object of an `action=clientlogin` response. */
export interface ApiClientLogin {
  /** Login outcome. */
  status?: "PASS" | "FAIL" | "UI" | "REDIRECT" | "RESTART" | (string & {});

  /** Authenticated user name; `PASS` only. */
  username?: string;

  /**
   * Failure / interaction message, rendered per the `messageformat` parameter:
   * a string under `wikitext`/`html`, a `{ key, params }` object under `raw`,
   * absent under `none`. `FAIL`/`UI`/`RESTART` only.
   */
  message?: ApiAuthManagerMessage;

  /** Machine-readable message code accompanying `message`; `FAIL`/`UI`/`RESTART` only. */
  messagecode?: string;

  /** URL to continue the flow at. `REDIRECT` only. */
  redirecttarget?: string;

  /**
   * Data for a `REDIRECT` response the client may use to query the remote site
   * via its API instead of following `redirecttarget`.
   */
  redirectdata?: Record<string, unknown>;

  /** AuthManager request descriptors to continue the flow; `UI`/`RESTART`/`REDIRECT` only. */
  requests?: ApiQueryAuthManagerInfoRequest[];

  /**
   * Field descriptors merged across all `requests`, present only when the
   * request passed `mergerequestfields`.
   */
  fields?: Record<string, ApiQueryAuthManagerField>;

  /** Whether the current AuthManager state can be preserved across requests; `FAIL`/`RESTART` only. */
  canpreservestate?: boolean;
}

/** Response of `action=clientlogin`. */
export interface ApiClientLoginResponse extends ApiEnvelope {
  /** Result of `action=clientlogin`. */
  clientlogin: ApiClientLogin;
}
