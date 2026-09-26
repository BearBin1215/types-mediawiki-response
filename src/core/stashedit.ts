/**
 * `action=stashedit` response — stages an edit to the pending-changes stash
 * (without publishing); needs CSRF and a `baserevid`. The result is exactly
 * `{ status, texthash? }`.
 *
 * `status` is `stashed` on success; `texthash` identifies the stashed content so
 * it can be referenced by a later `action=edit` (`stashedtexthash`). It is
 * omitted when rate-limited and no `stashedtexthash` was supplied.
 *
 * @see https://www.mediawiki.org/wiki/API:Stashedit
 */
import type { ApiEnvelope } from "../envelope";

/** Response of `action=stashedit`. */
export interface ApiStashEditResponse extends ApiEnvelope {
  /** Result of `action=stashedit`. */
  stashedit: {
    /**
     * Stash outcome: `stashed`, `editconflict` (merge3 failed), `ratelimited`,
     * `busy`, `uncacheable`, `error_parse` or `error_cache`. Open union for
     * forward compat.
     */
    status:
      | "stashed"
      | "editconflict"
      | "ratelimited"
      | "busy"
      | "uncacheable"
      | "error_parse"
      | "error_cache"
      | (string & {});

    /** Hash identifying the stashed text for a later `action=edit`. */
    texthash?: string;
  };
}
