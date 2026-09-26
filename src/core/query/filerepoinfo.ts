/**
 * `meta=filerepoinfo` — the wiki's file repositories (local upload dir plus any
 * shared repo), merged into {@link ApiQueryResult}. Explains the `url`/`thumburl`
 * shapes that `prop=imageinfo` and `list=allimages` return.
 *
 * Config values, so the switches are real booleans (`false` is returned), not
 * {@link Flag}s. Repos report only the optional settings they configure, so
 * the key set varies by site; `apiurl` exists only for `ForeignAPIRepo`
 * backends.
 *
 * @see https://www.mediawiki.org/wiki/API:Filerepoinfo
 */

/** One file repository: an element of the `query.repos` array. */
export interface ApiFileRepoInfo {
  /** Repo id; `local` is the wiki's own repo. `friprop=name` (default). */
  name?: string;

  /** Human-readable repo name. `friprop=displayname`. */
  displayname?: string;

  /** Whether this is the wiki's own repo. `friprop=local`. */
  local?: boolean;

  /** Public base path of the repo. `friprop=url`. */
  url?: string;

  /** Repo root without the hashed subpath. `friprop=rootUrl`. */
  rootUrl?: string;

  /** Base path for thumbnails. `friprop=thumbUrl`. */
  thumbUrl?: string;

  /** Base path of the repo's wiki, e.g. `https://www.mediawiki.org/w`. `friprop=scriptDirUrl`. */
  scriptDirUrl?: string;

  /** URL of the repo wiki's favicon. `friprop=favicon`. */
  favicon?: string;

  /** Whether titles on the repo wiki are capitalized on first letter. `friprop=initialCapital`. */
  initialCapital?: boolean;

  /** Whether the requesting user may upload here. `friprop=canUpload`. */
  canUpload?: boolean;

  /** Base path of the repo wiki's API, for `ForeignAPIRepo` backends. `friprop=apiurl`. */
  apiurl?: string;

  /** URL prefix of the repo wiki's file description pages (e.g. `…/wiki/File:`). `friprop=descBaseUrl`. */
  descBaseUrl?: string;

  /** URL prefix of the repo wiki's article pages. `friprop=articleUrl`. */
  articleUrl?: string;

  /** Whether description pages are fetched from the remote wiki. `friprop=fetchDescription`. */
  fetchDescription?: boolean;

  /** How long fetched descriptions are cached, in seconds. `friprop=descriptionCacheExpiry`. */
  descriptionCacheExpiry?: number;
}

declare module "./index" {
  interface ApiQueryResult {
    /** File repositories (`meta=filerepoinfo`). */
    repos?: ApiFileRepoInfo[];
  }
}
