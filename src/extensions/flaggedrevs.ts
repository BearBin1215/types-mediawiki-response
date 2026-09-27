/**
 * Opt-in extension pack: **FlaggedRevs** (`prop=flagged`,
 * `list=unreviewedpages`, `list=oldreviewedpages`, `list=configuredpages`,
 * `action=review`, `action=stabilize`, `action=flagconfig`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/flaggedrevs';
 * ```
 *
 * Wikis without FlaggedRevs keep a clean `ApiPage`. FlaggedRevs also injects a
 * revision-level `flagged` object into `prop=revisions` (`rvprop=flagged`,
 * which requires `rvprop=ids`); see {@link ApiRevisionFlagged}. The `action=`
 * responses (`review`, `stabilize`, `flagconfig`) are standalone — import them
 * by name.
 *
 * The three `list=` modules take **no `*prop=`** parameter — their row shape is
 * fixed. `action=review`/`action=stabilize`/`action=flagconfig` return standalone
 * responses to import directly; `flagconfig` writes at the **root** of the
 * envelope, not under `query`.
 *
 * The review tags are configured per wiki through `$wgFlaggedRevsTags`
 * (default: `accuracy` with 3 levels); that configuration drives the
 * `action=review` parameters and the `flagconfig` output, while the page-level
 * fields below keep a fixed shape. (`$wgFlaggedRevsParams` is the JS-side copy
 * of that configuration, exposed to ResourceLoader pages.)
 *
 * @see https://www.mediawiki.org/wiki/Extension:FlaggedRevs
 */
import type { Expiry, SuccessResult, Timestamp } from "../common";
import type { ApiPageRef } from "../core/query/shared";
import type { ApiEnvelope } from "../envelope";

/** A page's FlaggedRevs state (`prop=flagged`). */
export interface ApiPageFlagged {
  /** Revision id of the current stable version (`fp_stable`). */
  stable_revid?: number;

  /**
   * Review tier of the page's highest-quality reviewed revision (`fp_quality`).
   * Only the checked tier (`0`) is emitted in 1.43; `1` (quality) and `2`
   * (pristine) are historical values. Pages never reviewed carry no `flagged`
   * object at all.
   */
  level?: number;

  /** Display label for the stable revision; hard-coded to `stable`. */
  level_text?: string;

  /** When a pending (unreviewed) revision appeared (`fp_pending_since`). */
  pending_since?: Timestamp;

  /**
   * Autoreview restriction level configured for the page (`fpc_level`),
   * e.g. `sysop`; `""` when none.
   */
  protection_level?: string;

  /** When that configured protection expires: ISO 8601 or the literal `infinity`. */
  protection_expiry?: Expiry;
}

/**
 * Review state attached to a single revision by `prop=revisions`
 * (`rvprop=flagged`, injected by FlaggedRevs; requires `rvprop=ids` — the
 * request fails with `missingparam` otherwise).
 */
export interface ApiRevisionFlagged {
  /** Reviewer who approved the revision. */
  user?: string;

  /** When the review was recorded. */
  timestamp?: Timestamp;

  /** Review tier; always `0` (checked) as of 1.43 — `1`/`2` are historical. */
  level?: number;

  /** Display label for the tier; hard-coded to `stable`. */
  level_text?: string;

  /** Review-tag values, merged with the configured defaults (e.g. `accuracy`). */
  tags?: Record<string, number>;
}

/** One row of `list=unreviewedpages` (pages with a pending, unreviewed revision). */
export interface ApiUnreviewedPage extends ApiPageRef {
  /** Id of the pending (latest) revision (`page_latest`). */
  revid: number;
}

/** `list=unreviewedpages` rows. */
export type ApiQueryUnreviewedPages = ApiUnreviewedPage[];

/** One row of `list=oldreviewedpages` (stable versions that are out of date). */
export interface ApiOldReviewedPage extends ApiPageRef {
  /** Id of the current (latest) revision. */
  revid: number;

  /** Id of the current stable revision. */
  stable_revid: number;

  /** When the pending revision appeared. */
  pending_since: Timestamp;

