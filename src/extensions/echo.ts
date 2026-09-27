/**
 * Opt-in extension pack: **Echo / Notifications** (`meta=notifications`,
 * `meta=unreadnotificationpages`, `action=echomute`, `action=echocreateevent`,
 * `action=echoarticlereminder`, `action=echopushsubscriptions`).
 * `echomarkread`/`echomarkseen` are top-level actions (not `meta=` modules)
 * that report their result under `query`.
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/echo';
 * ```
 *
 * The `action=` responses (`echomute`, `echocreateevent`) are standalone — import them by name.
 *
 * `ApiEchoNotification` is one notification row; the unread counts (localized
 * `count` string next to numeric `rawcount`) live on the result objects and on
 * the `echomarkread` response.
 * `ApiEchoMarkSeen` returns the server "all seen" timestamp. Pass
 * `timestampformat=ISO_8601` to avoid the deprecated MW-timestamp format.
 *
 * fv2 notes worth knowing: `count` is a **localized string** while `rawcount` is a
 * number; `notifications.continue` is explicitly `null` when there is nothing left
 * to page through (not an omitted key); with `notgroupbysection=1` the result is
 * keyed by `alert`/`message` instead of carrying a flat `list`; and
 * `notformat=model` replaces the rendered strings with a structured
 * {@link ApiEchoNotificationModel} body.
 *
 * @see https://www.mediawiki.org/wiki/Extension:Echo
 */
import type { NamespaceIndex, SuccessResult, SuccessStatus, Timestamp } from "../common";
import type { ApiEnvelope } from "../envelope";

/** A notification count: numeric `rawcount` plus a localized `count` string. */
export interface ApiEchoNotificationCount {
  /** Raw numeric count. */
  rawcount: number;

  /** Count formatted for display (a string; e.g. `"0"`, `"1,234"`). */
  count: string;
}

/** The `echomarkread` object (returned under `query` by `action=echomarkread`). */
export interface ApiQueryEchoMarkRead {
  /** Echo status string; `success` on completion. */
  result: SuccessStatus;

  /** Per-wiki error from a failed foreign (cross-wiki) subrequest. */
  errors?: {
    /** Error reported for the foreign wiki the key names. */
    [wiki: string]: {
      /** Machine-readable error code. */
      code?: string;

      /** Human-readable description from the foreign wiki. */
      info?: string;

      /** Extra structured data the foreign error carried. */
      [key: string]: unknown;
    };
  };

  /** Remaining unread `alert`-section count. */
  alert: ApiEchoNotificationCount;

  /** Remaining unread `message`-section count. */
  message: ApiEchoNotificationCount;

  /** Overall remaining unread count. */
  rawcount: number;

  /** Overall remaining unread count, formatted. */
  count: string;
}

/** The `echomarkseen` object (returned under `query` by `action=echomarkseen`). */
export interface ApiQueryEchoMarkSeen {
  /** Echo status string; `success` on completion. */
  result?: SuccessStatus;

  /** The "all notifications seen" timestamp just recorded. */
  timestamp?: Timestamp;
}

/** Every timestamp form Echo attaches to a notification (`timestamp=` object). */
export interface ApiEchoTimestamp {
  /** ISO 8601 (UTC), e.g. `2024-01-15T08:30:00Z`. */
  utciso8601?: Timestamp;

  /** Unix epoch seconds as a number. */
  utcunix?: number;

  /** Unix epoch seconds as a **string**, in the receiving user's local timezone ({@link utcunix} is UTC). */
  unix?: string;

  /** MediaWiki 14-digit timestamp. */
  utcmw?: string;

  /** MediaWiki 14-digit timestamp in the user's local timezone (`utcmw` is the UTC one). */
  mw?: string;

  /**
   * Localized date-group header: `Today`/`Yesterday`, or a pretty date such as
   * `May 10` for notifications older than 48 hours.
   */
  date?: string;
}

/** The title of the page a notification points at. */
export interface ApiEchoTitle {
  /** Full title with namespace prefix. */
  full?: string;

  /** Localized namespace prefix (`""` in the main namespace). */
  namespace?: string;

  /** Namespace index; hyphenated key, spelled literally. */
  "namespace-key"?: number;

  /** Title without the namespace prefix. */
  text?: string;
}

