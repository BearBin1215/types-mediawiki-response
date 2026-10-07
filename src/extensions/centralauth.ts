/**
 * Opt-in extension pack: **CentralAuth** (`list=globalallusers`,
 * `list=globalgroups`, `list=globalusers`, `list=wikisets`,
 * `action=centralauthtoken`, `action=globaluserrights`,
 * `action=setglobalaccountstatus`, `action=deleteglobalaccount`,
 * `action=createlocalaccount`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/centralauth';
 * ```
 *
 * fv2 notes: `list=globalallusers` ids are real numbers, while `list=wikisets`
 * carries the database id **as a string up to MediaWiki 1.45 and as a number
 * from 1.46** (its `WikiSet::newFromRow` picked up an `intval()` cast). When a
 * write action's operation fails — `createlocalaccount`, or the unmerge /
 * lock-hide step of `deleteglobalaccount` / `setglobalaccountstatus` — the
 * messages are reported **in band** under the root `error` key as a nested list
 * of {@link ApiSpecMessage} rows rather than as a standard `ApiErrorResponse`;
 * `setglobalaccountstatus` still returns its (unchanged) result object alongside
 * that `error` key. Input validation failures (e.g. an unknown global account)
 * are ordinary top-level errors.
 *
 * @see https://www.mediawiki.org/wiki/Extension:CentralAuth
 */
import type { ApiSpecMessage } from "../common";
import type { Expiry, Timestamp } from "../common";
import type { ApiEnvelope } from "../envelope";

/**
 * One `list=globalallusers` entry. `aguprop` controls which fields beyond
 * {@link ApiGlobalCentralUser.id} / {@link ApiGlobalCentralUser.name} appear.
 * Hidden accounts (suppressed from public lists) never appear here at all.
 */
export interface ApiGlobalCentralUser {
  /** Global account id. */
  id: number;

  /** Global account name. */
  name: string;

  /**
   * Global groups of the account, `[]` when it is in none. `aguprop=groups`.
   * Expired group memberships are not included.
   */
  groups?: string[];

  /**
   * The account is attached to (has a local account on) the requesting wiki;
   * an empty-string marker (stays `""` under fv2 rather than becoming `true`).
   * `aguprop=existslocally`.
   */
  existslocally?: "";

  /**
   * The account is locked globally; an empty-string marker (see
   * {@link ApiGlobalCentralUser.existslocally}). `aguprop=lockinfo`.
   */
  locked?: "";
}

/**
 * One `list=globalgroups` entry: a global group defined on the wiki farm. The
 * rows derive from the `global_group_permissions` table, so groups are only
 * listed once they have at least one permission granted.
 */
export interface ApiGlobalGroup {
  /** Global group name, e.g. `global-sysop` (site-configured, not fixed). */
  name: string;

  /** Permissions granted to the group. `ggpprop=rights`. */
  rights?: string[];
}

/**
 * One `list=wikisets` entry: a named wiki set (a list of wikis used for global
 * group restrictions). The key set is farm-configured.
 */
export interface ApiWikiSet {
  /**
   * Wiki set id. A string up to MediaWiki 1.45 (fv2 passes the raw `ws_id`
   * column through), a number from 1.46 once the value is cast to int.
   */
  id: string | number;

  /** Wiki set name. */
  name: string;

  /** Whether the set lists included (`optin`) or excluded (`optout`) wikis. */
  type?: "optin" | "optout";

  /**
   * Wikis the set covers (for `optin`) or does not cover (for `optout`), `[]`
   * when none. Present whenever `wsprop` includes it.
   */
  wikisincluded?: string[];

  /**
   * The complement of {@link ApiWikiSet.wikisincluded} against all known wikis,
   * `[]` when none. Present whenever `wsprop` includes it.
   */
  wikisnotincluded?: string[];
}

/**
 * Result of `action=globaluserrights` (userrights-token POST): global group
 * memberships changed for one global account. Mirrors the core
 * `action=userrights` result shape.
 */
export interface ApiGlobalUserRightsResult {
  /** The affected global account name. */
  user: string;

  /** Global account id. */
  userid: number;

  /** Groups added by this call (empty when only removing). */
  added: string[];

  /** Groups removed by this call (empty when only adding). */
  removed: string[];
}

