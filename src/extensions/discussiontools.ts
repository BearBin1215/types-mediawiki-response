/**
 * Opt-in extension pack: **DiscussionTools**
 * (`action=discussiontoolspageinfo`, `action=discussiontoolsfindcomment`,
 * `action=discussiontoolsgetsubscriptions`, `action=discussiontoolssubscribe`,
 * `action=discussiontoolsthank`, `action=discussiontoolscompare`,
 * `action=discussiontoolspreview`, `action=discussiontoolsedit`).
 *
 * Not in the default export. These are standalone action responses — import what
 * you need directly:
 *
 * ```ts
 * import type { ApiDiscussionToolsPageInfoResponse } from 'types-mediawiki-response/ext/discussiontools';
 * ```
 *
 * Nothing here merges into `ApiPage`/`ApiQueryResult`: most modules write a
 * root-level key named after themselves (`discussiontoolspageinfo`,
 * `discussiontoolsedit`, …). Two exceptions: `discussiontoolsgetsubscriptions`
 * writes a root-level `subscriptions` map, and `discussiontoolsthank` writes a
 * root-level `result` — the same shape as `action=thank` from the Thanks
 * extension.
 *
 * Comments are addressed by a generated `id` (`h-<slug>-<timestamp>` for a topic
 * heading, `c-<user>-<timestamp>` for a comment) and a `name` (`h-<user>-<timestamp>`
 * for a topic, where `<user>` is the thread starter; `c-<user>-<timestamp>` for a
 * comment); `findcomment` resolves either into both fields, which is the reliable
 * way to obtain them. Replies nest arbitrarily deep under `replies`.
 *
 * @see https://www.mediawiki.org/wiki/Extension:DiscussionTools
 */
import type { Flag, SuccessStatus, Timestamp } from "../common";
import type { ApiEnvelope } from "../envelope";
import type { ApiParse } from "../core/parse";
import type { ApiThankResult } from "./thanks";
import type { ApiLastModified } from "./visualeditor";

/** One node of a reply/indent tree (`prop=threaditemshtml`). */
export interface ApiDiscussionToolsComment {
  /** Comment id, e.g. `h-Example_topic-20240115083000`. */
  id: string;

  /**
   * Comment name — headings only (`h-<user>-<timestamp>`, where `<user>` is
   * the thread starter, or bare `h-` for an empty section); comment items do
   * not serialize a name.
   */
  name?: string;

  /** Rendering level of the heading (`0` for the topic itself). */
  level?: number;

  /** Heading level as written in wikitext (`==` → 2), headings only; `null` for placeholder headings. */
  headingLevel?: number | null;

  /**
   * The heading opens a section that cannot be edited here (no edit-section
   * link was rendered); headings only.
   */
  uneditableSection?: Flag;

  /** Who wrote the comment. */
  author?: string;

  /** Display name shown in the signature, when it differs from {@link author}. */
  displayName?: string;

  /** When it was signed. */
  timestamp?: Timestamp;

  /** Comment type, e.g. `comment`, `heading`. Open union. */
  type: string;

  /** Rendered HTML of this comment. */
  html?: string;

  /** HTML of the content between an empty section's heading and the next one; headings only. */
  othercontent?: string;

  /** Nested replies (same shape, recursively). */
  replies?: ApiDiscussionToolsComment[];

  /**
   * Number of comments below this heading. Headings only
   * (`prop=threaditemshtml`).
   *
   * @since MediaWiki 1.45
   */
  commentCount?: number;

  /**
   * Distinct authors below this heading. Headings only.
   *
   * @since MediaWiki 1.45
   */
  authorCount?: number;

  /**
   * Timestamp of the latest reply under this heading, or `null` when there is
   * none. Headings only.
   *
   * @since MediaWiki 1.45
   */
  latestReplyTimestamp?: Timestamp | null;

