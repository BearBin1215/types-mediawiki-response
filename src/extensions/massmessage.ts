/**
 * Opt-in extension pack: **MassMessage** (`prop=mmcontent`,
 * `action=massmessage`, `action=editmassmessagelist`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/massmessage';
 * ```
 *
 * Delivery lists are pages with the `MassMessageListContent` content model.
 * `editmassmessagelist` reports `result: "Done"` (instead of `"Success"`) when
 * any submitted target was invalid: `invalidadd` lists them as
 * `{'*': <target>, <error code>: ''}` objects, while `invalidremove` lists the
 * plain submitted strings.
 *
 * fv2 notes: the `missing` marker on added targets serializes as `""`, not
 * `true`. Delivering (`action=massmessage`) replies `result: "success"` —
 * lowercase, unlike the edit module.
 *
 * @see https://www.mediawiki.org/wiki/Extension:MassMessage
 */
import type { SuccessStatus } from "../common";
import type { ApiEnvelope } from "../envelope";

/** The `mmcontent` object of a `prop=mmcontent` response. */
export interface ApiMmContent {
  /**
   * Delivery list description as stored; the query module returns it verbatim,
   * so it is `null` when the list carries none.
   */
  description: string | null;

  /**
   * Targets as user-facing strings — page titles, and `title@site` for
   * cross-wiki targets (only when `$wgAllowGlobalMessaging` allows them).
   */
  targets: string[];
}

/** One valid target echoed back by `action=editmassmessagelist`. */
export interface ApiMassMessageTarget {
  /** Canonical page title of the target. */
  title?: string;

  /** Domain of the target wiki, e.g. `www.mediawiki.org`; absent for local targets. */
  site?: string;

  /** Empty-string marker for local targets whose page does not exist (fv2 quirk). */
  missing?: string;
}

/**
 * One invalid target of `invalidadd`: the submitted string under `*` plus an
 * empty-string entry per error code (e.g. `invalidsite`, `invalidtitle`).
 * `invalidremove` reports plain strings and an unchanged description comes back
 * as a plain string under `invaliddescription`.
 */
export interface ApiMassMessageInvalidTarget {
  /** The submitted target string. */
  "*": string;

  /** Error codes are added as empty-string keys (e.g. `invalidsite`). */
  [error: string]: string;
}

/** The `editmassmessagelist` object of an `action=editmassmessagelist` response. */
export interface ApiEditMassMessageListResult {
  /**
   * `Success` when everything applied; `Done` when any submitted target was
   * invalid (see {@link invalidadd} / {@link invalidremove}).
   */
  result: "Success" | "Done" | (string & {});

  /** Targets actually added (deduplicated, canonicalized). */
  added?: ApiMassMessageTarget[];

  /** Targets removed. */
  removed?: ApiMassMessageTarget[];

  /** Submitted targets that could not be parsed or did not match a list entry. */
  invalidadd?: ApiMassMessageInvalidTarget[];

  /** Submitted `remove` strings that were not valid list targets. */
  invalidremove?: string[];

  /** The new description, when it changed. */
  description?: string;

  /** The submitted description when it was identical to the current one. */
  invaliddescription?: string;
}

/** Response of `action=editmassmessagelist`. */
export interface ApiEditMassMessageListResponse extends ApiEnvelope {
  /** Result of `action=editmassmessagelist`. */
  editmassmessagelist: ApiEditMassMessageListResult;
}

/** The `massmessage` object of an `action=massmessage` response. */
export interface ApiMassMessageResult {
  /** `success` (lowercase) when delivery was queued. */
  result: SuccessStatus;

  /** Number of targets the message was queued for. */
  count: number;
}

/** Response of `action=massmessage` (requires the `massmessage` right). */
export interface ApiMassMessageResponse extends ApiEnvelope {
  /** Result of `action=massmessage`. */
  massmessage: ApiMassMessageResult;
}

declare module "types-mediawiki-response" {
  interface ApiPage {
    /** Parsed delivery list content (only on `MassMessageListContent` pages). */
    mmcontent?: ApiMmContent;
  }
  interface ApiSiteStatistics {
    /** Delivery jobs queued for later processing (hook-injected). */
    "queued-massmessages"?: number;
  }

  interface ContentModelExtension {
    /** Content model of a delivery-list page. */
    MassMessageListContent: "MassMessageListContent";
  }
}
