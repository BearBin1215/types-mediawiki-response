/**
 * `list=recentchanges` — the recent-changes feed, merged into
 * {@link ApiQueryResult} via declaration merging.
 *
 * `new` / `minor` / `bot` are real booleans (emitted under `rcprop=flags`,
 * `false` included); the `log*` fields appear only for `type=log` entries.
 *
 * @see https://www.mediawiki.org/wiki/API:RecentChanges
 */
import type { Flag, NamespaceIndex, Timestamp } from "../../common";
import type { ApiHiddenFlags } from "./shared";
import type { ApiLogEventParams } from "./logparams";

/** Change type (`rctype`). Open union for forward compatibility. */
export type RecentChangeType = "edit" | "new" | "log" | "categorize" | "external" | (string & {});

/** One recent-changes entry. `rcprop` controls which fields appear. */
export interface ApiRecentChange extends ApiHiddenFlags {
  /** Change type. */
  type: RecentChangeType;

  /** Namespace index. */
  ns?: NamespaceIndex;

  /** Page title. */
  title?: string;

  /** Page id; `0` for log entries without a page. `rcprop=ids`. */
  pageid?: number;

  /** Revision id; `0` for log entries. `rcprop=ids`. */
  revid?: number;

  /** Previous revision id. `rcprop=ids`. */
  old_revid?: number;

  /** Recent-changes record id. `rcprop=ids`. */
  rcid?: number;

  /** Actor user name or IP. `rcprop=user`. */
  user?: string;

  /** Actor user id. `rcprop=userid`. */
  userid?: number;

  /** Whether the change was made by a bot. `rcprop=flags`; a real `boolean`. */
  bot?: boolean;

  /** Whether the change created a new page. `rcprop=flags`; a real `boolean`. */
  new?: boolean;

  /** Whether the edit was minor. `rcprop=flags`; a real `boolean`. */
  minor?: boolean;

  /** Whether the target is a redirect. `rcprop=redirect`; a real `boolean`. */
  redirect?: boolean;

  /**
   * Whether the change has been patrolled (manually or automatically).
   * `rcprop=patrolled` (requires rights).
   */
  patrolled?: boolean;

  /** Auto-patrolled flag. `rcprop=patrolled`. */
  autopatrolled?: boolean;

  /** Unpatrolled flag. `rcprop=patrolled`. */
  unpatrolled?: boolean;

  /** Old revision size in bytes. `rcprop=sizes`. */
  oldlen?: number;

  /** New revision size in bytes. `rcprop=sizes`. */
  newlen?: number;

  /** Change timestamp. `rcprop=timestamp`. */
  timestamp?: Timestamp;

  /** Raw summary. `rcprop=comment`. */
  comment?: string;

  /** HTML-rendered summary. `rcprop=parsedcomment`. */
  parsedcomment?: string;

  /** Change tags. `rcprop=tags`. */
  tags?: string[];

  /** Content checksum (hex). `rcprop=sha1`. */
  sha1?: string;

  /**
   * Made by an anonymous (IP) editor. `rcprop=user|userid`; a {@link Flag}
   * (appears only when true, unlike this module's real-boolean `flags`).
   */
  anon?: Flag;

  /**
   * The actor is a temporary account. `rcprop=user|userid`; a {@link Flag}.
   *
   * @since MediaWiki 1.42
   */
  temp?: Flag;

  /** The log action is hidden (log-deleted). `rcprop=ids|title|loginfo`; a {@link Flag}. */
  actionhidden?: Flag;

  /** `sha1` is withheld because the content is hidden. A {@link Flag}. */
  sha1hidden?: Flag;

  /** Log id. `rcprop=loginfo` (only for `type=log`). */
  logid?: number;

  /** Log type, e.g. `newusers`. `rcprop=loginfo`. */
  logtype?: string;

  /** Log action, e.g. `create`. `rcprop=loginfo`. */
  logaction?: string;

  /**
   * Structured log details — see {@link ApiLogEventParams}. `rcprop=loginfo`
   * (only for `type=log`).
   */
  logparams?: ApiLogEventParams;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Recent changes (`list=recentchanges`). */
    recentchanges?: ApiRecentChange[];
  }
}
