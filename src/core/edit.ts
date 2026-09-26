/**
 * `action=edit` response — result of a page edit, returned under a top-level
 * `edit` object.
 *
 * Fields present depend on the outcome:
 * - create: `new: true` plus `oldrevid: 0` / `newrevid` / `newtimestamp`;
 * - changed: `oldrevid` / `newrevid` / `newtimestamp` (no `new`);
 * - nochange: `nochange: true`, no revision ids.
 * A save aborted by a hook that carries status data (ConfirmEdit's captcha
 * challenge) returns the in-band failure branch: `result: "Failure"` plus that
 * data and no revision ids. Most hard failures (bad token, protected page,
 * `createonly` on an existing page) surface as a top-level
 * {@link ApiErrorResponse}, not `result: "Failure"`.
 *
 * @see https://www.mediawiki.org/wiki/API:Edit
 */
import type { ContentModel, Flag, Timestamp } from "../common";
import type { ApiEnvelope } from "../envelope";

/** The `edit` object of an `action=edit` response. */
export interface ApiEditResult {
  /** Outcome of the request. Open union; the failure branch is documented below. */
  result: "Success" | "Failure" | (string & {});

  /** Page id of the edited page. */
  pageid?: number;

  /** Normalized page title. */
  title?: string;

  /** Content model of the page. */
  contentmodel?: ContentModel;

  /** `true` when the edit created the page. A {@link Flag}. */
  new?: Flag;

  /** `true` when the supplied text equaled the current text. A {@link Flag}. */
  nochange?: Flag;

  /** `true` when the page was added to the user's watchlist. A {@link Flag}. */
  watched?: Flag;

  /**
   * When the watch applied by this edit expires. Only alongside
   * {@link watched}, and only when the watch carries an expiry.
   */
  watchlistexpiry?: Timestamp;

  /** Revision id before the edit; `0` when the page was created. */
  oldrevid?: number;

  /** Revision id created by the edit. */
  newrevid?: number;

  /** Timestamp of the new revision. */
  newtimestamp?: Timestamp;

  /**
   * `true` when the edit auto-created a temporary account for the (formerly
   * anonymous) editor. A {@link Flag}.
   *
   * @since MediaWiki 1.41
   */
  tempusercreated?: Flag;

  /**
   * Full URL to redirect to after a temporary-account auto-creation.
   * Present only alongside {@link tempusercreated}.
   *
   * @since MediaWiki 1.41
   */
  tempusercreatedredirect?: string;

  /** Machine-readable failure code. */
  code?: string;

  /** Human-readable failure description. */
  info?: string;

  /**
   * Captcha challenge returned when ConfirmEdit aborted the save. Present only
   * in the in-band failure branch; {@link ApiEditCaptcha.id} and
   * {@link ApiEditCaptcha.question} are per-request random values.
   */
  captcha?: ApiEditCaptcha;
}

/** The captcha challenge of a `result: "Failure"` edit, as emitted by ConfirmEdit. */
export interface ApiEditCaptcha {
  /** Captcha implementation, e.g. `simple` (arithmetic challenge) or `image`. Open union. */
  type?: string;

  /** MIME type the challenge renders as, e.g. `text/plain`, `image/png`, `text/html`. */
  mime?: string;

  /** Cache key of the pending challenge; pass it back as `captchaid` alongside the `captchaword` answer. */
  id?: string;

  /** Challenge text: an arithmetic expression for the sample implementation, the prompt for a question captcha. */
  question?: string;
}

/** Response of `action=edit`. */
export interface ApiEditResponse extends ApiEnvelope {
  /** Result of `action=edit`. */
  edit: ApiEditResult;
}
