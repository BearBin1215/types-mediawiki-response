/**
 * `prop=info` page fields, merged into the shared {@link ApiPage} shape via
 * declaration merging so `query.pages[]` gains these fields when `info` is
 * requested. Extra fields are selected with `inprop=`.
 *
 * @see https://www.mediawiki.org/wiki/API:Info
 */
import type { ApiWatchlistLabel, ContentFormat, ContentModel, Flag, Timestamp } from "../../common";
import type { QueryPage, QueryPageExisting } from "./index";

/** One entry of a page's `protection` array (`inprop=protection`). */
export interface ApiPageProtection {
  /** Restriction kind, e.g. `edit` / `move`. Open union. */
  type: string;

  /** Required right/group level, e.g. `sysop` / `autoconfirmed`. Empty when unrestricted. */
  level: string;

  /** Expiry, or `infinity` / `infinite` when permanent. */
  expiry: Timestamp;

  /**
   * Whether this restriction cascades to transcluded pages. Appears only when
   * the page has `cascade=true` set (see `action=protect`), and is a {@link Flag}.
   */
  cascade?: Flag;

  /**
   * Title of the page whose protection cascades onto this one. Present only on
   * entries inherited through cascading protection, i.e. never together with
   * {@link cascade} on the same entry.
   */
  source?: string;
}

/**
 * One permission-check failure reported under `intestactionsdetail=full|quick`.
 * The exact keys depend on the request's `errorformat`.
 */
export interface ApiActionPermission {
  /** Machine-readable code, e.g. `sitejsprotected`. */
  code?: string;

  /** Rendered message text. */
  text?: string;

  /** i18n message key, when the server supplies the raw message instead. */
  message?: string;

  /** Parameters substituted into the message. */
  params?: unknown[];
}

/**
 * Fields `prop=info` contributes to {@link ApiPage}. {@link InfoPage} projects
 * exactly this set.
 */
export interface ApiPageInfo {
  /** Content model of the page's current revision. */
  contentmodel?: ContentModel;

  /** Page language code, e.g. `en`. */
  pagelanguage?: string;

  /** HTML `lang` attribute value for the page language. */
  pagelanguagehtmlcode?: string;

  /** Writing direction of the page language. Open union for forward compatibility. */
  pagelanguagedir?: "ltr" | "rtl" | (string & {});

  /** When the page was last touched (cache/link invalidation), not last edited. Existing pages only. */
  touched?: Timestamp;

  /** Revision id of the latest revision. Existing pages only. */
  lastrevid?: number;

  /** Length of the page content in bytes. Existing pages only. */
  length?: number;

  /** `true` when the page is a redirect. A {@link Flag} (appears only when true). */
  redirect?: Flag;

  /**
   * `true` when the page is in the new-pages list (no other page links to it and
   * it has a single revision). A {@link Flag} — absent for established pages.
   */
  new?: Flag;

  /**
   * Whether the requesting user watches the page. A **real `boolean`** (`false` is
   * returned), unlike most watch markers. `inprop=watched`; requires being
   * logged in with the `viewmywatchlist` right.
   */
  watched?: boolean;

  /**
   * Number of users watching the page. For callers without the `unwatchedpages`
   * right the count is withheld entirely while it stays below
   * `$wgUnwatchedPageThreshold`; `0` is only reported to callers with that
   * right. `inprop=watchers`.
   */
  watchers?: number;

  /**
   * Number of watchers who have visited the page since their notification
   * timestamp. Same withholding rule as {@link watchers}.
   * `inprop=visitingwatchers`.
   */
  visitingwatchers?: number;

  /**
   * When the requesting user's watch of this page expires. Requires
   * `inprop=watched`; present only when the page is watched **with** an
   * expiry (`action=watch&expiry=`).
   */
  watchlistexpiry?: Timestamp;

  /**
   * Watchlist labels attached to this page by the requesting user.
   * `inprop=watchlistlabels`; requires being logged in with the
   * `viewmywatchlist` right (like {@link watched}) and
   * `$wgEnableWatchlistLabels`, and is `[]` when the page has none.
   *
   * @since MediaWiki 1.46
   */
  watchlistlabels?: ApiWatchlistLabel[];

  /**
   * Per-action permission test results, keyed by action name. Set by
   * `intestactions=`: `intestactionsdetail=boolean` yields a `boolean` per
   * action, while `full`/`quick` yields the array of blocking messages
   * (empty when the action is allowed). A PHP map, so an empty result
   * serializes as `[]`.
   */
  actions?: Record<string, boolean | ApiActionPermission[]> | unknown[];