  /**
   * The most recent reply, serialized as a comment item without its `replies`;
   * `null` when there is none. Headings only, and only with
   * `threaditemsflags=activity` (alongside `prop=threaditemshtml`).
   *
   * @since MediaWiki 1.46
   */
  latestReply?: ApiDiscussionToolsComment | null;

  /**
   * The earliest reply, same serialization as {@link latestReply}; `null` when
   * there is none. Headings only, and only with `threaditemsflags=activity`
   * (alongside `prop=threaditemshtml`).
   *
   * @since MediaWiki 1.46
   */
  oldestReply?: ApiDiscussionToolsComment | null;
}

/**
 * `prop=transcludedfrom`: whether each comment is a transclusion target here.
 * Keyed by comment id **and** name; `false` when the content is local, `true`
 * when transcluded but the source could not be determined, otherwise the
 * source page title.
 */
export interface ApiDiscussionToolsTranscludedFrom {
  /** State for the comment the id or name key refers to. */
  [commentIdOrName: string]: boolean | string | undefined;
}

/** Response of `action=discussiontoolspageinfo`. */
export interface ApiDiscussionToolsPageInfoResponse extends ApiEnvelope {
  /** Result of `action=discussiontoolspageinfo`. */
  discussiontoolspageinfo: {
    /** Parsed reply tree. `prop=threaditemshtml`. */
    threaditemshtml?: ApiDiscussionToolsComment[];

    /** Per-comment transclusion map (local vs transcluded, with source title). `prop=transcludedfrom`. */
    transcludedfrom?: ApiDiscussionToolsTranscludedFrom;
  };
}

/** One candidate returned by `action=discussiontoolsfindcomment`. */
export interface ApiDiscussionToolsFoundComment {
  /** Canonical comment id. */
  id: string;

  /** Canonical comment name. */
  name: string;

  /** Page the comment lives on. */
  title: string;

  /** Revision id of the permalink; `null` when the revision is the current one. */
  oldid: number | null;

  /** How the lookup matched: `id`, `name` or `heading`. */
  matchedby: "id" | "name" | "heading" | (string & {});

  /**
   * Whether the request could be redirected to a permalink. Absent in the 1.41
   * `findcomment` release, which unset it; emitted from 1.42.
   *
   * @since MediaWiki 1.42
   */
  couldredirect?: boolean;

  /**
   * Whether it should be (the target differs from what was asked).
   *
   * @since MediaWiki 1.41
   */
  shouldredirect?: boolean;
}

/** Response of `action=discussiontoolsfindcomment` (a list of candidates). */
export interface ApiDiscussionToolsFindCommentResponse extends ApiEnvelope {
  /** Result of `action=discussiontoolsfindcomment`; one entry per candidate comment. */
  discussiontoolsfindcomment: ApiDiscussionToolsFoundComment[];
}

/**
 * Response of `action=discussiontoolsgetsubscriptions`. The map is keyed by
 * comment **name** (the same strings as the `commentname` request parameter);
 * each value is `0` (unsubscribed), `1` (subscribed) or `2` (auto-subscribed)
 * — numeric, not boolean.
 */
export interface ApiDiscussionToolsGetSubscriptionsResponse extends ApiEnvelope {
  /** Subscription state per comment keyed by name: `0` unsubscribed, `1` subscribed, `2` auto-subscribed. */
  subscriptions: Record<string, number>;
}

/** Response of `action=discussiontoolssubscribe`. */
export interface ApiDiscussionToolsSubscribeResponse extends ApiEnvelope {
  /** Result of `action=discussiontoolssubscribe`. */
  discussiontoolssubscribe: {
    /** Page the comment is on. */
    page: string;

    /** Canonical comment name the subscription applies to. */
    commentname: string;

    /** Requested state, echoed back. */
    subscribe: boolean;
  };
}

/**
 * Response of `action=discussiontoolsthank`. The module inherits the Thanks
 * extension's result: a root-level `result` key, not one named after the
 * module.
 */
