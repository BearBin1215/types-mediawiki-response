/**
 * Opt-in extension pack: **PageViewInfo** (`prop=pageviews`, `meta=siteviews`,
 * `list=mostviewed`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/pageviews';
 * ```
 *
 * fv2 notes: the daily breakdowns are keyed by `YYYY-MM-DD` date and returned as
 * **associative objects** (`{ "2024-01-15": 12345, … }`), not arrays — the keys
 * are dates, so model them as {@link ApiViewCounts}. The newest (in-progress) day
 * often comes back `null` rather than a count. Metric selects the measure:
 * `prop=pageviews`/`list=mostviewed` only expose `pageviews`; `meta=siteviews`
 * also accepts `uniques` (`pvisdays`, default 60). `list=mostviewed` is a
 * generator-capable list whose rows live directly under `query.mostviewed` and
 * continue via `pvimoffset` (covered by the core continuation index signature).
 *
 * @see https://www.mediawiki.org/wiki/Extension:PageViewInfo
 */
import type { NamespaceIndex } from "../common";

/** Date-keyed (`YYYY-MM-DD`) view counts; the newest, incomplete day may be `null`. */
export type ApiViewCounts = Record<string, number | null>;

/** One row of `list=mostviewed`. */
export interface ApiMostViewedPage {
  /** Namespace index (rows may include pseudo-namespaces, e.g. `-1` for `Special:`). */
  ns: NamespaceIndex;

  /** Page title, prefixed for non-main namespaces. */
  title: string;

  /** View count over the reported window. */
  count: number;
}

/** Per-service metric support injected into `siprop=general`. */
export interface ApiPageViewServiceMetrics {
  /** Whether the service can serve per-page view counts. */
  pageviews: boolean;

  /** Whether the service can serve unique-visitor counts. */
  uniques: boolean;
}

declare module "types-mediawiki-response" {
  interface ApiPage {
    /** `prop=pageviews` (`pvipdays`, default 60): per-day view counts for this page. */
    pageviews?: ApiViewCounts;
  }

  interface ApiQueryResult {
    /** `meta=siteviews`: per-day view counts for the whole site. */
    siteviews?: ApiViewCounts;

    /** `list=mostviewed`: the site's most-viewed pages. */
    mostviewed?: ApiMostViewedPage[];
  }
  interface ApiSiteGeneral {
    /**
     * Which metrics each module's page-view service supports, keyed by module
     * name (`pageviews`/`siteviews`/`mostviewed`); hook-injected, present
     * with PageViewInfo installed.
     */
    "pageviewservice-supported-metrics"?: Record<string, ApiPageViewServiceMetrics>;
  }
}
