/**
 * `meta=allmessages` — interface (system) messages, merged into
 * {@link ApiQueryResult} via declaration merging.
 *
 * The message body is the `content` field. Selecting keys with `ammessages=`
 * keeps responses small.
 *
 * @see https://www.mediawiki.org/wiki/API:Allmessages
 */
import type { Flag } from "../../common";

/** One interface message. */
export interface ApiAllMessage {
  /** Message key. */
  name: string;

  /**
   * Key normalized for lookup: first letter lowercased and spaces replaced
   * with underscores. Emitted on every entry, independent of `amprop`.
   */
  normalizedname: string;

  /** Message body. Absent when the message does not exist. */
  content?: string;

  /** Default (untranslated) value. `amprop=default`. */
  default?: string;

  /**
   * The message exists on the wiki (e.g. a custom `MediaWiki:` page) but the
   * software ships no built-in default for it. Emitted instead of
   * {@link default} under `amprop=default`. A {@link Flag}.
   */
  defaultmissing?: Flag;

  /**
   * Present only when filtering with `amcustomised=modified`, which restricts
   * the result to customised messages, so always `true`. A {@link Flag}.
   */
  customised?: Flag;

  /** `true` when the message is not defined. */
  missing?: true;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Interface messages (`meta=allmessages`). */
    allmessages?: ApiAllMessage[];
  }
}
