/**
 * `list=categorymembers` — the pages/subcategories/files in a category, merged
 * into {@link ApiQueryResult} via declaration merging.
 *
 * Also used as a generator (`generator=categorymembers`), which instead feeds
 * results into `query.pages` (combined with any `prop=`); the generator's
 * cursor is `gcmcontinue`.
 *
 * @see https://www.mediawiki.org/wiki/API:Categorymembers
 */
import type { NamespaceIndex, Timestamp } from "../../common";

/**
 * Member type (`cmtype` / `gcmtype`). Open union for forward compatibility.
 */
export type CategoryMemberType = "page" | "subcat" | "file" | (string & {});

/** One category member. `cmprop` controls which fields appear. */
export interface ApiCategoryMember {
  /** Page id. `cmprop=ids`. */
  pageid?: number;

  /** Namespace index. */
  ns?: NamespaceIndex;

  /** Full page title. */
  title?: string;

  /** Raw (hex) sort key. `cmprop=sortkey`. */
  sortkey?: string;

  /** Human-readable sort key prefix. `cmprop=sortkeyprefix`. */
  sortkeyprefix?: string;

  /** Member type. `cmprop=type`. */
  type?: CategoryMemberType;

  /** When the page was added to the category. `cmprop=timestamp`. */
  timestamp?: Timestamp;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Category members (`list=categorymembers`). */
    categorymembers?: ApiCategoryMember[];
  }
}
