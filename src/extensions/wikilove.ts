/**
 * Opt-in extension pack: **WikiLove** (`action=wikilove`).
 *
 * A standalone action response — import and use it directly (no declaration
 * merging needed):
 *
 * ```ts
 * import type { ApiWikiLoveResponse } from 'types-mediawiki-response/ext/wikilove';
 * ```
 *
 * Posts a WikiLove message to the given user's talk page and reports where the
 * message landed. On an ordinary wikitext talk page this is an internal
 * `action=edit` with `section=new`, and the `wikilove` tag reaches the new
 * revision through a deferred update; when Flow or Liquid Threads owns the talk
 * page the module posts through that extension and applies no tag. Failures
 * (unknown target, blocked talk page, …) are top-level
 * {@link ApiErrorResponse}s.
 *
 * fv2 notes: the reply is a single `redirect` object at the root — not a
 * `result` wrapper; `pageName` is the DB key form (underscores).
 *
 * @see https://www.mediawiki.org/wiki/Extension:WikiLove
 */
import type { ApiEnvelope } from "../envelope";

/** The `redirect` object of an `action=wikilove` response. */
export interface ApiWikiLoveRedirect {
  /** DB key of the talk page the message was posted to, e.g. `User_talk:Example`. */
  pageName: string;

  /**
   * Section anchor built from the sanitized subject: whitespace becomes `_` and
   * a `%XX` escape becomes `%25XX`.
   */
  fragment: string;
}

/** Response of `action=wikilove`. */
export interface ApiWikiLoveResponse extends ApiEnvelope {
  /** Result of `action=wikilove`; this module keys its payload `redirect`. */
  redirect: ApiWikiLoveRedirect;
}
