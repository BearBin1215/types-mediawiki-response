/**
 * `action=emailuser` response — sends an email to another user; needs CSRF and
 * both the sender's `sendemail` right and a confirmed address. The result keys
 * under `emailuser`.
 *
 * `ApiEmailUser` reports the outcome **in-band** (not as a top-level
 * {@link ApiErrorResponse}): `result` is `Success`, `Warnings`, or `Failure`,
 * and `warnings`/`errors` carry message specs. The keys are dropped when the
 * status carries none of that kind — except under the default `bc`
 * `errorformat`, which keeps them as empty arrays. A `Failure` also occurs on
 * a wiki without a mail transport.
 *
 * @see https://www.mediawiki.org/wiki/API:Email
 */
import type { ApiSpecMessage } from "../common";
import type { ApiEnvelope } from "../envelope";

/** Response of `action=emailuser`. */
export interface ApiEmailUserResponse extends ApiEnvelope {
  /** Result of `action=emailuser`. */
  emailuser: {
    /** Whether the message was accepted, or accepted with warnings, or failed. */
    result: "Success" | "Warnings" | "Failure" | (string & {});

    /** Non-fatal messages (e.g. subject/text transformations). */
    warnings?: ApiSpecMessage[];

    /** In-band delivery errors (present when `result` is `Failure`). */
    errors?: ApiSpecMessage[];
  };
}
