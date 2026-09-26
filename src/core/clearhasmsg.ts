/**
 * `action=clearhasmsg` response — clears the "you have new messages" flag on the
 * current (logged-in) user. The payload is a bare status string under the
 * `clearhasmsg` key (a `success` value in 1.43; historically an empty string).
 *
 * Takes no token; passing one draws an `Unrecognized parameter: token` warning.
 *
 * @see https://www.mediawiki.org/wiki/API:Watch#Clearing_the_new_messages_flag
 */
import type { ApiEnvelope } from "../envelope";

/** Response of `action=clearhasmsg`. */
export interface ApiClearHasMsgResponse extends ApiEnvelope {
  /** Status string; `success` on 1.43 (older builds returned an empty string). */
  clearhasmsg: string;
}