  /**
   * Whether a temporary account would be auto-created for each tested action.
   * `intestactionsautocreate=1` alongside `intestactions=`. A PHP map, so an
   * empty result serializes as `[]`.
   *
   * @since MediaWiki 1.41
   */
  wouldautocreate?: Record<string, boolean> | unknown[];

  /**
   * When the requesting user last saw the page. An **empty string** when never
   * visited (or when notifications are off), otherwise a timestamp.
   * `inprop=notificationtimestamp`.
   */
  notificationtimestamp?: Timestamp | "";

  /**
   * Whether the current user may read the page. A real `boolean` (`false` included).
   * `inprop=readable`.
   *
   * @deprecated since MediaWiki 1.32; use `intestactions=read` instead.
   */
  readable?: boolean;

  /**
   * Text pre-filled into the edit box for a missing page, from the
   * `EditFormPreloadText` hook. `''` when the page exists.
   * `inprop=preload`.
   *
   * @deprecated since MediaWiki 1.41 in favour of {@link preloadcontent}, which also
   * reports the content model and format.
   */
  preload?: string;

  /**
   * Content the edit form would preload: for a page that does not exist yet,
   * or for an existing page when a new section would be added
   * (`preloadnewsection=1`). `inprop=preloadcontent`; only for a single
   * title/revision per query.
   *
   * @since MediaWiki 1.41
   */
  preloadcontent?: ApiPreloadedContent;

  /**
   * Whether {@link preloadcontent} is identical to the page's default content, in
   * which case saving it would be a no-op. `inprop=preloadcontent`.
   *
   * @since MediaWiki 1.41
   */
  preloadisdefault?: boolean;

  /**
   * Notices the edit form should show, keyed by message name (e.g.
   * `newarticletext`) with HTML values. Drawn from the whole edit-form intro
   * message set — `newarticletext`, `talkpagetext`, per-namespace editnotices,
   * `Editintro` pages, … — not only `MediaWiki:Editintro*` pages.
   * `inprop=editintro`; only for a single title per query.
   *
   * @since MediaWiki 1.41
   */
  editintro?: Record<string, string>;

  /** Protection entries; empty array when unrestricted. `inprop=protection`. */
  protection?: ApiPageProtection[];

  /** Restriction types that apply, e.g. `edit`, `move`, `create`. `inprop=protection`. */
  restrictiontypes?: string[];

  /**
   * Related page: the talk page for a subject, or vice versa.
   * `inprop=associatedpage`; subject/talk namespaces only — not emitted on
   * special or `Media:` pages.
   */
  associatedpage?: string;

  /** Page id of the associated talk page. `inprop=talkid` (subject pages only). */
  talkid?: number;

  /** Page id of the associated subject page. `inprop=subjectid` (talk pages only). */
  subjectid?: number;

  /** Fully-resolved canonical article URL. `inprop=url`. */
  fullurl?: string;

  /** Edit-page URL. `inprop=url`. */
  editurl?: string;

  /** Canonical URL. `inprop=url`. */
  canonicalurl?: string;

  /** HTML title used for display. `inprop=displaytitle`. */
  displaytitle?: string;

  /**
   * Display titles per language variant, keyed by variant code (e.g.
   * `zh-hans`). Also populated on wikis without language variants, where the
   * single key is the content language itself. `inprop=varianttitles`.
   */
  varianttitles?: Record<string, string>;

  /**
   * CSS classes to apply to links to this page (core marks redirects
   * `mw-redirect`; extensions may add more). `inprop=linkclasses`; emitted
   * for every requested page, `[]` when there is no class for it.
   */
  linkclasses?: string[];
}

declare module "./index" {
  interface ApiPage extends ApiPageInfo {}
}

/**
 * A page projected to everything `prop=info` contributes, plus the
 * framework-injected {@link ApiPage.index}.
 */
export type InfoPage = QueryPage<keyof ApiPageInfo>;

/**
 * {@link InfoPage} for a page that exists: the identity fields and the
 * unconditional `prop=info` fields ({@link PropConstantKeys}) are required;
 * `inprop`-gated fields stay optional.
 */
export type InfoPageExisting = QueryPageExisting<keyof ApiPageInfo>;

/** Preloaded edit content (`inprop=preloadcontent`), which fills the main slot. */
export interface ApiPreloadedContent {
  /** Content model of the preloaded text, e.g. `wikitext`. */
  contentmodel?: ContentModel;

  /** Serialization format, e.g. `text/x-wiki`. */
  contentformat?: ContentFormat;

  /** The preloaded body; `''` when nothing is configured for the title. */
  content?: string;
}
