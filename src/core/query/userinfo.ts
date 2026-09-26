/**
 * `meta=userinfo` — information about the *current effective user* (the caller's
 * session; an anonymous IP request returns the anon user), merged into
 * {@link ApiQueryResult}. Distinct from `list=users` (which queries arbitrary
 * named users). Widely used by gadgets/bots to branch on rights and prefs.
 *
 * `options` and `ratelimits` are open maps: `options` is site- and
 * user-specific, and `ratelimits` is keyed by action then by user bucket.
 *
 * @see https://www.mediawiki.org/wiki/API:Userinfo
 */
import type { ApiSpecMessage, ApiWatchlistLabel, Flag, Timestamp } from "../../common";
import type { ApiMessage } from "../../envelope";
import type { ApiUserCore } from "./users";

/** One entry of the `acceptlang` list (a browser `Accept-Language` parse). */
export interface ApiAcceptLang {
  /** Quality factor (0–1). */
  q?: number;

  /** Language code, or `*` for the fallback. `uiprop=acceptlang`. */
  code?: string;
}

/** A single rate-limit window under `uiprop=ratelimits`. */
export interface ApiRateLimit {
  /** Allowed hits in the window. */
  hits?: number;

  /** Window length in seconds. */
  seconds?: number;
}

/** The `userinfo` object of a `meta=userinfo` response. */
export interface ApiUserInfo extends ApiUserCore {
  /** User id; `0` for anonymous users. */
  id?: number;

  /** User name or IP address. */
  name?: string;

  /** `true` for an anonymous (IP) session. A {@link Flag}. */
  anon?: Flag;

  /**
   * `true` for a temporary (auto-created) account. A {@link Flag}.
   *
   * @since MediaWiki 1.42
   */
  temp?: Flag;

  /** Whether the user has unread talk-page messages. `uiprop=hasmsg`; a real `boolean`. */
  messages?: boolean;

  /**
   * Groups the (current) user may add/remove, and the self-service subsets.
   * `uiprop=changeablegroups`. Hyphenated keys are literal.
   */
  changeablegroups?: {
    /** Groups the user may grant to others. */
    add?: string[];

    /** Groups the user may revoke from others. */
    remove?: string[];

    /** Groups the user may grant to their own account. */
    "add-self"?: string[];

    /** Groups the user may revoke from their own account. */
    "remove-self"?: string[];
  };

  /**
   * Whether the user can create accounts. `uiprop=cancreateaccount`; a real
   * `boolean` (`false` when a policy prevents it), not a {@link Flag}.
   *
   * @since MediaWiki 1.40
   */
  cancreateaccount?: boolean;

  /**
   * Why account creation is not allowed, as message objects. `uiprop=cancreateaccount`;
   * present only when the `cancreateaccount` check does not pass.
   *
   * The shape follows the request's `errorformat`: under the default (`bc`)
   * format these are `{ message, params, code, type }` specs, under a modern
   * format they are full {@link ApiMessage}s.
   *
   * @since MediaWiki 1.40
   */
  cancreateaccounterror?: ApiSpecMessage[] | ApiMessage[];

  /** The user's preferences map (open; site/user specific). `uiprop=options`. */
  options?: Record<string, string | number | boolean | null>;

  /** Registration timestamp. `uiprop=registrationdate`. */
  registrationdate?: Timestamp;

  /** Timestamp of the user's latest edit. `uiprop=latestcontrib`; absent with no edits. */
  latestcontrib?: Timestamp;

  /** Effective rate limits keyed by action then bucket. `uiprop=ratelimits`. */
  ratelimits?: Record<string, Record<string, ApiRateLimit>>;

  /**
   * Rate limits that *would* apply to this user, ignoring the exemptions they
   * actually hold (e.g. `noratelimit`). Same shape as {@link ratelimits};
   * `uiprop=theoreticalratelimits`.
   */
  theoreticalratelimits?: Record<string, Record<string, ApiRateLimit>>;

  /** Parsed `Accept-Language`. `uiprop=acceptlang`. */
  acceptlang?: ApiAcceptLang[];

  /**
   * Custom watchlist exclusion/inclusion labels. `uiprop=watchlistlabels`;
   * requires `$wgEnableWatchlistLabels`, and `[]` when none are set.
   *
   * @since MediaWiki 1.46
   */
  watchlistlabels?: ApiWatchlistLabel[];

  /**
   * Number of unread watchlist notifications; the string `1000+` once the
   * count reaches the cap. `uiprop=unreadcount`.
   */
  unreadcount?: number | string;

  /**
   * Real name. `uiprop=realname`; also absent when `$wgHiddenPrefs` includes
   * `realname`.
   */
  realname?: string;

  /**
   * The user's email address. `uiprop=email`, and only for a caller with
   * `viewmyprivateinfo`. An **empty string** when the address is unset or
   * hidden, otherwise the address.
   */
  email?: string;

  /** When the email address was confirmed. `uiprop=email`; absent when never confirmed. */
  emailauthenticated?: Timestamp;

  /**
   * Whether the user is attached on the wiki named by the `attachedwiki`
   * parameter, keyed by provider. Requires `uiprop=centralids` together with
   * the `attachedwiki` parameter.
   */
  attachedwiki?: Record<string, boolean>;
}

declare module "./index" {
  interface ApiQueryResult {
    /** The current effective user (`meta=userinfo`). */
    userinfo?: ApiUserInfo;
  }
}
