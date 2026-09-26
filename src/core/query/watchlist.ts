/**
 * `list=watchlist` — recent changes to the requesting user's watchlist, merged
 * into {@link ApiQueryResult}. Requires being logged in (reads the caller's own
 * feed unless `owner=` names another viewable watchlist).
 *
 * Entries mirror `list=recentchanges` but are keyed by `revid`/`old_revid`
 * (no `rcid`). Under fv2 the flags (`minor`/`bot`/`new`/`patrolled`/…) are real
 * booleans, and `expiry` is `false` when the page has no upcoming protection
 * expiry (otherwise a timestamp).
 *
 * @see https://www.mediawiki.org/wiki/API:Watchlist
 */
import type { ApiWatchlistLabel, Flag, NamespaceIndex, Timestamp } from "../../common";
import type { ApiHiddenFlags } from "./shared";
import type { RecentChangeType } from "./recentchanges";

/** One watchlist entry. `wlprop` controls which fields appear. */
export interface ApiWatchlistEntry extends ApiHiddenFlags {
  /** Change type. */
  type?: RecentChangeType;

  /** Namespace index. */
  ns?: NamespaceIndex;

  /** Page title. */
  title?: string;

  /** Page id. `wlprop=ids`. */
  pageid?: number;

  /** Revision id. `wlprop=ids`. */
  revid?: number;

  /** Previous revision id. `wlprop=ids`. */
  old_revid?: number;

  /** Log id. `wlprop=loginfo` (only for `type=log`). */
  logid?: number;

  /** Log type. `wlprop=loginfo` (only for `type=log`). */
  logtype?: string;

  /** Log action. `wlprop=loginfo` (only for `type=log`). */
  logaction?: string;

  /** Structured log parameters. `wlprop=loginfo` (only for `type=log`). */
  logparams?: Record<string, unknown>;

  /**
   * Localized log action text, e.g. `changed protection settings`.
   * `wlprop=loginfo` (only for `type=log`).
   */
  logdisplay?: string;

  /**
   * Actor user name or IP. `wlprop=user`; under `wlprop=userid` only, the
   * actor's user id (number) for backwards compatibility.
   */
  user?: string | number;

  /** Actor user id. `wlprop=userid`. */
  userid?: number;

  /**
   * Made by a temporary account. `wlprop=user`; a real `boolean`.
   *
   * @since MediaWiki 1.42
   */
  temp?: boolean;

  /** Made by an anonymous editor. `wlprop=user|userid`; a real `boolean`. */
  anon?: boolean;

  /** Made by a bot. `wlprop=flags`; a real `boolean`. */
  bot?: boolean;

  /** Created a new page. `wlprop=flags`; a real `boolean`. */
  new?: boolean;

  /** Was a minor edit. `wlprop=flags`; a real `boolean`. */
  minor?: boolean;

  /** Old revision size in bytes. `wlprop=sizes`. */
  oldlen?: number;

  /** New revision size in bytes. `wlprop=sizes`. */
  newlen?: number;

  /** Change timestamp. `wlprop=timestamp`. */
  timestamp?: Timestamp;

  /** When the user last saw the page; `""` when never. `wlprop=notificationtimestamp`. */
  notificationtimestamp?: Timestamp | "";

  /** Raw summary. `wlprop=comment`. */
  comment?: string;

  /** HTML-rendered summary. `wlprop=parsedcomment`. */
  parsedcomment?: string;

  /** Whether the change is patrolled. `wlprop=patrol`; a real `boolean`. */
  patrolled?: boolean;

  /** Unpatrolled flag. `wlprop=patrol`; a real `boolean`. */
  unpatrolled?: boolean;

  /** Auto-patrolled flag. `wlprop=patrol`; a real `boolean`. */
  autopatrolled?: boolean;

  /** Change tags. `wlprop=tags`. */
  tags?: string[];

  /** Upcoming protection expiry, or `false` when none. `wlprop=expiry`. */
  expiry?: Timestamp | false;

  /** The log action is hidden (log-deleted). `wlprop=ids|title|loginfo` (only for `type=log`); a {@link Flag}. */
  actionhidden?: Flag;

  /** The author is hidden. `wlprop=user|userid`; a {@link Flag}. */
  userhidden?: Flag;

  /** The edit summary is hidden (revision-deleted). `wlprop=comment|parsedcomment`; a {@link Flag}. */
  commenthidden?: Flag;

  /**
   * Watchlist labels attached to the page. `wlprop=labels`; requires
   * `$wgEnableWatchlistLabels`, and `[]` when there are none.
   *
   * @since MediaWiki 1.46
   */
  labels?: ApiWatchlistLabel[];
}

declare module "./index" {
  interface ApiQueryResult {
    /** Watchlist changes (`list=watchlist`). */
    watchlist?: ApiWatchlistEntry[];
  }
}
