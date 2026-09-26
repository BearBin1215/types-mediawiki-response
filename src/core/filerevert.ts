/**
 * `action=filerevert` response — reverts a file to an older archived version;
 * needs CSRF, title-level `edit`/`upload` rights on the file, and `reupload`
 * (or `reupload-own` when reverting one's own upload). The result keys under
 * `filerevert`: `result` is `Success`, or `Failure` with an in-band `errors`
 * array (a per-item outcome, not a top-level {@link ApiErrorResponse}).
 *
 * @see https://www.mediawiki.org/wiki/API:Filerevert
 */
import type { ApiSpecMessage } from "../common";
import type { ApiEnvelope } from "../envelope";

/** Response of `action=filerevert`. */
export interface ApiFileRevertResponse extends ApiEnvelope {
  /** Result of `action=filerevert`. */
  filerevert: {
    /** Outcome of the revert. */
    result: "Success" | "Failure" | (string & {});

    /** In-band messages when the revert did not apply. */
    errors?: ApiSpecMessage[];
  };
}
