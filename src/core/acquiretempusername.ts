/**
 * `action=acquiretempusername` response — acquires a temporary account
 * username and stashes it in the current session, so that the name is reused
 * when a later action auto-creates the account (also usable in previews).
 * Write mode: requires a POST, a logged-out session, temporary-account
 * auto-creation enabled on the wiki, and the `createaccount` right. Repeated
 * calls return the same stashed name.
 *
 * @see https://www.mediawiki.org/wiki/Help:Temporary_accounts
 * @since MediaWiki 1.41
 */
import type { ApiEnvelope } from "../envelope";

/** Response of `action=acquiretempusername`. */
export interface ApiAcquireTempUserNameResponse extends ApiEnvelope {
  /** The stashed temporary username (e.g. `~2024-9`). */
  acquiretempusername?: string;
}
