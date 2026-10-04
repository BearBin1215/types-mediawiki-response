/**
 * Opt-in extension pack: **VisualEditor** (`action=visualeditor`,
 * `action=visualeditoredit`, `action=editcheckreferenceurl`).
 *
 * Not in the default export. Standalone action responses — import what you need:
 *
 * ```ts
 * import type { ApiVisualEditorResponse } from 'types-mediawiki-response/ext/visualeditor';
 * ```
 *
 * `paction` selects which fields appear, and both modules write at the **root**
 * of the envelope (next to `query`, not inside it):
 * * `metadata` → the edit-form frame only (`canEdit`, `blockinfo`, timestamps…);
 * * `wikitext` / `parse` → add `content` (+ `preloaded`); `parsefragment`
 *   returns only `{ result, content }`;
 * * `templatesused` → `visualeditor` is a bare HTML **string** (a
 *   `<div class="templatesUsed">` block), not the usual object.
 *
 * `notices`, `checkboxesDef`/`checkboxesMessages` and `blockinfo` show the
 * classic PHP-to-JSON traps: each map is keyed once populated but an empty
 * **array** when there is nothing to show (an anonymous request has no
 * applicable save-form fields), and `blockinfo` is `null` rather than absent
 * for an unblocked user.
 *
 * `action=visualeditoredit` requires a `paction` parameter selecting the
 * operation (`save`, `diff`, `serialize`, `serializeforcache`). `save` returns
 * the same page-frame shape as an `action=edit`-style response; `serialize*` need
 * `html` rather than a page; `page` is required throughout — a title that does
 * not exist yet is fine, but omitting `page` is a `missingparam` error.
 *
 * These are internal modules (`isInternal`), not part of the published API
 * surface. Permission failures from the Parsoid render step surface as the
 * REST-layer `rest-permission-error` error, not as a `blockinfo` field.
 *
 * @see https://www.mediawiki.org/wiki/Extension:VisualEditor
 */
import type { Flag, SuccessStatus, Timestamp, WatchlistExpiry } from "../common";
import type { ApiEditResult } from "../core/edit";
import type { ApiBlockInfo } from "../core/query/users";
import type { ApiEnvelope } from "../envelope";

/** One field of the edit form (`checkboxesDef.wpMinoredit`, `wpWatchthis`, `wpWatchlistExpiry`). */
export interface ApiVisualEditorCheckboxDef {
  /** Element id, e.g. `wpMinoredit`. */
  id?: string;

  /** Message key holding the label. */
  "label-message"?: string;

  /** Message key for the label's `title` attribute; hook-provided checkboxes only. */
  "title-message"?: string;

  /** DOM id of the labelled element. */
  "label-id"?: string;

  /** Legacy form field name. */
  "legacy-name"?: string;

  /** Access-key/tooltip message slug, e.g. `minoredit`. */
  tooltip?: string;

  /** PHP class of the OOUI widget; set for the `wpWatchlistExpiry` dropdown. */
  class?: string;

  /** Dropdown options as label/value pairs (`wpWatchlistExpiry` only). */
  options?: {
    /** Value submitted when the option is chosen. */
    data?: string;

    /** Option text shown in the dropdown. */
    label?: string;
  }[];

  /** Widget config option carrying the current value (`wpWatchlistExpiry` only). */
  "value-attr"?: string;

  /** Label rendered invisibly (`wpWatchlistExpiry` only). */
  invisibleLabel?: true;

  /**
   * Whether the box starts checked — or the preselected expiry string for the
   * `wpWatchlistExpiry` dropdown. A real `boolean` under fv2 for checkboxes.
   */
  default?: boolean | string;
}

/**
 * `lastModified` display parts of the edited page, as emitted by
 * `action=visualeditor`/`visualeditoredit` and by DiscussionTools'
 * `discussiontoolsedit` (both render the same last-modified widget data).
 */
export interface ApiLastModified {
  /** Localized date, e.g. `15 January 2024`. */
  date?: string;

  /** Localized time, e.g. `18:34`. */
  time?: string;

  /** Full sentence combining both. */
  message?: string;
}

/** The page frame both `visualeditor` and `visualeditoredit` return. */
export interface ApiVisualEditorPageFrame {
  /** Outcome of the request; `error` on the save-failure branch. */
  result?: "success" | "error" | (string & {});

  /** Rendered page body (HTML for `parse`, wikitext for `wikitext`). */
  content?: string;

  /** Whether {@link content} came from a preload rather than the page. */
  preloaded?: boolean;

  /** Page subtitle ("Revision as of …") HTML. */
  contentSub?: string;

  /** Display title HTML. */
  displayTitleHtml?: string;

  /** Category bar HTML. */
  categorieshtml?: string;

  /** Section index of the edited/loaded page. */
  sections?: unknown[];

  /** ResourceLoader modules the response needs. */
  modules?: string[];

