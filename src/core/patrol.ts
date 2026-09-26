/**
 * `action=patrol` response — marks a recent change as patrolled. Requires the
 * `patrol` right and the dedicated `patroltoken` (`meta=tokens&type=patrol`).
 *
 * @see https://www.mediawiki.org/wiki/API:Patrol
 */
import type { NamespaceIndex } from "../common";
import type { ApiEnvelope } from "../envelope";

/** The `patrol` object of a successful `action=patrol` response. */
export interface ApiPatrolResult {
  /** Recent-changes id that was patrolled. */
  rcid: number;

  /** Namespace of the patrolled page. */
  ns: NamespaceIndex;

  /** Title of the patrolled page. */
  title: string;
}

/** Response of `action=patrol`. */
export interface ApiPatrolResponse extends ApiEnvelope {
  /** Result of `action=patrol`. */
  patrol: ApiPatrolResult;
}
