/**
 * Opt-in extension pack: **TitleBlacklist** (`action=titleblacklist`).
 *
 * Not in the default export. Standalone action response — import it directly:
 *
 * ```ts
 * import type { ApiTitleBlacklistResponse } from 'types-mediawiki-response/ext/titleblacklist';
 * ```
 *
 * `ApiTitleBlacklist` reports the check under `titleblacklist`: `result` is `ok`
 * (no match) or `blacklisted`; on a match it returns the offending `line` plus a
 * human `reason` and the `message` key.
 *
 * @see https://www.mediawiki.org/wiki/Extension:TitleBlacklist
 */
import type { ApiEnvelope } from "../envelope";

/** Response of `action=titleblacklist`. */
export interface ApiTitleBlacklistResponse extends ApiEnvelope {
  /** Result of `action=titleblacklist`. */
  titleblacklist: {
    /** Whether the title matched the blacklist. Open union for forward compat. */
    result: "ok" | "blacklisted" | (string & {});

    /** Reason shown to the user (parsed HTML or plain text); only on a match. */
    reason?: string;

    /** Message key of the match: the entry's custom message when set, else `titleblacklist-forbidden-{action}` (`create` uses the `edit` variant). Only on a match. */
    message?: string;

    /** The matching blacklist line, HTML-escaped. Only on a match. */
    line?: string;
  };
}