export interface ApiDiscussionToolsThankResponse extends ApiEnvelope {
  /** The thanks result, the same shape as `action=thank` ({@link ApiThankResult}). */
  result?: ApiThankResult;
}

/**
 * One comment item in a `discussiontoolscompare` diff: the thread-item shape
 * (see `ApiDiscussionToolsComment`) with `replies` flattened to comment ids
 * and the heading references appended.
 */
export interface ApiDiscussionToolsCommentForDiff {
  /** Comment id. */
  id?: string;

  /** Comment type, e.g. `comment`. */
  type?: string;

  /** Rendering level. */
  level?: number;

  /** Ids of nested replies (shallow serialization). */
  replies?: string[];

  /** When it was signed — the compact id/name timestamp form (`YYYYMMDDHHMMSS`); comments predating 2022-07 are ISO 8601 instead. */
  timestamp?: Timestamp;

  /** Who wrote the comment. */
  author?: string;

  /** Id of the heading the comment sits under. */
  headingId?: string;

  /** Id of the nearest subscribable heading; `null` when there is none. */
  subscribableHeadingId?: string | null;
}

/** Response of `action=discussiontoolscompare` (comment-level diff of two revisions). */
export interface ApiDiscussionToolsCompareResponse extends ApiEnvelope {
  /** Result of `action=discussiontoolscompare`. */
  discussiontoolscompare: {
    /** Left revision id. */
    fromrevid?: number;

    /** Page title of the left revision. */
    fromtitle?: string;

    /** Right revision id. */
    torevid?: number;

    /** Page title of the right revision. */
    totitle?: string;

    /** Comments present only in the left revision. */
    removedcomments?: ApiDiscussionToolsCommentForDiff[];

    /** Comments present only in the right revision. */
    addedcomments?: ApiDiscussionToolsCommentForDiff[];
  };
}

/** Response of `action=discussiontoolspreview`. */
export interface ApiDiscussionToolsPreviewResponse extends ApiEnvelope {
  /** Result of `action=discussiontoolspreview`. */
  discussiontoolspreview: {
    /** The parsed preview, same shape as an `action=parse` payload. */
    parse?: ApiParse;
  };
}

/** Response of `action=discussiontoolsedit`. */
export interface ApiDiscussionToolsEditResponse extends ApiEnvelope {
  /** Result of `action=discussiontoolsedit`. */
  discussiontoolsedit: {
    /** `success` when the comment was saved. */
    result?: SuccessStatus;

    /** Rendered HTML of the saved comment area. */
    content?: string;

    /**
     * `true` when the content above was withheld (the `nocontent` request
     * parameter) but had to be fetched internally anyway.
     *
     * @since MediaWiki 1.42
     */
    nocontent?: Flag;

    /** Page subtitle (parsed HTML), copied from the underlying `action=parse` output. */
    contentSub?: string;

    /** Category HTML added by the saved comment. */
    categorieshtml?: string;

    /** Section list after the edit. */
    sections?: unknown[];

    /** Display title, HTML form. */
    displayTitleHtml?: string;

    /** ResourceLoader module names to load. */
    modules?: string[];

    /** ResourceLoader config variables (includes the thread model). */
    jsconfigvars?: Record<string, unknown>;

    /**
     * Empty string for a normal page. The module copies `action=parse`'s field,
     * which is a `Flag`-like empty string under fv2 rather than a boolean.
     */
    isRedirect?: string;

    /** When the page last changed, in display parts. */
    lastModified?: ApiLastModified;

    /** New revision id; absent when nothing was saved. */
    newrevid?: number;

    /** `true` when a temporary account was created by this edit. */
    tempusercreated?: Flag;

    /** Redirect URL for a just-created temporary account, when one applies. */
    tempusercreatedredirect?: string;

    /** Whether the user now watches the page. */
    watched?: boolean;

    /** When that watch expires; `null` for a permanent watch. */
    watchlistexpiry?: Timestamp | null;
  };
}
