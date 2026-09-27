/**
 * Opt-in extension pack: **Thanks** (`action=thank`).
 *
 * Not in the default export. This is a standalone action response — import and use
 * it directly (no declaration merging needed):
 *
 * ```ts
 * import type { ApiThankResponse } from 'types-mediawiki-response/ext/thanks';
 * ```
 *
 * A successful response is a top-level `result` object (not a `thank` key);
 * every failure (invalid revision, self-thanks, rate limit …) is a top-level
 * {@link ApiErrorResponse}. `success` is the number `1`.
 *
 * @see https://www.mediawiki.org/wiki/Extension:Thanks
 */
import type { ApiEnvelope } from "../envelope";

/** The `result` object of a successful `action=thank`. */
export interface ApiThankResult {
  /** `1` when the thanks was recorded (also for a duplicate thanks, which pretends success). */
  success: number;

  /** Canonical name of the thanked user. */
  recipient: string;
}

/** Response of `action=thank`. */
export interface ApiThankResponse extends ApiEnvelope {
  /** Result of `action=thank`; this module keys its payload `result`, not `thank`. */
  result: ApiThankResult;
}