/** The user whose action triggered a notification. */
export interface ApiEchoAgent {
  /** User id. */
  id?: number;

  /** User name. */
  name?: string;

  /**
   * Suppression marker: when the agent's identity is hidden, the agent object
   * collapses to `{ userhidden: "" }` and carries no other keys.
   */
  userhidden?: "";
}

/** One link attached to a model-format notification. */
export interface ApiEchoNotificationLink {
  /** Link text. */
  label?: string;

  /** Target URL. */
  url?: string;
}

/** Structured payload a notification's presenter exposes (`notformat=model`). */
export interface ApiEchoNotificationModel {
  /** Rendered body HTML. */
  body?: string;

  /** Short header line. */
  header?: string;

  /** Condensed header for the flyout. */
  compactHeader?: string;

  /** Icon name from the Echo icon registry. */
  icon?: string;

  /** Icon URL. */
  iconUrl: string;

  /** Primary and secondary action links. */
  links?: {
    /** The notification's main action. */
    primary?: ApiEchoNotificationLink;

    /** Secondary actions offered with it. */
    secondary?: ApiEchoNotificationLink[];
  };

  /** Event ids this notification bundles, when it stands in for a group. */
  bundledIds?: number[];
}

/** One notification row (`meta=notifications`, `notprop=list`). */
export interface ApiEchoNotification {
  /** Wiki the notification came from — cross-wiki notifications carry other sites. */
  wiki?: string;

  /** Notification id; feed it back to `action=echomarkread` or `action=echomute`. */
  id?: number;

  /** Event type, e.g. `mention`, `thank-you-edit`, `page-linked`. Open union. */
  type?: string;

  /** Event category, usually mirrors {@link type}. */
  category?: string;

  /** Section the notification lives in. */
  section?: "alert" | "message" | (string & {});

  /** Timestamp in every form Echo publishes. */
  timestamp?: ApiEchoTimestamp;

  /** Ids of the notifications bundled into this one (bundled notifications present). */
  bundledIds?: number[];

  /** Presentation variant of the event, when the event carries one. */
  variant?: string;

  /** Target page of the notification. */
  title?: ApiEchoTitle;

  /** Actor that triggered it. */
  agent?: ApiEchoAgent;

  /** Revision id associated with the event. */
  revid?: number;

  /** When the notification was marked read (MediaWiki 14-digit timestamp). */
  read?: string;

  /** Page ids the notification targets (empty array when there are none). */
  targetpages?: number[];

  /**
   * Rendered notification body, present whenever `notformat` is given. The
   * shape depends on the format: `model` returns a structured
   * {@link ApiEchoNotificationModel} object, the other formats (`special`,
   * plus the deprecated `flyout`/`html`) return an HTML string.
   */
  "*"?: ApiEchoNotificationModel | string;

  /**
   * The notifications bundled into this one, formatted like the parent row
   * (expandable bundles; requires `notformat`).
   */
  bundledNotifications?: ApiEchoNotification[];
}

/** A `count` / `list` slice, either flat or grouped per section. */
export interface ApiEchoNotificationSection {
  /** Notification rows. */
  list?: ApiEchoNotification[];

  /** Continue cursor for this section, or `null` when the list is complete. */
  continue?: string | null;

  /** Raw numeric unread count. */
  rawcount?: number;

  /** Unread count formatted for display. */
  count?: string;

  /**
   * Last-seen timestamp. At the top level of `notifications` (flat mode) this
   * is a map keyed by section name; inside a per-section object (grouped mode,
   * `notgroupbysection=1`) it is a single ISO timestamp.
   */
  seenTime?: Timestamp | Record<string, Timestamp>;
}

/** The `notifications` object (returned under `query` by `meta=notifications`). */
export interface ApiQueryEchoNotifications extends ApiEchoNotificationSection {
  /**
   * Per-section results, present only with `notgroupbysection=1` — then
   * {@link ApiEchoNotificationSection.list} sits inside each section instead.
   */
  alert?: ApiEchoNotificationSection;

  /** Message-section grouping; see {@link alert}. */
  message?: ApiEchoNotificationSection;
}

/** One wiki's unread-notification summary inside `unreadnotificationpages`. */
export interface ApiEchoUnreadSource {
  /** Article-path base of the source wiki. */
  base?: string;

