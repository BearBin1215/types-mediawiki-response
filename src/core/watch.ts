/**
 * `action=watch` response — adds/removes pages from the watchlist; needs CSRF.
 * The result is a top-level `watch` **array** (one entry per title) in pageset
 * mode (`titles`/`pageids`/`revids`), a **single object** with the legacy
 * `title` parameter. Requires the `watch` token (`meta=tokens&type=watch`).
 *
 * @see https://www.mediawiki.org/wiki/API:Watch
 */
import type { ApiWatchlistLabel, Expiry, NamespaceIndex, ApiSpecMessage } from "../common";
import type { ApiEnvelope } from "../envelope";

/** One watched/unwatched page. */
export interface ApiWatchEntry {
  /** Page title. */
  title: string;

  /** Namespace index. */
  ns: NamespaceIndex;

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

  /** In-band messages when the watch/unwatch operation failed (pageset mode; the legacy `title` mode dies with a top-level error instead). */
  errors?: ApiSpecMessage[];

  /** In-band warnings for a failed operation (present when non-empty). */
  warnings?: ApiSpecMessage[];

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
