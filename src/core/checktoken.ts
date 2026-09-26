/**
 * `action=checktoken` response — validates a token the client already holds
 * (e.g. before a write), returning `checktoken.result`. No write side effects.
 *
 * `ApiCheckToken` sets `result` to `valid`, `expired` (a token older than
 * `maxtokenage`), or `invalid`. `generated` is decoded from the submitted
 * token itself (MediaWiki tokens embed their generation time), so it appears
 * whenever the token carries a timestamp — an old token reports its own age.
 * Modeled as an open union for forward compatibility.
 *
 * @see https://www.mediawiki.org/wiki/API:Checktoken
 */
import type { Timestamp } from "../common";
import type { ApiEnvelope } from "../envelope";

/** Result values of {@link ApiCheckTokenResponse}. */
export type ApiCheckTokenResult = "valid" | "expired" | "invalid" | (string & {});

/** Response of `action=checktoken`. */
export interface ApiCheckTokenResponse extends ApiEnvelope {
  /** Result of `action=checktoken`. */
  checktoken: {
    /** Outcome of the token check. */
    result: ApiCheckTokenResult;

    /**
     * ISO-8601 timestamp when the submitted token was generated; present
     * whenever the token embeds one (including old tokens).
     */
    generated?: Timestamp;
  };
}