  /** URL of the source wiki's `api.php` endpoint. */
  url?: string;

  /** Display name of the source wiki (localized project name, sitename fallback). */
  title?: string;
}

/** Per-wiki unread summary keyed by page title. */
export interface ApiEchoUnreadPage {
  /**
   * Page title; `null` for the pseudo-row aggregating notifications not tied
   * to any page (only appears with `unpgrouppages` off).
   */
  title?: string | null;

  /** Namespace index (only with `unpgrouppages`). */
  ns?: NamespaceIndex;

  /** Title without the namespace prefix (only with `unpgrouppages`). */
  unprefixed?: string;

  /**
   * Subject- and talk-page titles this count covers (only with
   * `unpgrouppages`); contains `null` for the requesting user's own page.
   */
  pages?: (string | null)[];

  /** Unread notifications for this page. */
  count?: number;
}

/** One wiki's entry in `meta=unreadnotificationpages` (keyed by wiki id). */
export interface ApiEchoUnreadWiki {
  /** Where the notifications came from. */
  source?: ApiEchoUnreadSource;

  /** Per-page unread counts. */
  pages?: ApiEchoUnreadPage[];

  /**
   * Total unread notifications on the wiki (badge-count semantics, capped at
   * the notifications-badge limit); not the sum of {@link ApiEchoUnreadPage.count}.
   */
  totalCount?: number;
}

/**
 * The `unreadnotificationpages` object: a map from wiki id (e.g.
 * `mediawikiwiki`) to that wiki's unread summary. A PHP map, so an empty result
 * serializes as `[]`.
 */
export interface ApiQueryEchoUnreadPages {
  /** Unread summary for the wiki the key names. */
  [wikiId: string]: ApiEchoUnreadWiki | unknown[] | undefined;
}

/**
 * Response of `action=echomute`. The module writes a plain status **string**
 * (no wrapper object): `success` after muting or unmuting.
 */
export interface ApiEchoMuteResponse extends ApiEnvelope {
  /** Plain status string rather than a wrapper object; `success` after muting or unmuting. */
  echomute: SuccessStatus;
}

/**
 * Response of `action=echocreateevent`. Shape of the `ApiEchoCreateEvent`
 * module (off by default — `$wgEchoEnableApiEvents`).
 *
 * @since MediaWiki 1.43
 */
export interface ApiEchoCreateEventResponse extends ApiEnvelope {
  /** Result of `action=echocreateevent`. */
  echocreateevent: {
    /** `success` when the event was stored. */
    result?: SuccessStatus;
  };
}

/**
 * The `echoarticlereminder` object (returned under `query`). The module is
 * only registered when `$wgAllowArticleReminderNotification` is on.
 */
export interface ApiQueryEchoArticleReminder {
  /** `success` when the reminder was scheduled. */
  result?: SuccessStatus;
}

/**
 * Responses of `action=echopushsubscriptions`: the `command` value is the
 * response key (`create` or `delete`). The module is experimental and only
 * registered when `$wgEchoEnablePush` is on.
 */
export interface ApiEchoPushSubscriptionsResponse extends ApiEnvelope {
  /** `command=create` — the subscription was stored. */
  create?: {
    /** `Success` when the subscription was stored. */
    result?: SuccessResult;
  };

  /** `command=delete` — the subscription was removed. */
  delete?: {
    /** `Success` when the subscription was removed. */
    result?: SuccessResult;
  };
}

declare module "types-mediawiki-response" {
  interface ApiQueryResult {
    /** Notifications waiting for the user, with unread counts (`meta=notifications`). */
    notifications?: ApiQueryEchoNotifications;

    /** Unread-notification pages grouped per wiki (`meta=unreadnotificationpages`). */
    unreadnotificationpages?: ApiQueryEchoUnreadPages;

    /** Reply to `action=echomarkread`, returned under `query`. */
    echomarkread?: ApiQueryEchoMarkRead;

    /** Reply to `action=echomarkseen`, returned under `query`. */
    echomarkseen?: ApiQueryEchoMarkSeen;

    /** Reply to `action=echoarticlereminder`, returned under `query`. */
    echoarticlereminder?: ApiQueryEchoArticleReminder;
  }
}
