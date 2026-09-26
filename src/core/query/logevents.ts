/**
 * `list=logevents` — the page/user action log, merged into {@link ApiQueryResult}
 * via declaration merging. Central to admin tooling (audit trails).
 *
 * `type` + `action` together identify the event (e.g. `delete` / `delete`); the
 * structured details live under `params` (`leprop=details`).
 *
 * @see https://www.mediawiki.org/wiki/API:Logevents
 */
import type { Flag, NamespaceIndex, Timestamp } from "../../common";
import type { ApiHiddenFlags } from "./shared";

/** One log event. `leprop` controls which fields appear. */
export interface ApiLogEvent extends ApiHiddenFlags {
  /** Log record id. `leprop=ids`. */
  logid?: number;

  /** Namespace of the affected page. */
  ns?: NamespaceIndex;

  /** Title of the affected page. `leprop=title`. */
  title?: string;

  /** Page id of the target; `0` when there is no page. `leprop=ids`. */
  pageid?: number;

  /** Page id the log is filed under. `leprop=ids`. */
  logpage?: number;

  /**
   * Revision id associated with the event (when applicable). `leprop=ids`.
   *
   * @since MediaWiki 1.40
   */
  revid?: number;

  /** Log type, e.g. `delete`, `move`, `newusers`. `leprop=type`. */
  type?: string;

  /** Log action, e.g. `create`, `delete`. `leprop=type`. */
  action?: string;

  /** Structured log details; shape varies by `type`/`action`. `leprop=details`. */
  params?: Record<string, unknown>;

  /** Performing user name (or IP). `leprop=user`. */
  user?: string;

  /** Performing user id. `leprop=userid`. */
  userid?: number;

  /** Event timestamp. `leprop=timestamp`. */
  timestamp?: Timestamp;

  /** Raw log comment. `leprop=comment`. */
  comment?: string;

  /** HTML-rendered comment. `leprop=parsedcomment`. */
  parsedcomment?: string;

  /** Change tags. `leprop=tags`. */
  tags?: string[];

  /**
   * Made by an anonymous (IP) actor. `leprop=user|userid`; a {@link Flag}.
   */
  anon?: Flag;

  /**
   * The actor is a temporary account. `leprop=user|userid`; a {@link Flag}.
   *
   * @since MediaWiki 1.42
   */
  temp?: Flag;

  /**
   * The log action/target is hidden (log-deleted). `leprop=ids|title`, or
   * `leprop=details` on rows that have stored params. A {@link Flag}.
   */
  actionhidden?: Flag;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Log events (`list=logevents`). */
    logevents?: ApiLogEvent[];
  }
}
