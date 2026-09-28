/**
 * Opt-in extension pack: **GlobalBlocking** (`list=globalblocks`,
 * `action=globalblock`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/globalblocks';
 * ```
 *
 * fv2 notes: `id` is a **string** (like `globalusage.pageid`); from
 * MediaWiki 1.43 the block flags are real booleans present as `false`, while
 * earlier versions emit a flag only when the option applies. Continuation uses
 * `bgstart` (covered by the core `ApiQueryContinue` index signature).
 *
 * @see https://www.mediawiki.org/wiki/API:Globalblocks
 */
import type { BlockExpiry, Expiry, Flag, Timestamp } from "../common";
import type { ApiEnvelope } from "../envelope";

/**
 * One global block record. `bgprop` controls which fields appear. From
 * MediaWiki 1.43 the flag booleans below are real booleans (`false` included),
 * emitted together with `bgprop=target` (also for the deprecated
 * `bgprop=address`); earlier versions emit a flag only when the option
 * applies, regardless of `bgprop`.
 */
export interface ApiGlobalBlock {
  /** Block id (a string under fv2). `bgprop=id`. */
  id?: string;

  /**
   * Blocked user name / IP or range. `bgprop=address` — the deprecated
   * spelling of `bgprop=target`.
   */
  address?: string;

  /**
   * Blocked user name / IP or range. `bgprop=target`; absent for autoblocks,
   * which hide their target.
   */
  target?: string;

  /** Name of the global blocker. `bgprop=by`. */
  by?: string;

  /** Wiki the blocking user acted from, e.g. `mediawikiwiki`. `bgprop=by`. */
  bywiki?: string;

  /** When the block was applied. `bgprop=timestamp`. */
  timestamp?: Timestamp;

  /** When the block expires, or `infinity`. `bgprop=expiry`. */
  expiry?: Expiry;

  /** Block reason. `bgprop=reason`. */
  reason?: string;

  /**
   * Start of the blocked IP range. `bgprop=range`; absent for autoblocks,
   * which hide their target.
   */
  rangestart?: string;

  /**
   * End of the blocked IP range. `bgprop=range`; absent for autoblocks,
   * which hide their target.
   */
  rangeend?: string;

  /** Whether the block affects only anonymous users. A real `boolean`. */
  anononly?: boolean;

  /**
   * Whether account creation is disabled by the block. A real `boolean`.
   *
   * @since MediaWiki 1.43
   */
  "account-creation-disabled"?: boolean;

  /**
   * Whether the block forbids sending email. A real `boolean`.
   *
   * @since MediaWiki 1.46
   */
  "block-email"?: boolean;

  /**
   * Whether autoblocking is enabled for the block. A real `boolean`.
   *
   * @since MediaWiki 1.43
   */
  "autoblocking-enabled"?: boolean;

  /**
   * Whether this is an automatic (autoblock) block. A real `boolean`.
   *
   * @since MediaWiki 1.43
   */
  automatic?: boolean;
}

/**
 * Result object of `action=globalblock`. Which fields appear depends on the
 * branch: blocking emits {@link ApiGlobalBlockResult.blocked} plus the applied
 * options and {@link ApiGlobalBlockResult.expiry}; unblocking emits
 * {@link ApiGlobalBlockResult.unblocked}.
 */
export interface ApiGlobalBlockResult {
  /** The blocked or unblocked user name, IP or range. */
  user?: string;

  /** The block was applied; an empty-string marker. */
  blocked?: "";

  /** The block was removed; an empty-string marker. */
  unblocked?: "";

  /** Only anonymous users are affected; an empty-string marker. */
  anononly?: "";

  /** Account creation is disabled by the block; an empty-string marker. */
  "allow-account-creation"?: "";

  /** Autoblocking is enabled for the block; an empty-string marker. */
  "enable-autoblock"?: "";

  /** The target is also blocked locally on this wiki. A {@link Flag}. */
  blockedlocally?: Flag;

  /** Block expiry, or `infinite`. */
  expiry?: BlockExpiry;
}

/** Response of `action=globalblock`. */
export interface ApiGlobalBlockResponse extends ApiEnvelope {
  /** Result of `action=globalblock`. */
  globalblock: ApiGlobalBlockResult;
}

declare module "types-mediawiki-response" {
  interface ApiQueryResult {
    /** Farm-wide blocks of IPs, ranges or usernames (`list=globalblocks`). */
    globalblocks?: ApiGlobalBlock[];
  }
}
