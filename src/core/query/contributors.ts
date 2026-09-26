/**
 * `prop=contributors` — the distinct editors of a page, merged into the shared
 * {@link ApiPage} shape via declaration merging. Only logged-in contributors
 * (registered and temporary accounts) are listed; anonymous (IP) editors are
 * not, and only their distinct count is reported as `anoncontributors`.
 *
 * @see https://www.mediawiki.org/wiki/API:Contributors
 */
import type { QueryPage } from "./index";

/** One contributor entry: a logged-in (registered or temporary) editor. */
export interface ApiContributor {
  /** User id of the contributor. */
  userid: number;

  /** Contributor name (IPs never appear as contributors). */
  name: string;
}

/**
 * Fields `prop=contributors` contributes to {@link ApiPage}.
 * {@link ContributorsPage} projects exactly this set.
 */
export interface ApiPageContributors {
  /** Distinct logged-in contributors to the page (`prop=contributors`). */
  contributors?: ApiContributor[];

  /** Number of anonymous (IP) contributors to the page (`prop=contributors`). */
  anoncontributors?: number;
}

declare module "./index" {
  interface ApiPage extends ApiPageContributors {}
}

/**
 * A page projected to everything `prop=contributors` contributes, plus the
 * framework-injected {@link ApiPage.index}.
 */
export type ContributorsPage = QueryPage<keyof ApiPageContributors>;