  /** Quality level of the stable revision (`fp_quality`). */
  flagged_level: number;

  /**
   * Localized level name. The module hard-codes `stable` here, so treat it as a
   * label rather than a distinct level.
   */
  flagged_level_text: string;

  /** Bytes between the stable revision and the current one. */
  diff_size: number;
}

/** `list=oldreviewedpages` rows. */
export type ApiQueryOldReviewedPages = ApiOldReviewedPage[];

/** One row of `list=configuredpages` (pages with explicit stability configuration). */
export interface ApiConfiguredPage extends ApiPageRef {
  /** Id of the current (latest) revision. */
  last_revid: number;

  /** Id of the stable revision. */
  stable_revid: number;

  /** Whether "stable" is the default view (`fpc_override`); `0`/`1` as an int. */
  stable_is_default: number;

  /** Autoreview right level (`fpc_level`), e.g. `sysop`; `""` when none. */
  autoreview: string;

  /** Configured protection expiry, or `infinity`. */
  expiry: Expiry;
}

/** `list=configuredpages` rows. */
export type ApiQueryConfiguredPages = ApiConfiguredPage[];

/** Response of `action=review` (approve or unapprove a pending revision). */
export interface ApiReviewResponse extends ApiEnvelope {
  /** Result of `action=review`. */
  review: {
    /** `Success` when the review was recorded; failures surface as API errors. */
    result: SuccessResult;
  };
}

/**
 * Response of `action=stabilize` (change a page's stable-version config).
 *
 * Which variant serves the action depends on `$wgFlaggedRevsProtection`: the
 * default mode returns `default`/`autoreview`, while the protection mode
 * (`$wgFlaggedRevsProtection=true`) returns `protectlevel` instead.
 */
export interface ApiStabilizeResponse extends ApiEnvelope {
  /** Result of `action=stabilize`; which keys appear depends on `$wgFlaggedRevsProtection`. */
  stabilize: {
    /** Target page title. */
    title: string;

    /** Which revision readers get by default (default mode). */
    default?: "latest" | "stable" | (string & {});

    /** Which users' edits are auto-reviewed (default mode). */
    autoreview?: "none" | "sysop" | (string & {});

    /** Autoreview restriction applied (protection mode, `$wgFlaggedRevsProtection=true`). */
    protectlevel?: "none" | "sysop" | (string & {});

    /** When the configuration expires: ISO 8601 or the literal `infinity`. */
    expiry: Expiry;
  };
}

/** One quality setting reported by `action=flagconfig`. */
export interface ApiFlagConfigEntry {
  /** Setting tag name, e.g. `quality`. */
  name: string;

  /** Highest level available for this setting. */
  levels: number;

  /** Tier of the setting (`1` for the primary quality level). */
  tier1: number;
}

/**
 * Response of `action=flagconfig`. FlaggedRevs writes this at the **root** of the
 * envelope (it is not a query module), so it sits beside `query`, not inside it.
 */
export interface ApiFlagConfigResponse extends ApiEnvelope {
  /**
   * Result of `action=flagconfig`. The list holds the single configured review
   * tag (FlaggedRevs supports one quality dimension) and is empty in
   * protection-only mode.
   */
  flagconfig?: ApiFlagConfigEntry[];
}

declare module "types-mediawiki-response" {
  interface ApiPage {
    /** Review and stabilization state of the page (`prop=flagged`). */
    flagged?: ApiPageFlagged;
  }
  interface ApiRevision {
    /**
     * Review state of the revision (`rvprop=flagged`, which requires
     * `rvprop=ids`).
     */
    flagged?: ApiRevisionFlagged;
  }
  interface ApiQueryResult {
    /** Pages not reviewed to the requested quality level (`list=unreviewedpages`). */
    unreviewedpages?: ApiQueryUnreviewedPages;

    /** Pages with changes pending review (`list=oldreviewedpages`). */
    oldreviewedpages?: ApiQueryOldReviewedPages;

    /** Pages with custom review configuration (`list=configuredpages`). */
    configuredpages?: ApiQueryConfiguredPages;
  }
}
