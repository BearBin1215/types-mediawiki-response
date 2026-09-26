/**
 * `list=querypage` — one of the wiki's special-page reports (`Special:Ancientpages`,
 * `Special:Longpages`, …), merged into {@link ApiQueryResult}.
 *
 * Pagination uses the numeric `qpoffset` cursor rather than a string one. A row's
 * columns depend on the report: every report yields `ns`/`title`, most add a
 * `value`, and date-keyed reports add a formatted `timestamp`.
 *
 * @see https://www.mediawiki.org/wiki/API:Querypage
 */
import type { Flag, NamespaceIndex, Timestamp } from "../../common";

/** One row of a report. */
export interface ApiQueryPageResult {
  /**
   * The report's sort value — a **string** even when it carries a count or a
   * `yyyymmddhhmmss` date (e.g. `"4"`, `"20240115083000"`).
   */
  value?: string;

  /** Row timestamp; appears on date-keyed reports (`Ancientpages`). */
  timestamp?: Timestamp;

  /** Namespace index. */
  ns: NamespaceIndex;

  /** Full page title. */
  title: string;

  /**
   * Raw database columns the report did not fold into named fields, keyed by
   * column name (all values are strings). Reports that select extra columns —
   * `DoubleRedirects` exposes its `b_*`/`c_*` redirect columns this way — leak
   * them here instead of surfacing each one.
   */
  databaseResult?: Record<string, string>;
}

/** The `querypage` container: the requested report and its rows. */
export interface ApiQueryPage {
  /** CamelCase report name, e.g. `Ancientpages`. */
  name: string;

  /** The rows come from the job cache. A {@link Flag}. */
  cached?: Flag;

  /**
   * The report is cached but not cacheable, so its rows are withheld. A
   * {@link Flag}.
   */
  disabled?: Flag;

  /**
   * When the cached report was built; appears alongside {@link cached} when
   * the cache timestamp is known.
   */
  cachedtimestamp?: Timestamp;

  /** Largest result set the report can yield, independent of `qplimit`. */
  maxresults?: number;

  /** Rows of the report. */
  results?: ApiQueryPageResult[];
}

declare module "./index" {
  interface ApiQueryResult {
    /** The requested special-page report (`list=querypage`). */
    querypage?: ApiQueryPage;
  }
}
