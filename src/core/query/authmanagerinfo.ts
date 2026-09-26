/**
 * `meta=authmanagerinfo` — introspection over the AuthManager providers for a
 * given flow (`amirequestsfor`), merged into {@link ApiQueryResult} via
 * declaration merging. Drives the `clientlogin`/`createaccount` request shapes.
 *
 * @see https://www.mediawiki.org/wiki/API:Authmanagerinfo
 */

/**
 * A message attached to an AuthManager request or field. Its shape follows the
 * request's `amimessageformat` parameter (default `wikitext`): a rendered
 * string under `wikitext`/`html`, an {@link ApiAuthManagerRawMessage} under
 * `raw`, and the key is absent under `none`.
 */
export type ApiAuthManagerMessage = string | ApiAuthManagerRawMessage;

/** A message in raw form (`amimessageformat=raw`): the i18n key plus parameters. */
export interface ApiAuthManagerRawMessage {
  /** i18n message key. */
  key?: string;

  /** i18n message parameters. */
  params?: unknown[];
}

/**
 * AuthManager / password-flow status. The uppercase values are the
 * `AuthenticationResponse` statuses that surface through the API (`PASS`/
 * `FAIL`/`UI`/`REDIRECT`/`RESTART`; the internal `ABSTAIN` never does); the
 * lowercase `success` is emitted by `ApiResetPassword` itself. Open union.
 */
export type ApiAuthManagerStatus =
  | "PASS"
  | "FAIL"
  | "UI"
  | "REDIRECT"
  | "RESTART"
  | "success"
  | (string & {});

/** One AuthManager request descriptor returned by `meta=authmanagerinfo`. */
export interface ApiQueryAuthManagerInfoRequest {
  /** Fully-qualified request class name (PHP namespace separators escaped). */
  id?: string;

  /** Arbitrary provider metadata; always an object under `formatversion=2` (possibly empty). */
  metadata?: Record<string, unknown>;

  /** How the request is required for the flow. */
  required?: "required" | "optional" | "primary-required" | (string & {});

  /** Human-readable provider name. */
  provider?: ApiAuthManagerMessage;

  /** Provider account label (often the request class name for core providers). */
  account?: ApiAuthManagerMessage;

  /** Field descriptors keyed by field name. */
  fields?: Record<string, ApiQueryAuthManagerField>;
}

/** A single field descriptor of an {@link ApiQueryAuthManagerInfoRequest}. */
export interface ApiQueryAuthManagerField {
  /** Input type (e.g. `string`, `password`, `info`). */
  type?: string;

  /** The field's current value (e.g. a username prefilled by a preserved session). */
  value?: string;

  /** Allowed values mapped to their rendered labels, for choice-like fields. */
  options?: Record<string, string>;

  /** Rendered label. */
  label?: ApiAuthManagerMessage;

  /** Help text. */
  help?: ApiAuthManagerMessage;

  /** The field may be omitted. */
  optional?: boolean;

  /** The field carries a secret (password) and is masked. */
  sensitive?: boolean;
}

/** The `authmanagerinfo` object returned under `query`. */
export interface ApiQueryAuthManagerInfo {
  /** Whether the current session can authenticate right now. */
  canauthenticatenow: boolean;

  /** Whether account creation is available. */
  cancreateaccounts: boolean;

  /** Whether account linking (CentralAuth) is available. */
  canlinkaccounts: boolean;

  /**
   * Security-sensitive operation status, present only when
   * `amisecuritysensitiveoperation` names an action.
   */
  securitysensitiveoperationstatus?: string;

  /** Whether a preserved AuthManager state exists for the session. */
  haspreservedstate?: boolean;

  /** Whether a preserved *primary* AuthManager state exists. */
  hasprimarypreservedstate?: boolean;

  /** Preserved username, or an empty string when none. */
  preservedusername?: string;

  /**
   * Field descriptors merged across all {@link requests}, present only when the
   * request passed `amimergerequestfields=1` — the per-request `fields` are
   * omitted in that mode.
   */
  fields?: Record<string, ApiQueryAuthManagerField>;

  /** Provider requests the flow needs, ordered. */
  requests?: ApiQueryAuthManagerInfoRequest[];
}

declare module "./index" {
  interface ApiQueryResult {
    /** AuthManager provider introspection requested via `meta=authmanagerinfo`. */
    authmanagerinfo?: ApiQueryAuthManagerInfo;
  }
}
