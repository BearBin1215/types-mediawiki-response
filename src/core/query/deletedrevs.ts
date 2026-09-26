/**
 * `list=deletedrevs` — deleted revisions across the wiki, grouped per page.
 *
 * @deprecated since MediaWiki 1.25. Core answers the request with a deprecation
 * notice in `warnings`; use `prop=deletedrevisions` for a known title or
 * `list=alldeletedrevisions` to enumerate. Modeled anyway because clients still call it.
 *
 * Its `drprop` names predate the modern modules: `revid`/`parentid`/`minor`/`len`
 * rather than `ids`/`flags`/`size`, and {@link ApiDeletedRev.len} is a **string**.
 * Pages are grouped under a synthetic counter, which `formatversion=2` emits as a
 * list — unlike `list=alldeletedrevisions`, which carries the real `pageid`.
 *
 * On 1.41+ `drprop=content` fails with an internal error; the other `drprop`
 * values (including the deprecated `token`) still answer.
 *
 * @see https://www.mediawiki.org/wiki/API:Deletedrevs
 */
import type { Flag, NamespaceIndex, Timestamp } from "../../common";
import type { ApiHiddenFlags } from "./shared";

/** One archived revision, as `list=deletedrevs` formats it. */
export interface ApiDeletedRev extends ApiHiddenFlags {
  /** Revision timestamp — returned unconditionally, not a `drprop` value. */
  timestamp: Timestamp;

  /** Revision id. `drprop=revid`. */
  revid?: number;

  /** Parent revision id; `0` for a page's first revision. `drprop=parentid`. */
  parentid?: number;

  /** Editor name. `drprop=user`. */
  user?: string;

  /** Editor user id. `drprop=userid`. */
  userid?: number;

  /** Raw edit summary. `drprop=comment`. */
  comment?: string;

  /** HTML-rendered edit summary. `drprop=parsedcomment`. */
  parsedcomment?: string;

  /** Whether the edit was marked minor. `drprop=minor`; a real `boolean`. */
  minor?: boolean;

  /**
   * Revision size in bytes, **as a string** (`"19"`). `drprop=len`.
   */
  len?: string;

  /** Content checksum (hex), or `''` when unavailable. `drprop=sha1`. */
  sha1?: string;

  /** Change tags. `drprop=tags`; `[]` when none. */
  tags?: string[];

  /** The content is hidden, which also hides `sha1`. Revision-delete; a {@link Flag}. */
  texthidden?: Flag;

  /** The checksum is withheld. A {@link Flag}. */
  sha1hidden?: Flag;
}

/** One page group. `drprop=content` also yields the revision text. */
export interface ApiDeletedRevs {
  /** Namespace index. */
  ns: NamespaceIndex;

  /** Full page title. */
  title: string;

  /** The page's archived revisions. */
  revisions: ApiDeletedRev[];

  /**
   * Token for restoring the revisions; a CSRF token (the same value for every
   * page), issued only to callers with the `undelete` right on same-origin
   * requests. `drprop=token`.
   *
   * @deprecated since MediaWiki 1.24; request a CSRF token from `meta=tokens`
   * instead.
   */
  token?: string;
}

declare module "./index" {
  interface ApiQueryResult {
    /**
     * Deleted revisions grouped per page (`list=deletedrevs`).
     *
     * @deprecated since MediaWiki 1.25; prefer {@link ApiQueryResult.alldeletedrevisions}.
     */
    deletedrevs?: ApiDeletedRevs[];
  }
}
