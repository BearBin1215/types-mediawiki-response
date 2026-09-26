/**
 * `list=usercontribs` — a user's edits, merged into {@link ApiQueryResult} via
 * declaration merging.
 *
 * Unlike `prop=revisions`, the `new` / `minor` / `top` flags are real booleans
 * under `formatversion=2`.
 *
 * @see https://www.mediawiki.org/wiki/API:Usercontribs
 */
import type { Flag, NamespaceIndex, Timestamp } from "../../common";
import type { ApiHiddenFlags } from "./shared";

/** One contribution record. `ucprop` controls which fields appear. */
export interface ApiUserContrib extends ApiHiddenFlags {
  /** Author user id; `0` for anonymous editors. Not gated by `ucprop`. */
  userid: number;

  /** Author user name or IP. Not gated by `ucprop`. */
  user: string;

  /** Id of the edited page. `ucprop=ids`. */
  pageid?: number;

  /** Revision id of this contribution. `ucprop=ids`. */
  revid?: number;

  /** Previous revision id; `0` for a new page. `ucprop=ids`. */
  parentid?: number;

  /** Namespace index. */
  ns?: NamespaceIndex;

  /** Title of the edited page. */
  title?: string;

  /** Contribution timestamp. `ucprop=timestamp`. */
  timestamp?: Timestamp;

  /** Whether this created a new page. `ucprop=flags`; a real `boolean`. */
  new?: boolean;

  /** Whether the edit was minor. `ucprop=flags`; a real `boolean`. */
  minor?: boolean;

  /** Whether this is the current revision. `ucprop=flags`; a real `boolean`. */
  top?: boolean;

  /** Raw edit summary. `ucprop=comment`. */
  comment?: string;

  /** HTML-rendered edit summary. `ucprop=parsedcomment`. */
  parsedcomment?: string;

  /**
   * Whether the change has been patrolled. `ucprop=patrolled` (only for a caller
   * that may see patrol state); a real `boolean`, present as `false` too.
   */
  patrolled?: boolean;

  /**
   * Whether the change was auto-patrolled via the user's rights.
   * `ucprop=patrolled`; a real `boolean`.
   */
  autopatrolled?: boolean;

  /** Revision size in bytes. `ucprop=size`. */
  size?: number;

  /** Change in bytes vs. the parent. `ucprop=sizediff`. */
  sizediff?: number;

  /** Change tags. `ucprop=tags`. */
  tags?: string[];

  /** The revision content is hidden (revision-deleted). A {@link Flag}. */
  texthidden?: Flag;

  /** The summary is hidden. `ucprop=comment|parsedcomment`; a {@link Flag}. */
  commenthidden?: Flag;
}

declare module "./index" {
  interface ApiQueryResult {
    /** A user's contributions (`list=usercontribs`). */
    usercontribs?: ApiUserContrib[];
  }
}
