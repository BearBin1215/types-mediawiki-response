/**
 * `list=blocks` — current active blocks, merged into {@link ApiQueryResult} via
 * declaration merging. `bkprop=flags` expands each block flag into its own real
 * boolean key under `formatversion=2` (present as `false` when unset).
 *
 * @see https://www.mediawiki.org/wiki/API:Blocks
 */
import type { Expiry, NamespaceIndex, Timestamp } from "../../common";

/** Restriction targets of a partial block, grouped by kind. */
export interface ApiBlockRestrictions {
  /** Restricted pages. */
  pages?: {
    /** Page id. */
    id: number;

    /** Namespace index of the restricted page. */
    ns?: NamespaceIndex;

    /** Full title of the restricted page. */
    title?: string;
  }[];

  /** Restricted namespace ids. */
  namespaces?: number[];

  /** Restricted actions; only on action-type entries. Before MediaWiki 1.45 these require `$wgEnablePartialActionBlocks`. */
  actions?: string[];
}

/** One block record. `bkprop` controls which fields appear. */
export interface ApiBlock {
  /** Block id. `bkprop=id`. */
  id?: number;

  /**
   * Blocked user name, IP address or IP range; absent for every autoblock.
   * `bkprop=user`.
   */
  user?: string;

  /**
   * Blocked user id; `0` when the target is an IP address or IP range, absent
   * for every autoblock. `bkprop=userid`.
   */
  userid?: number;

  /** Name of the admin who applied the block. `bkprop=by`. */
  by?: string;

  /** User id of the blocking admin. `bkprop=byid`. */
  byid?: number;

  /** When the block was applied. `bkprop=timestamp`. */
  timestamp?: Timestamp;

  /** When the block expires, or `infinity`. `bkprop=expiry`. */
  expiry?: Expiry;

  /**
   * Human-readable duration, e.g. `3 months`, or the localized "infinite"
   * message for a permanent block. `bkprop=expiry`.
   *
   * @since MediaWiki 1.44
   */
  "duration-l10n"?: string;

  /** Raw block reason. `bkprop=reason`. */
  reason?: string;

  /**
   * HTML-rendered block reason. `bkprop=parsedreason`; the 1.43 baseline
   * rejects that value, so it only appears on newer wikis.
   *
   * @since MediaWiki 1.44
   */
  parsedreason?: string;

  /**
   * Start of the blocked IP range (hex form). `bkprop=range` on a range block;
   * before 1.43 also emitted for single-IP blocks.
   */
  rangestart?: string;

  /**
   * End of the blocked IP range (hex form). `bkprop=range` on a range block;
   * before 1.43 also emitted for single-IP blocks.
   */
  rangeend?: string;

  /**
   * Restriction targets of a partial block, grouped by kind; `[]` for a sitewide
   * block. `bkprop=restrictions`.
   */
  restrictions?: ApiBlockRestrictions | unknown[];

  /** Applied automatically by the autoblock feature. `bkprop=flags`. */
  automatic?: boolean;
  /** Blocks anonymous (edit-only) users. `bkprop=flags`. */
  anononly?: boolean;
  /** Prevents account creation. `bkprop=flags`. */
  nocreate?: boolean;
  /** Autoblock enabled for the offending IP. `bkprop=flags`. */
  autoblock?: boolean;
  /** Prevents sending email. `bkprop=flags`. */
  noemail?: boolean;
  /** Block is hidden from the block log. `bkprop=flags`. */
  hidden?: boolean;
  /**
   * Suppression visibility of the block. `bkprop=flags`. Written as a separate
   * key alongside {@link hidden}, with the same value (the block is oversighted).
   *
   * @since MediaWiki 1.46
   */
  "block-hidden"?: boolean;
  /** Blocked user may still edit their own talk page. `bkprop=flags`. */
  allowusertalk?: boolean;
  /** Whether this is a partial block. `bkprop=flags`. */
  partial?: boolean;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Active blocks (`list=blocks`). */
    blocks?: ApiBlock[];
  }
}
