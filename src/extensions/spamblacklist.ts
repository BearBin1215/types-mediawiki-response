/**
 * Opt-in extension pack: **SpamBlacklist** (`action=spamblacklist`).
 *
 * Not in the default export. Standalone action response — import it directly:
 *
 * ```ts
 * import type { ApiSpamBlacklistResponse } from 'types-mediawiki-response/ext/spamblacklist';
 * ```
 *
 * `ApiSpamBlacklist` reports the check under `spamblacklist`: `result` is `ok`
 * (no match) or `blacklisted`; on a match it also returns `matches`, the list of
 * blacklist lines the URL hit.
 *
 * @see https://www.mediawiki.org/wiki/Extension:SpamBlacklist
 */
import type { ApiEnvelope } from "../envelope";

/** Response of `action=spamblacklist`. */
export interface ApiSpamBlacklistResponse extends ApiEnvelope {
  /** Result of `action=spamblacklist`. */
  spamblacklist: {
    /** Whether the URL matched the blacklist. Open union for forward compat. */
    result?: "ok" | "blacklisted" | (string & {});

    /** The matching blacklist lines (present when `result` is `blacklisted`). */
    matches?: string[];
  };
}
