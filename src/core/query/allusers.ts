/**
 * `list=allusers` — enumerate all registered users, merged into
 * {@link ApiQueryResult} via declaration merging. `auprop` selects which fields
 * appear, and every entry carries `userid` and `name`.
 *
 * Entries share the `list=users` shape ({@link ApiUser}) minus the fields this
 * module can never emit: `gender`, `emailable`, `cancreate`,
 * `cancreateerror`, `groupmemberships`, `missing` and `systemuser`.
 *
 * @see https://www.mediawiki.org/wiki/API:Allusers
 */
import type { Timestamp } from "../../common";
import type { ApiUser } from "./users";

/** One user listed by `list=allusers`. */
export type ApiAllusersEntry = Omit<
  ApiUser,
  | "gender"
  | "emailable"
  | "cancreate"
  | "cancreateerror"
  | "groupmemberships"
  | "missing"
  | "systemuser"
  | "userid"
  | "name"
> & {
  /** User id. */
  userid: number;

  /** User name. */
  name: string;

  /**
   * Registration timestamp, or an **empty string** for accounts created before
   * registration timestamps were tracked (unlike the `null` of `list=users`).
   * `auprop=registration`.
   */
  registration?: Timestamp | "";

  /**
   * Effective actions over the last `$wgActiveUserDays` days. Emitted only with
   * `auactiveusers=1`.
   */
  recentactions?: number;
};

declare module "./index" {
  interface ApiQueryResult {
    /** Users listed by `list=allusers`. */
    allusers?: ApiAllusersEntry[];
  }
}