/** Response of `action=globaluserrights`. Failures are standard top-level errors. */
export interface ApiGlobalUserRightsResponse extends ApiEnvelope {
  /** Result of `action=globaluserrights`. */
  globaluserrights: ApiGlobalUserRightsResult;
}

/**
 * The lock / hide state of a global account, written by
 * `action=setglobalaccountstatus` on every outcome. The success response
 * extends it with {@link ApiSetGlobalAccountStatusResult.reason}; a failed call
 * reports only this state, alongside the in-band root `error` list.
 */
export interface ApiSetGlobalAccountStatusState {
  /** The affected global account name. */
  user: string;

  /** Whether the account is locked after the call. */
  locked: boolean;

  /**
   * Suppression level after the call: visible (`""`), hidden from lists, or
   * fully suppressed.
   */
  hidden: "" | "lists" | "suppressed";
}

/**
 * Result object of `action=setglobalaccountstatus` (its own token type POST):
 * the new lock / hide state of a global account plus the reason echoed back.
 */
export interface ApiSetGlobalAccountStatusResult extends ApiSetGlobalAccountStatusState {
  /** The reason passed to the call; `null` when none was given. */
  reason: string | null;
}

/**
 * Successful response of `action=setglobalaccountstatus`. A failed lock/hide
 * returns the unchanged state (without `reason`) plus an in-band root `error`
 * — see {@link ApiSetGlobalAccountStatusFailedResponse}.
 */
export interface ApiSetGlobalAccountStatusResponse extends ApiEnvelope {
  /** Result of `action=setglobalaccountstatus`. */
  setglobalaccountstatus: ApiSetGlobalAccountStatusResult;
}

/**
 * In-band failure of `action=setglobalaccountstatus`: the unchanged state object
 * is returned without `reason`, alongside the root `error` list as a nested
 * {@link ApiSpecMessage} list rather than a standard `ApiErrorResponse`. Use
 * `ApiResponseWith` to model either outcome.
 */
export interface ApiSetGlobalAccountStatusFailedResponse extends ApiEnvelope {
  /** The unchanged lock / hide state after the failed call. */
  setglobalaccountstatus: ApiSetGlobalAccountStatusState;

  /** In-band failure messages. */
  error: ApiSpecMessage[][];
}

/**
 * Result of `action=deleteglobalaccount` (its own token type POST): the global
 * account was unmerged (deleted).
 */
export interface ApiDeleteGlobalAccountResult {
  /** The deleted global account name. */
  user: string;

  /** The reason passed to the call; `null` when none was given. */
  reason: string | null;
}

/** Response of `action=deleteglobalaccount`. */
export interface ApiDeleteGlobalAccountResponse extends ApiEnvelope {
  /** Result of `action=deleteglobalaccount`. */
  deleteglobalaccount: ApiDeleteGlobalAccountResult;
}

/**
 * Result of `action=createlocalaccount` (CSRF-token POST, `centralauth-createlocal`
 * right): a local account was force-created on this wiki for the global account.
 *
 * @since MediaWiki 1.36
 */
export interface ApiCreateLocalAccountResult {
  /** The user name a local account was created for. */
  username: string;

  /** The reason passed to the call; `null` when none was given. */
  reason: string | null;
}

/**
 * Response of `action=createlocalaccount`. Unlike `setglobalaccountstatus`, a
 * failure returns only the root `error` list and no result object.
 *
 * @since MediaWiki 1.36
 */
export interface ApiCreateLocalAccountResponse extends ApiEnvelope {
  /** Result of `action=createlocalaccount`. */
  createlocalaccount: ApiCreateLocalAccountResult;
}

/**
 * Response of `action=centralauthtoken`: a token that authenticates the
 * current CentralAuth session on another wiki of the farm (sent as the
 * `centralauthtoken` parameter there). Requires a logged-in user attached to
 * a global account whose session comes from the CentralAuth session provider;
 * every other case is a standard top-level error (`notloggedin`, `badsession`,
 * `notattached`).
 */
export interface ApiCentralAuthTokenResponse extends ApiEnvelope {
  centralauthtoken: {
    /** The cross-wiki authentication token. */
    centralauthtoken: string;
  };
}

/**
 * In-band failure of `action=deleteglobalaccount` / `action=createlocalaccount`:
 * the messages appear under the root `error` key as a list of per-status
 * lists — not as a standard {@link ApiErrorResponse} — so `error` carries no
 * `code`/`info` of its own.
 */
