/**
 * `action=imagerotate` response — rotates a file by 90/180/270°, creating a new
 * archived version; needs CSRF and title-level `edit`/`upload` rights on the
 * file. The result is a top-level `imagerotate` **array** with one entry per
 * targeted file.
 *
 * A per-file failure is reported in-band (`result:"Failure"` plus an `errors`
 * array), not as a top-level error: the hard checks fail with
 * `apierror-filedoesnotexist` / `apierror-filetypecannotberotated` /
 * `apierror-filenopath`, and an otherwise failed rotation/upload surfaces the
 * message codes of its Status (e.g. `backend-fail-*` from file storage).
 * Titles the pageSet could not resolve (invalid, special, interwiki, missing)
 * come back as problem entries without a `result`.
 *
 * @see https://www.mediawiki.org/wiki/API:Imagerotate
 */
import type { ApiSpecMessage } from "../common";
import type { ApiEnvelope, ApiMessage } from "../envelope";
import type { ApiPageIdentity } from "./query";

/** One file entry of an `action=imagerotate` response. */
export interface ApiImageRotateEntry extends ApiPageIdentity {
  /** Page id of the file (keyed as `id`, not `pageid`). */
  id?: number;

  /** Revision id, for entries describing a `revid=` that did not resolve. */
  revid?: number;

  /** Interwiki prefix, for entries describing an interwiki title. */
  iw?: string;

  /** Per-file outcome. */
  result?: "Success" | "Failure" | (string & {});

  /** In-band messages when the rotation failed, shaped per the request's `errorformat`. */
  errors?: ApiSpecMessage[] | ApiMessage[];
}

/** Response of `action=imagerotate`. */
export interface ApiImageRotateResponse extends ApiEnvelope {
  /** Result of `action=imagerotate`; one entry per rotated image. */
  imagerotate: ApiImageRotateEntry[];
}
