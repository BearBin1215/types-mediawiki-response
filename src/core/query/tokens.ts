/**
 * `meta=tokens` — CSRF and action tokens, merged into {@link ApiQueryResult}
 * via declaration merging.
 *
 * @see https://www.mediawiki.org/wiki/API:Tokens
 */

/** Tokens returned by `meta=tokens`; which keys appear depends on `type`. */
export interface ApiQueryTokens {
  /** Anti-CSRF token for most write actions. `type=csrf` (the default). */
  csrftoken?: string;

  /** `type=watch`. */
  watchtoken?: string;

  /** `type=patrol`. */
  patroltoken?: string;

  /** `type=rollback`. */
  rollbacktoken?: string;

  /** `type=userrights`. */
  userrightstoken?: string;

  /** `type=login`. */
  logintoken?: string;

  /** `type=createaccount`. */
  createaccounttoken?: string;

  /**
   * Extension-provided tokens follow the same `<type>token` shape, e.g.
   * CentralAuth's `deleteglobalaccounttoken` / `setglobalaccountstatustoken`.
   */
  [token: `${string}token`]: string | undefined;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Tokens requested via `meta=tokens`. */
    tokens?: ApiQueryTokens;
  }
}
