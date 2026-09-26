/**
 * `action=userrights` response — adds/removes a user from groups; requires the
 * `userrights` token (not CSRF) and the `userrights` right. The result keys under
 * `userrights`.
 *
 * `added`/`removed` list the net group changes (both present, possibly empty).
 * `ApiUserrights` also echoes `user`/`userid` and, when `watchuser` took effect,
 * `watchlistexpiry`. No `old`/`new`/`changed` keys are emitted.
 *
 * @see https://www.mediawiki.org/wiki/API:User_group_membership
 */
import type { Expiry } from "../common";
import type { ApiEnvelope } from "../envelope";

/** Response of `action=userrights`. */
export interface ApiUserrightsResponse extends ApiEnvelope {
  /** Result of `action=userrights`. */
  userrights: {
    /** Canonical user name. */
    user: string;

    /** User id. */
    userid: number;

    /** Groups added by this call. */
    added: string[];

    /** Groups removed by this call. */
    removed: string[];

    /**
     * Echoes the `watchuser` request parameter (`false` when the target is not
     * a local user). Watching applies to the user's **user page**.
     *
     * @since MediaWiki 1.41
     */
    watchuser?: boolean;

    /**
     * Expiry of the watch on the user's user page — an ISO 8601 timestamp or
     * the `infinity` sentinel. Present only when `watchuser=1` took effect and a
     * `watchlistexpiry` was supplied; the value is read back from the watchlist.
     */
    watchlistexpiry?: Expiry;
  };
}