export interface ApiCentralAuthInBandErrorResponse extends ApiEnvelope {
  error: ApiSpecMessage[][];
}

/**
 * One `list=globalusers` entry for an existing global account. `gusprop`
 * controls which fields beyond {@link ApiGlobalUserFound.centralid} /
 * {@link ApiGlobalUserFound.name} appear. Results come back in request order;
 * unknown names/ids get marker rows (see {@link ApiGlobalUserRow}).
 */
export interface ApiGlobalUserFound {
  /** Global account id. */
  centralid: number;

  /** Global account name. */
  name: string;

  /**
   * The account is hidden from public lists; a real `true`. Only observable to
   * requesters with the `centralauth-suppress` right — for everyone else the
   * row is replaced by a `missing` marker.
   */
  hidden?: true;

  /**
   * The account is fully suppressed; a real `true`. Same visibility rule as
   * {@link ApiGlobalUserFound.hidden}.
   */
  suppressed?: true;

  /** Whether the account is locked globally. `gusprop=locked`. */
  locked?: boolean;

  /**
   * Log id of the most recent lock on the account (for a follow-up
   * `list=logevents` on the central wiki); present only when locked.
   */
  locklogid?: number;

  /** Global edit count. `gusprop=editcount`. */
  editcount?: number;

  /** When the global account was created. `gusprop=registration`. */
  registration?: Timestamp;

  /**
   * Attachment status on the requesting wiki. `gusprop=localinfo`;
   * {@link ApiGlobalUserLocalInfo.localid} /
   * {@link ApiGlobalUserLocalInfo.timestamp} are only present when attached.
   */
  localinfo?: ApiGlobalUserLocalInfo;

  /** Global groups of the account (active ones only). `gusprop=groups`. */
  groups?: string[];

  /**
   * Global group memberships with expiry. `gusprop=groupmemberships`.
   */
  groupmemberships?: ApiGlobalGroupMembership[];

  /** Permissions derived from the account's global groups. `gusprop=rights`. */
  rights?: string[];
}

/** The `localinfo` object of a `list=globalusers` row. */
export interface ApiGlobalUserLocalInfo {
  /** The account has a local account on the requesting wiki. */
  attached: boolean;

  /** Local user id; `null` when recorded without one. Only when attached. */
  localid?: number | null;

  /** When the local account was attached. Only when attached. */
  timestamp?: Timestamp | null;
}

/** One global group membership of a `list=globalusers` row. */
export interface ApiGlobalGroupMembership {
  /** Global group name. */
  group: string;

  /** Membership expiry, or `infinity`. */
  expiry: Expiry;
}

/** A `list=globalusers` row for a requested name with no global account. */
export interface ApiGlobalUserMissingName {
  /** The requested name, echoed back. */
  name: string;

  /** Marker: no global account under this name. */
  missing: true;
}

/** A `list=globalusers` row for a requested name that is not a valid username. */
export interface ApiGlobalUserInvalidName {
  /** The requested name, echoed back as given. */
  name: string;

  /** Marker: not a valid username. */
  invalid: true;
}

/** A `list=globalusers` row for a requested global id with no global account. */
export interface ApiGlobalUserMissingId {
  /** The requested global id, echoed back. */
  centralid: number;

  /** Marker: no global account with this id. */
  missing: true;
}

/**
 * One `list=globalusers` row: either a found account
 * ({@link ApiGlobalUserFound}) or a marker for a name/id that is unknown
 * (`missing`), syntactically invalid (`invalid`), or hidden from the requester
 * (`missing` again — hidden accounts are reported as absent).
 */
export type ApiGlobalUserRow =
  | ApiGlobalUserFound
  | ApiGlobalUserMissingName
  | ApiGlobalUserInvalidName
  | ApiGlobalUserMissingId;

declare module "types-mediawiki-response" {
  interface ApiQueryResult {
    /** All global accounts of the farm, name-ordered (`list=globalallusers`). */
    globalallusers?: ApiGlobalCentralUser[];

    /** Global groups defined on the farm (`list=globalgroups`). */
    globalgroups?: ApiGlobalGroup[];

    /** Per-name/per-id global account lookup (`list=globalusers`).
     *
     * @since MediaWiki 1.47
     */
    globalusers?: ApiGlobalUserRow[];

    /** Wiki sets defined on the farm (`list=wikisets`). */
    wikisets?: ApiWikiSet[];
  }
}
