/**
 * `list=watchlistraw` — the titles on the requesting user's watchlist, as the
 * watch table holds them (no edit metadata; use `list=watchlist` for that).
 * Requires being logged in.
 *
 * **Root-level quirk**: `ApiQueryWatchlistRaw` adds its values under the bare
 * module name instead of `['query', …]`, so the array sits next to `query` in the
 * response rather than inside it — and a query asking *only* for this module has
 * no `query` member at all ({@link ApiWatchlistRawResponse}).
 *
 * @see https://www.mediawiki.org/wiki/API:Watchlistraw
 */
import type { NamespaceIndex, Timestamp } from "../../common";
import type { ApiEnvelope } from "../../envelope";
import type { ApiQueryContinue } from "./index";

/** One watched title. */
export interface ApiWatchlistRawEntry {
  /** Namespace index. */
  ns: NamespaceIndex;

  /** Full page title. */
  title: string;

  /**
   * When the entry was last visited, i.e. the "changed since" marker.
   * `wrprop=changed`; absent for entries never viewed.
   */
  changed?: Timestamp;
}

declare module "./index" {
  interface ApiQueryResponse {
    /** Raw watchlist titles (`list=watchlistraw`) — a root-level key. */
    watchlistraw?: ApiWatchlistRawEntry[];
  }
}

/**
 * Response of a query whose only module is `list=watchlistraw`: because the
 * module writes outside `query`, the envelope comes back without a `query` member.
 */
export interface ApiWatchlistRawResponse extends ApiEnvelope {
  /** Cursors to pass back on the next request to fetch the following titles. */
  continue?: ApiQueryContinue;

  /** Raw watchlist titles (`list=watchlistraw`). */
  watchlistraw?: ApiWatchlistRawEntry[];
}