  /** ResourceLoader config variables (e.g. `wgEchoSeenTime`). */
  jsconfigvars?: Record<string, unknown>;

  /**
   * Empty string for a normal page — this is the legacy empty-string flag
   * pattern rather than a boolean.
   */
  isRedirect?: string;

  /** When the page last changed, in display parts. */
  lastModified?: ApiLastModified;

  /** New revision id, from `visualeditoredit` `paction=save`. */
  newrevid?: number;

  /** Whether the editor watches the page now. */
  watched?: boolean;

  /** When that watch expires; `null` when permanent. */
  watchlistexpiry?: WatchlistExpiry;

  /** HTML diff, from `visualeditoredit` `paction=diff`. */
  diff?: string;

  /** Key into the serialisation cache, from `visualeditoredit` `paction=serializeforcache`. */
  cachekey?: string;

  /** `true` when the save asked to skip the re-render (`nocontent` parameter), so no `content` follows. */
  nocontent?: Flag;

  /** The underlying `action=edit` result, on the save failure branch (`result: "error"`). */
  edit?: ApiEditResult;

  /** `true` when a temporary account was created by this edit. */
  tempusercreated?: Flag;

  /** Redirect URL for a just-created temporary account, when one applies. */
  tempusercreatedredirect?: string;
}

/**
 * Response of `action=visualeditor` for `paction=parse`, `wikitext` and
 * `metadata`, which share one payload. The other `paction` values return
 * different shapes — see {@link ApiVisualEditorTemplatesUsedResponse} and
 * {@link ApiVisualEditorParseFragmentResponse}.
 */
export interface ApiVisualEditorResponse extends ApiEnvelope {
  /** Result of `action=visualeditor` for the `paction` values sharing this payload. */
  visualeditor: ApiVisualEditorPageFrame & {
    /**
     * Notices the editor should show above the form, keyed by message name
     * (e.g. `newarticletext` for a page that does not exist yet). An empty PHP
     * map, so `[]` when there is nothing to show.
     */
    notices: Record<string, string> | unknown[];

    /** Copyright warning HTML; `""` when none applies. */
    copyrightWarning: string;

    /**
     * Definitions of the save-form fields, keyed by element id. An empty PHP
     * map, so `[]` when no field applies to the requesting user.
     */
    checkboxesDef: Record<string, ApiVisualEditorCheckboxDef> | unknown[];

    /**
     * Plain text of the messages referenced by `checkboxesDef`. An empty PHP
     * map, so `[]` when there are no messages.
     */
    checkboxesMessages: Record<string, string> | unknown[];

    /** CSS classes for protection state, joined into one string (`""` when none). */
    protectedClasses: string;

    /** Base timestamp for edit-conflict detection. */
    basetimestamp: Timestamp;

    /** Server timestamp when the request started. */
    starttimestamp: Timestamp;

    /** Revision id the content was taken from. */
    oldid: number;

    /** Block state of the requesting user; `null` when not blocked. */
    blockinfo: ApiBlockInfo | null;

    /**
     * Whether an auto-created temporary account would be used for the edit.
     *
     * @since MediaWiki 1.41
     */
    wouldautocreate?: boolean;

    /** Whether the user may edit this page at all. */
    canEdit: boolean;

    /** Restbase/Parsoid ETag for conditional requests. */
    etag?: string;
  };
}

/**
 * Response of `action=visualeditor` with `paction=templatesused`, where the
 * module writes an HTML string instead of the usual object.
 */
export interface ApiVisualEditorTemplatesUsedResponse extends ApiEnvelope {
  /** HTML string written by `paction=templatesused`, in place of the usual object. */
  visualeditor: string;
}

/**
 * Response of `action=visualeditor` with `paction=parsefragment`: just the
 * transformed fragment and the outcome flag.
 */
export interface ApiVisualEditorParseFragmentResponse extends ApiEnvelope {
  /** Result of `action=visualeditor&paction=parsefragment`. */
  visualeditor: {
    /** Outcome of the transform. */
    result: SuccessStatus;

    /** Transformed wikitext fragment. */
    content: string;
  };
}

/**
 * Response of `action=visualeditoredit`.
 */
export interface ApiVisualEditorEditResponse extends ApiEnvelope {
  /** Result of `action=visualeditoredit`. */
  visualeditoredit: ApiVisualEditorPageFrame;
}

/**
 * Response of `action=editcheckreferenceurl`: the verdict for the checked URL —
 * `"allowed"` or `"blocked"`. Always exactly one entry, keyed by the requested
 * URL.
 *
 * @since MediaWiki 1.42
 */
export interface ApiEditCheckReferenceUrlResponse extends ApiEnvelope {
  /** Verdict per checked URL, keyed by the requested URL; exactly one entry. */
  editcheckreferenceurl: Record<string, "allowed" | "blocked" | (string & {})>;
}
