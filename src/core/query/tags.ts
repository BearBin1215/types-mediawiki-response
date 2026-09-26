/**
 * `list=tags` — defined change tags, merged into {@link ApiQueryResult} via
 * declaration merging.
 *
 * The module's parameter prefix is `tg`, so the cursor is `tgcontinue`.
 *
 * @see https://www.mediawiki.org/wiki/API:Tags
 */

/** One change-tag definition. `tgprop` selects the optional fields. */
export interface ApiTag {
  /** Internal tag name (used by `rcprop=tags` / revision `tags`). */
  name: string;

  /** Human-readable display name (may contain HTML). `tgprop=displayname`. */
  displayname?: string;

  /** Description (wikitext). `tgprop=description`. */
  description?: string;

  /** Number of revisions/logs carrying this tag. `tgprop=hitcount`. */
  hitcount?: number;

  /** Whether the tag has a definition page. `tgprop=defined`; a real `boolean`. */
  defined?: boolean;

  /** Where the tag can come from. `tgprop=source`; open union members. */
  source?: ("extension" | "manual" | "software" | (string & {}))[];

  /** Whether the tag is still applicable. `tgprop=active`; a real `boolean`. */
  active?: boolean;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Change-tag definitions (`list=tags`). */
    tags?: ApiTag[];
  }
}
