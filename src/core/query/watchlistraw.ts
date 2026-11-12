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
import type { ApiQueryResponse } from "./index";

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
 * Response of a query whose only module is `list=watchlistraw`: the same
 * envelope as {@link ApiQueryResponse}, named for the module-only case that
 * leaves out `query`.
 */
export interface ApiWatchlistRawResponse extends ApiQueryResponse {}
