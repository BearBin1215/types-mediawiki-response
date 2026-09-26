/**
 * `list=users` — information about one or more users, merged into
 * {@link ApiQueryResult} via declaration merging.
 *
 * @see https://www.mediawiki.org/wiki/API:Users
 */
import type { ApiSpecMessage, BlockExpiry, Expiry, Flag, Timestamp } from "../../common";

/**
 * Block details, as emitted for `usprop=blockinfo` (list=users) and
 * `uiprop=blockinfo` (meta=userinfo). Only present when the user is blocked.
 * The same shape is shared by {@link ApiUser.blockcomponents} entries.
 */
export interface ApiBlockInfo {
  /** ID of the block. */
  blockid?: number;

  /** User name of the blocker; `''` when unknown (e.g. autoblocks). */
  blockedby?: string;

  /** User id of the blocker; `0` when unknown. */
  blockedbyid?: number;

  /** Block reason, in plain text. */
  blockreason?: string;

  /** When the block was placed or last modified. */
  blockedtimestamp?: Timestamp;

  /**
   * `blockedtimestamp` localized for the requesting user.
   */
  blockedtimestampformatted?: string;

  /** Block expiry; the literal `infinite` when the block does not expire. */
  blockexpiry?: BlockExpiry;

  /** `blockexpiry` localized for the requesting user; only when the block expires. */
  blockexpiryformatted?: string;

  /** Human-readable time to expiry (e.g. `in 5 days`); only when the block expires. */
  blockexpiryrelative?: string;

  /** Whether the block only applies to certain pages, namespaces and/or actions. A real `boolean`. */
  blockpartial?: boolean;

  /** Whether the block prevents account creation. A real `boolean`. */
  blocknocreate?: boolean;

  /** Whether the block only affects anonymous users (soft block). A real `boolean`. */
  blockanononly?: boolean;

  /**
   * Whether the block prevents sending email. A real `boolean`.
   *
   * @since MediaWiki 1.41
   */
  blockemail?: boolean;

  /**
   * Whether editing one's own talk page is prevented. A real `boolean`.
   *
   * @since MediaWiki 1.41
   */
  blockowntalk?: boolean;

  /** Type of the automatically applied system block; only for system blocks. */
  systemblocktype?: string;

  /**
   * The individual blocks composing this one; only for composite blocks.
   *
   * @since MediaWiki 1.42
   */
  blockcomponents?: ApiBlockInfo[];

  /**
   * Whether the block also enables the autoblock feature. A real `boolean`.
   *
   * @since MediaWiki 1.46
   */
  blockautoblocking?: boolean;

  /**
   * The block itself is suppressed (hidden from users without the `hideuser`
   * right). A {@link Flag}, present only when suppressed.
   *
   * @since MediaWiki 1.47
   */
  blockhidden?: Flag;
}

/**
 * A single group membership with grant metadata. `usprop=groupmemberships`
 * (vs. the plain name list from `usprop=groups`).
 */
export interface ApiUserGroupMembership {
  /** Group key, e.g. `sysop`. */
  group?: string;

  /** When the membership expires: a timestamp, or `infinity` when permanent. */
  expiry?: Expiry;
}

/**
 * Fields present on both the `list=users` ({@link ApiUser}) and `meta=userinfo`
 * user records; each is gated by the same `usprop`/`uiprop` value in both
 * modules.
 */
export interface ApiUserCore extends ApiBlockInfo {
  /** Total edit count. `usprop=editcount` / `uiprop=editcount`. */
  editcount?: number;

  /** Groups the user belongs to (including implicit). `usprop=groups` / `uiprop=groups`. */
  groups?: string[];

  /** Group memberships with grant/expiry metadata. `usprop=groupmemberships` / `uiprop=groupmemberships`. */
  groupmemberships?: ApiUserGroupMembership[];

  /** Groups that apply by virtue of an inherent right, not membership. `usprop=implicitgroups` / `uiprop=implicitgroups`. */
  implicitgroups?: string[];

  /** Effective rights. `usprop=rights` / `uiprop=rights`. */
  rights?: string[];

  /** Global (CentralAuth) ids keyed by provider. `usprop=centralids` / `uiprop=centralids`. */
  centralids?: Record<string, number>;

  /** Whether the account is attached to each provider, keyed like {@link centralids}. `usprop=centralids` / `uiprop=centralids`. */
  attachedlocal?: Record<string, boolean>;
}

/** A user record. `usprop` controls which fields appear. */
export interface ApiUser extends ApiUserCore {
  /**
   * User name (normalized). Present on found entries and on `missing` entries
   * queried by name; absent from `missing` entries queried by `ususerids`.
   */
  name?: string;

  /**
   * User id. Present on found entries, and on `missing` entries queried by
   * `ususerids` (echoing the requested id); absent from name-queried `missing`
   * entries.
   */
  userid?: number;

  /** `true` when no such user exists (`missing` is a {@link Flag}). */
  missing?: Flag;

  /**
   * Registration timestamp. `null` for accounts created before registration
   * timestamps were tracked. `usprop=registration`.
   */
  registration?: Timestamp | null;

  /** User gender. `usprop=gender`. Open union for forward compatibility. */
  gender?: "unknown" | "male" | "female" | (string & {});

  /**
   * Whether the user can be emailed. `usprop=emailable`; a real `boolean`
   * (`false` when the address is hidden or unconfirmed), not a {@link Flag}.
   */
  emailable?: boolean;

  /**
   * Whether an account could be created for this name. `usprop=cancreate`; a
   * real `boolean`, present only on `missing` entries queried by name.
   */
  cancreate?: boolean;

  /**
   * Why {@link cancreate} is `false`, as message specs (e.g. a reserved
   * username). Emitted only when the creation check failed.
   */
  cancreateerror?: ApiSpecMessage[];

  /**
   * The user is hidden (suppressed via a hidden block); a {@link Flag}.
   * Emitted regardless of `usprop`.
   */
  hidden?: Flag;

  /**
   * `true` when this is a system user (e.g. `MediaWiki default`), absent
   * otherwise; not gated by any `usprop`. A {@link Flag}.
   *
   * @since MediaWiki 1.43
   */
  systemuser?: Flag;

  /**
   * Whether a temporary account has expired. `usprop=tempexpired`
   * (`auprop=tempexpired` for `list=allusers`); a real `boolean` for a
   * temporary account, and `null` for any other user.
   *
   * @since MediaWiki 1.46
   */
  tempexpired?: boolean | null;
}

declare module "./index" {
  interface ApiQueryResult {
    /** User records (`list=users`). */
    users?: ApiUser[];
  }
}
