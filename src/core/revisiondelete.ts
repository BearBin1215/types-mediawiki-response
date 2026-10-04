/**
 * `action=revisiondelete` response — hides (or restores) metadata of revisions,
 * archived revisions, file versions, or log entries. Requires the right for the
 * target type (`deleterevision` for revisions/archives/file versions,
 * `deletelogentry` for log entries) plus `suppressrevision` when `suppress=yes`,
 * and a CSRF token; `deletedhistory`/`deletedtext` are view rights, never
 * checked by this module.
 *
 * The per-item `userhidden` / `commenthidden` / `texthidden` flags report the
 * resulting visibility state; they are real booleans. Item shape varies by
 * `type`: log entries carry the `type`/`action`/`params` family, file versions
 * the `title`/`archivename`/dimensions family.
 *
 * @see https://www.mediawiki.org/wiki/API:Revisiondelete
 */
import type { Timestamp, ApiSpecMessage } from "../common";
import type { ApiEnvelope, ApiMessage } from "../envelope";

/** Per-item outcome. Open union for forward compatibility. */
export type RevisionDeleteStatus = "Success" | "Fail" | (string & {});

/** One item (revision / log entry / image) processed by the request. */
export interface ApiRevisionDeleteItem {
  /** Outcome for this item. */
  status: RevisionDeleteStatus;

  /** Object id (revision id, log id, or oldimage id). */
  id: number;

  /** Object timestamp. */
  timestamp?: Timestamp;

  /** Whether the edit summary is now hidden. A real `boolean`. */
  commenthidden?: boolean;

  /** Whether the author is now hidden. A real `boolean`. */
  userhidden?: boolean;

  /** Whether the content is now hidden. A real `boolean`. */
  texthidden?: boolean;

  /** Author user id (visible to reviewers). */
  userid?: number;

  /** Author name (visible to reviewers). */
  user?: string;

  /** Edit summary (visible to reviewers). */
  comment?: string;

  /** Log entry type (e.g. `move`). Log entries only. */
  type?: string;

  /** Log action (subtype, e.g. `move_redir`). Log entries only. */
  action?: string;

  /** Whether the log action text is now hidden. A real `boolean`. Log entries only. */
  actionhidden?: boolean;

  /** Log entry parameters (when the action is visible). Log entries only. */
  params?: Record<string, unknown>;

  /** File title. File versions only. */
  title?: string;

  /** Archived file name. File versions only. */
  archivename?: string;

  /** File width in pixels. File versions only. */
  width?: number;

  /** File height in pixels. File versions only. */
  height?: number;

  /** File size in bytes. File versions only. */
  size?: number;

  /** Whether the file content is now hidden. A real `boolean`. File versions only. */
  contenthidden?: boolean;

  /** File URL, or a `Special:Revisiondelete` link when the content is deleted but viewable. File versions only. */
  url?: string;

  /** In-band messages when this item failed, shaped per the request's `errorformat`. */
  errors?: ApiSpecMessage[] | ApiMessage[];

  /** In-band warnings for this item, shaped per the request's `errorformat`. */
  warnings?: ApiSpecMessage[] | ApiMessage[];
}

/** The `revisiondelete` object of a successful response. */
export interface ApiRevisionDeleteResult {
  /** Overall outcome. */
  status: RevisionDeleteStatus;

  /** Target page title. */
  target: string;

  /** Per-item results. */
  items: ApiRevisionDeleteItem[];

  /** In-band messages when the overall operation failed, shaped per the request's `errorformat`. */
  errors?: ApiSpecMessage[] | ApiMessage[];

  /** In-band warnings from the overall operation, shaped per the request's `errorformat`. */
  warnings?: ApiSpecMessage[] | ApiMessage[];
}

/** Response of `action=revisiondelete`. */
export interface ApiRevisionDeleteResponse extends ApiEnvelope {
  /** Result of `action=revisiondelete`. */
  revisiondelete: ApiRevisionDeleteResult;
}
