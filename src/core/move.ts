/**
 * `action=move` response — result of renaming/moving a page, returned under a
 * top-level `move` object.
 *
 * Note under `formatversion=2`: `redirectcreated` / `moveoverredirect` /
 * `talkmoveoverredirect` are real booleans (present as `false`), `reason` is
 * `''` when none was supplied, and there is **no `result` key** on a
 * successful move. `subpages` is polymorphic: an array of per-subpage
 * outcomes when any subpage could be processed, or an object `{ errors }` when
 * the whole subpage move failed (e.g. the namespace forbids them).
 *
 * @see https://www.mediawiki.org/wiki/API:Move
 */
import type { ApiSpecMessage } from "../common";
import type { ApiEnvelope } from "../envelope";

/** One subpage move outcome within `subpages`/`subpages-talk`. */
export interface ApiMoveSubpage {
  /** Old subpage title. */
  from?: string;

  /** New subpage title, when the subpage moved. */
  to?: string;

  /** Why the subpage did not move, when it failed. */
  errors?: ApiSpecMessage[];
}

/** The object form of `subpages`, returned only when the whole move failed. */
export interface ApiMoveSubpageErrors {
  /** Why no subpage could be moved. */
  errors?: ApiSpecMessage[];
}

/** The `move` object of a successful `action=move` response. */
export interface ApiMoveResult {
  /** Original title. */
  from: string;

  /** New title. */
  to: string;

  /** Move reason (the edit summary); `''` when none was supplied. */
  reason: string;

  /** Whether a redirect was left at `from`. A real `boolean`. */
  redirectcreated: boolean;

  /** Whether the destination title already existed (redirect or not). A real `boolean`. */
  moveoverredirect: boolean;

  /** Original talk-page title (present with `movetalk=1`). */
  talkfrom?: string;

  /** New talk-page title (present with `movetalk=1`). */
  talkto?: string;

  /** Whether the talk-page destination already existed (redirect or not). A real `boolean`. */
  talkmoveoverredirect?: boolean;

  /** Why the talk-page move failed, instead of `talkfrom`/`talkto`. */
  "talkmove-errors"?: ApiSpecMessage[];

  /**
   * Subpage move outcome (`movesubpages=1`). `formatversion=2` returns either
   * an array of per-subpage outcomes or an object of errors, so both shapes are
   * allowed.
   */
  subpages?: ApiMoveSubpage[] | ApiMoveSubpageErrors;

  /** Talk subpage outcome (`movesubpages=1` + `movetalk=1`); same polymorphism as `subpages`. */
  "subpages-talk"?: ApiMoveSubpage[] | ApiMoveSubpageErrors;
}

/** Response of `action=move`. */
export interface ApiMoveResponse extends ApiEnvelope {
  /** Result of `action=move`. */
  move: ApiMoveResult;
}
