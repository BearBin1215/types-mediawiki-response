/**
 * `action=watch` response — adds/removes pages from the watchlist; needs CSRF.
 * The result is a top-level `watch` **array** (one entry per requested page) in
 * page-set mode (`titles`/`pageids`/`revids`), a **single object** with the
 * legacy `title` parameter. Requires the `watch` token
 * (`meta=tokens&type=watch`).
 *
 * Inputs the page set cannot resolve come back as problem entries carrying only
 * the unresolved id or title; see {@link ApiPageIdentity} for their shared
 * marker fields.
 *
 * @see https://www.mediawiki.org/wiki/API:Watch
 */
import type { ApiWatchlistLabel, Expiry, ApiSpecMessage } from "../common";
import type { ApiEnvelope, ApiError, ApiMessage } from "../envelope";
import type { ApiPageIdentity } from "./query";

/**
 * One entry of `watch`: an applied outcome, or a problem entry for an
 * unresolved input.
 */
export interface ApiWatchEntry extends Omit<ApiPageIdentity, "known"> {
  /** Revision id of an unresolved `revids=` value. */
  revid?: number;

  /** Interwiki prefix of an unresolved interwiki title. */
  iw?: string;

  /** The page was added to the watchlist. A real `boolean`. */
  watched?: boolean;

  /** The page was removed from the watchlist. A real `boolean`. */
  unwatched?: boolean;

  /**
   * The page is not watchable — always `0`; `watched`/`unwatched` are absent.
   */
  watchable?: 0;

  /**
   * Expiry applied to the watch (the `expiry` parameter echoed back). Watch
   * direction only.
   */
  expiry?: Expiry;

  /**
   * In-band messages when the watch/unwatch operation failed (page-set mode;
   * the legacy `title` mode dies with a top-level error instead). Heterogeneous:
   * messages raised by the operation itself follow the request's `errorformat`
   * ({@link ApiSpecMessage} under `bc`, {@link ApiMessage} under a modern one),
   * while a watchlist-label failure carries the legacy `{ code, info }` shape
   * under `bc`, and an {@link ApiMessage} under a modern one.
   */
  errors?: (ApiSpecMessage | ApiMessage | ApiError)[];

  /** In-band warnings for a failed operation (present when non-empty), shaped per the request's `errorformat`. */
  warnings?: ApiSpecMessage[] | ApiMessage[];

  /**
   * Watchlist labels just saved for this page, echoed back when the request
   * passed `labels` and `$wgEnableWatchlistLabels` is on.
   *
   * @since MediaWiki 1.46
   */
  labels?: ApiWatchlistLabel[];
}

/** Response of `action=watch`. */
export interface ApiWatchResponse extends ApiEnvelope {
  /** Result of `action=watch`: one object for the legacy `title=` parameter, a list for the page-set parameters. */
  watch: ApiWatchEntry | ApiWatchEntry[];
}
