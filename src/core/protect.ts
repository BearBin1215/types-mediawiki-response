/**
 * `action=protect` response — changes a page's protection levels. Requires the
 * `protect` right and a CSRF token. Returns the applied protection under a
 * top-level `protect` object.
 *
 * `protections` is a per-restriction array: each entry keys the restriction type
 * (e.g. `edit`, `move`) to its level, alongside that restriction's `expiry`
 * (a timestamp or `infinite`).
 *
 * @see https://www.mediawiki.org/wiki/API:Protect
 */
import type { Flag } from "../common";
import type { ApiEnvelope } from "../envelope";

/** One applied protection (`type` → level, plus `expiry`). */
export interface ApiProtectionEntry {
  /** Edit-protection level (right/group name), when the `edit` restriction is set. */
  edit?: string;

  /** Move-protection level, when the `move` restriction is set. */
  move?: string;

  /** Create-protection level, when the `create` restriction is set. */
  create?: string;

  /** Upload-protection level, when the `upload` restriction is set. */
  upload?: string;

  /** Expiry for this restriction, or `infinite`. */
  expiry: string;

  /** Extension-provided restriction types are carried through as string levels. */
  [type: string]: string | undefined;
}

/** The `protect` object of an `action=protect` response. */
export interface ApiProtectResult {
  /** Protected page title. */
  title: string;

  /** Protection reason (echoed back). */
  reason: string;

  /** The protection cascades to the pages transcluded here (`cascade=1`). A {@link Flag}. */
  cascade?: Flag;

  /** Applied restrictions, one entry per restriction type. */
  protections: ApiProtectionEntry[];
}

/** Response of `action=protect`. */
export interface ApiProtectResponse extends ApiEnvelope {
  /** Result of `action=protect`. */
  protect: ApiProtectResult;
}
