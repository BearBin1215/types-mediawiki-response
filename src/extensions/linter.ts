/**
 * Opt-in extension pack: **Linter** (`list=linterrors`, `meta=linterstats`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/linter';
 * ```
 *
 * `list=linterrors` takes no `*prop=`: each row carries the same fields.
 * Error categories are deployment-configurable (`$wgLinterCategories`), so
 * {@link ApiLintError.category} and the keys of
 * {@link ApiQueryLinterStats.totals} are an open set, and
 * `lntcategories` rejects a value the wiki doesn't track.
 *
 * `location` is a two-element `[start, end]` offset pair into the parsable
 * source, kept as an array (not a map) by `formatversion=2`.
 *
 * @see https://www.mediawiki.org/wiki/Extension:Linter
 */
import type { ApiPageRef } from "../core/query/shared";

/** Template context for an error that sits inside a transclusion. */
export interface ApiLintTemplateInfo {
  /** Full template title, e.g. `Template:Foo`. */
  title?: string;

  /** Whether the error spans a multi-part template block. */
  multiPartTemplateBlock?: boolean;
}

/** Extra parameters carried by a lint error (template name, tag, …). */
export interface ApiLintErrorParams {
  /** Name of the offending tag or template. */
  name?: string;

  /** Any other parameter the error's category attaches. */
  [key: string]: unknown;
}

/** One lint error (`list=linterrors`). */
export interface ApiLintError extends ApiPageRef {
  /** Lint row id; feed it back as `lntfrom` to continue, or to the edit form. */
  lintId: number;

  /** Error category key, e.g. `missing-end-tag`. Open union. */
  category: string;

  /** `[start, end]` byte offsets of the offending markup in the parsable source. */
  location: number[];

  /** Template context; `{}` when the error does not sit inside a transclusion. */
  templateInfo: ApiLintTemplateInfo;

  /** Error-specific extras. Forced to a map, so an empty value is `{}`. */
  params: ApiLintErrorParams;
}

/** The `linterstats` object (returned under `query` by `meta=linterstats`). */
export interface ApiQueryLinterStats {
  /**
   * Per-category totals, keyed by error category (e.g. `missing-end-tag`).
   * Keys are site-configurable.
   */
  totals?: Record<string, number>;
}

/** Lint-error category priorities injected into `siprop=general`. */
export interface ApiLinterGeneralInfo {
  /** High-priority categories. */
  high: string[];

  /** Medium-priority categories. */
  medium: string[];

  /** Low-priority categories. */
  low: string[];
}

declare module "types-mediawiki-response" {
  interface ApiQueryResult {
    /** Lint error rows matching the requested categories (`list=linterrors`). */
    linterrors?: ApiLintError[];

    /** Lint-error statistics for this wiki (`meta=linterstats`). */
    linterstats?: ApiQueryLinterStats;
  }
  interface ApiSiteGeneral {
    /** Lint-category priorities for this wiki. */
    linter?: ApiLinterGeneralInfo;
  }
}
