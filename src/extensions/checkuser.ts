/**
 * Opt-in extension pack: **CheckUser** (`list=checkuser`, `list=checkuserlog`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/checkuser';
 * ```
 *
 * `list=checkuser` requires `mustBePosted()` and a csrf token (`cutoken`) plus
 * the `checkuser` right; `list=checkuserlog` is a plain GET needing only the
 * `checkuser-log` right. Every successful `list=checkuser` lookup is itself
 * logged to cu_log (reason prefixed `API: ` for API requests), which is what
 * populates `list=checkuserlog`.
 *
 * From MediaWiki 1.45 `list=checkuser` is switched off by default: unless the
 * wiki sets `$wgCheckUserDisableCheckUserAPI = false`, every request fails with
 * `disabled`. `list=checkuserlog` is unaffected.
 *
 * fv2 notes: values that were never recorded come back as `null` rather than
 * being omitted — `agent`, and `ip` / `user` on rows that carry neither an actor
 * nor an IP address.
 * Continuation for `checkuserlog` uses `culcontinue` (covered by the core
 * `ApiQueryContinue` index signature); `list=checkuser` does not paginate.
 *
 * @see https://www.mediawiki.org/wiki/Extension:CheckUser
 */
import type { NamespaceIndex, Timestamp } from "../common";

/** One IP row of `curequest=userips`: an IP the target user edited from. */
export interface ApiCheckUserIpRow {
  /** Last edit from this IP. */
  end: Timestamp;

  /** Number of edits made from this IP within the requested time frame. */
  editcount: number;

  /**
   * First edit from this IP; only present once the IP has more than one edit.
   */
  start?: Timestamp;

  /**
   * The IP address; `""` for a row recorded without one.
   */
  address: string;
}

/** One action row of `curequest=actions` (deprecated alias `edits`). */
export interface ApiCheckUserActionRow {
  /** When the action happened. */
  timestamp: Timestamp;

  /** Namespace of the affected page. */
  ns: NamespaceIndex;

  /**
   * Title (DB key form with underscores) of the affected page; a user page
   * whose name is hidden comes back as a `rev-deleted-user` placeholder.
   */
  title: string;

  /**
   * Performing user name; IP for anonymous actions, or a `rev-deleted-user`
   * placeholder. `null` on rows recorded with neither an actor nor an IP.
   */
  user: string | null;

  /** IP address the action was made from; `null` when none was recorded. */
  ip: string | null;

  /**
   * User-Agent string of the request, or `null` (not omitted under fv2) when
   * none was recorded.
   */
  agent: string | null;

  /** Edit summary / log action text, when there is one. */
  summary?: string;

  /** `m` for minor edits; the key is absent otherwise. */
  minor?: "m";

  /**
   * X-Forwarded-For chain of the request, when one was recorded. Reported
   * independently of `cuxff`, which only decides what the lookup matches on.
   */
  xff?: string;
}

/** One user row of `curequest=ipusers`: an account that edited from the target IP. */
export interface ApiCheckUserIpUserRow {
  /** Last edit by this user from the target IP. */
  end: Timestamp;

  /** Number of edits by this user from the target IP within the time frame. */
  editcount: number;

  /**
   * Distinct IPs the user edited from — one for a single-IP target, but several
   * when the target is a CIDR range or `cuxff` was passed (rows are then
   * matched on XFF while the reported address stays the recorded IP). An entry
   * is `null` when its row was recorded without an IP.
   */
  ips: (string | null)[];

  /** Distinct User-Agent strings seen, entries may be `null` when unrecorded. */
  agents: (string | null)[];

  /**
   * First edit by this user from the target IP; only present once the user has
   * more than one edit.
   */
  start?: Timestamp;

  /**
   * User name, or a `rev-deleted-user` placeholder when suppressed; `""` for
   * rows recorded with neither an actor nor an IP.
   */
  name: string;
}

/** The `checkuser` object: shaped by `curequest`, one key per request mode. */
export interface ApiQueryCheckUserResult {
  /** `curequest=userips`: IPs a user edited from. */
  userips?: ApiCheckUserIpRow[];

  /**
   * `curequest=actions`, and its deprecated alias `curequest=edits` (which
   * only draws a deprecation warning): individual actions by a user / IP.
   *
   * @since MediaWiki 1.42 for the `actions` spelling; earlier releases accept
   * only `edits`.
   */
  edits?: ApiCheckUserActionRow[];

  /** `curequest=ipusers`: users who edited from an IP or range. */
  ipusers?: ApiCheckUserIpUserRow[];
}

/** One entry of `list=checkuserlog`. */
export interface ApiCheckUserLogEntry {
  /** When the check was performed. */
  timestamp: Timestamp;

  /** The checkuser who ran the lookup. */
  checkuser: string;

  /**
   * Lookup type, e.g. `userips`, `useredits`, `ipusers`, `ipedits`,
   * `ipedits-xff`, `ipusers-xff`, `investigate`.
   */
  type: string;

  /** Check reason, prefixed `API: ` for lookups made through the API. */
  reason: string;

  /** Looked-up target (user name or IP). */
  target: string;
}

/** The `checkuserlog` object of a `list=checkuserlog` response. */
export interface ApiQueryCheckUserLogResult {
  /** Log entries, ordered per `culdir` (default newest first). */
  entries?: ApiCheckUserLogEntry[];
}

declare module "types-mediawiki-response" {
  interface ApiQueryResult {
    /** Result of the requested `curequest` mode (`list=checkuser`). */
    checkuser?: ApiQueryCheckUserResult;

    /** Entries from the CheckUser log (`list=checkuserlog`). */
    checkuserlog?: ApiQueryCheckUserLogResult;
  }
}
