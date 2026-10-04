/**
 * `action=tag` response — applies/removes change tags on revisions, log events,
 * or recent-changes entries; needs CSRF and the `changetags` right. The result
 * is a top-level `tag` **array** with one entry per target.
 *
 * Only defined, manually-applicable tags may be added — adding a deleted/undefined
 * tag raises a `badtags` error. A per-target failure is reported in-band via
 * `status` plus an `errors` array (rather than a top-level error).
 *
 * @see https://www.mediawiki.org/wiki/API:Tag
 */
import type { Flag, ApiSpecMessage } from "../common";
import type { ApiEnvelope, ApiMessage, ApiMessageParam } from "../envelope";
import type { ApiBlockInfo } from "./query/users";

/** One targeted entry of an `action=tag` response. */
export interface ApiTagEntry {
  /** Revision id the tags were applied to. */
  revid?: number;

  /** Log id the tags were applied to. */
  logid?: number;

  /** Recent-change id the tags were applied to. */
  rcid?: number;

  /**
   * Per-target outcome: `success`, `failure`, `skipped` (rate throttle) or
   * `error` (invalid target id, or the performer is blocked from the target
   * page). Open union for forward compat.
   */
  status: "success" | "failure" | "skipped" | "error" | (string & {});

  /** The tag set already matched — no log entry was created. A {@link Flag}. */
  noop?: Flag;

  /** Log entry id recorded for the tagging (absent when {@link ApiTagEntry.noop}). */
  actionlogid?: number;

  /** Tags added to this target. */
  added?: string[];

  /** Tags removed from this target. */
  removed?: string[];

  /** In-band messages when the target could not be tagged (`failure` only), shaped per the request's `errorformat`. */
  errors?: ApiSpecMessage[] | ApiMessage[];

  /**
   * On `error` entries the formatted failure message is merged into the entry:
   * `code` is the message's API code, and the text-bearing keys follow the
   * request's `errorformat` — `info` under the default (`bc`) format, `text`
   * (`plaintext`/`wikitext`), `html`, `key`/`params` (`raw`), or none of them
   * for `none`.
   */
  code?: string;

  /** Message text under the default (`bc`) `errorformat`. */
  info?: string;

  /** Rendered message text (`plaintext`/`wikitext`). */
  text?: string;

  /** Parsed message HTML (`html`). */
  html?: string;

  /** i18n message key (`raw`). */
  key?: string;

  /** i18n message parameters (`raw`). */
  params?: ApiMessageParam[];

  /**
   * Structured message data, present under a modern `errorformat` (the
   * default `bc` format merges it into the entry instead).
   */
  data?: { blockinfo?: ApiBlockInfo; [key: string]: unknown };

  /**
   * Block details, when the performer is blocked from the target page. Under
   * the default (`bc`) `errorformat` it is merged into the entry itself; a
   * modern one nests it under {@link ApiTagEntry.data}.
   */
  blockinfo?: ApiBlockInfo;
}

/** Response of `action=tag`. */
export interface ApiTagResponse extends ApiEnvelope {
  /** Result of `action=tag`; one entry per targeted revision, recent-change entry or log entry. */
  tag: ApiTagEntry[];
}
