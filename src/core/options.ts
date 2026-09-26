/**
 * `action=options` response — changing (or resetting) user preferences. Set via
 * `optionname`/`optionvalue` (or `change=name=value&…`, or `reset=1`), with a
 * CSRF token.
 *
 * On success `options` is the plain string `"success"`. Errors surface as a
 * top-level {@link ApiErrorResponse}.
 *
 * @see https://www.mediawiki.org/wiki/API:Options
 */
import type { SuccessStatus } from "../common";
import type { ApiEnvelope } from "../envelope";

/** Response of `action=options`. */
export interface ApiOptionsResponse extends ApiEnvelope {
  /** Success sentinel (`"success"`); failures come back as a top-level error. */
  options: SuccessStatus;
}
