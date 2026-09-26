/**
 * `action=purge` response — refreshes the cached parsing of one or more pages;
 * the result is a top-level `purge` **array** (one entry per title). Titles the
 * pageSet could not resolve (invalid, special, interwiki, missing) come back as
 * problem entries without a `purged` flag.
 *
 * @see https://www.mediawiki.org/wiki/API:Purge
 */
import type { Flag } from "../common";
import type { ApiEnvelope } from "../envelope";
import type { ApiPageIdentity, ApiQueryNormalized, ApiQueryTitlePair } from "./query";

/** One purged page. */
export interface ApiPurgeEntry extends ApiPageIdentity {
  /** Whether the page was actually purged. A {@link Flag} (appears when purged). */
  purged?: Flag;

  /**
   * Whether a link table update was queued (with `forcelinkupdate` or
   * `forcerecursivelinkupdate`). A {@link Flag}.
   */
  linkupdate?: Flag;

  /** Revision id, for entries describing a `revids=` value that did not resolve. */
  revid?: number;

  /** Interwiki prefix, for entries describing an interwiki title. */
  iw?: string;
}

/** Response of `action=purge`. */
export interface ApiPurgeResponse extends ApiEnvelope {
  /** Result of `action=purge`; one entry per targeted page. */
  purge: ApiPurgeEntry[];

  /**
   * Title normalizations the pageSet applied before the purge (e.g. underscore
   * and capitalization fixes), same shape as `query.normalized`.
   */
  normalized?: ApiQueryNormalized[];

  /** Title conversions on a language-variant wiki, same shape as `query.converted`. */
  converted?: ApiQueryTitlePair[];

  /** Redirect resolutions (with `redirects=1`). */
  redirects?: ApiQueryTitlePair[];
}
