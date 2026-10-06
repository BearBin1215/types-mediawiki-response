/**
 * Structured details of log events, shared by `logevents.params`,
 * `recentchanges.logparams` and `watchlist.logparams`.
 */
import type { ContentModel, Expiry, Timestamp } from "../../common";

/**
 * Structured log details — the `params` object of a log event (`leprop=details`
 * on `list=logevents`, `logparams` under the log-info fields of
 * `list=recentchanges` / `list=watchlist`).
 *
 * Each log action writes its own key set, which the server normalizes for the
 * API. The keys below are the ones MediaWiki core itself writes; which of
 * them a row carries depends on its `type`/`action`.
 *
 * The key space is open: extensions and site configuration can register
 * further log actions, and rows written by older MediaWiki versions keep
 * their historical key forms. Unknown keys therefore fall back to `unknown`
 * instead of erroring. Consumers targeting one specific log action — or a
 * site-custom one — can add its keys through interface merging:
 *
 * @example
 * declare module "types-mediawiki-response" {
 *   interface ApiLogEventParams {
 *     // a site-custom log action, or a legacy key form still in the data
 *     "4::target"?: string;
 *   }
 * }
 */
export interface ApiLogEventParams {
  // --- block/block, block/reblock (also suppress/block, suppress/reblock) ---

  /**
   * Block duration as configured: `'infinity'` or the raw specifier
   * (`'2 weeks'`, …), on `block/block`, `block/reblock`, `suppress/block` and
   * `suppress/reblock` rows. Older rows without one are normalized to
   * `'infinity'`.
   */
  duration?: string;

  /**
   * Options in force on the block. Rows written by very old MediaWiki
   * versions may carry the legacy values `autoblock` or `angry-autoblock`
   * instead of the current flag set. An array (`[]` when none).
   */
  flags?: Array<
    | "anononly"
    | "nocreate"
    | "noautoblock"
    | "noemail"
    | "nousertalk"
    | "hiddenname"
    | "autoblock"
    | "angry-autoblock"
  >;

  /**
   * Absolute expiry of the block (ISO 8601), on rows with a finite duration.
   */
  expiry?: Timestamp;

  /** Whether the block covers the whole site (`false` for a partial block). */
  sitewide?: boolean;

  /** Scope of a partial block; absent for sitewide blocks. */
  restrictions?: ApiLogBlockRestrictions;

  /**
   * Id of the block the row created or changed.
   *
   * @since MediaWiki 1.44
   */
  blockId?: number;

  /**
   * Localized duration text (e.g. `'14 days'`, `'infinite'`), in the
   * requesting user's language.
   *
   * @since MediaWiki 1.44
   */
  "duration-l10n"?: string;

  // --- move/move, move/move_redir ---

  /** Namespace of the move destination (on `move/move` and `move/move_redir` rows). */
  target_ns?: number;

  /** Title of the move destination. */
  target_title?: string;

  /** Whether the move left no redirect behind. */
  suppressredirect?: boolean;

  // --- protect/protect, protect/modify ---

  /**
   * Content-language protection summary (e.g. `'[edit=autoconfirmed]
   * (indefinite)'`), aimed at machine feeds; the structured data lives in
   * {@link details}.
   */
  description?: string;

  /** Whether cascading protection was requested. */
  cascade?: boolean;

  /** Protection restrictions in force. */
  details?: ApiLogProtectDetail[];

  // --- protect/move_prot (a protected page was moved) ---

  /** Namespace of the title the protection moved away from. */
  oldtitle_ns?: number;

  /** Title the protection moved away from. */
  oldtitle_title?: string;

  // --- delete/restore ---

  /**
   * How many revisions and archived file versions the undeletion restored
   * (`delete/restore`), how many revisions an import created
   * (`import/upload`, `import/interwiki`), or how many uses a managed tag
   * had (`managetags/activate|deactivate|delete`).
   */
  count?: { revisions: number; files: number } | number;

  // --- delete/revision, delete/event, suppress/revision, suppress/event ---

  /**
   * What the visibility change targeted: `'revision'`, `'archive'`,
   * `'oldimage'` or `'filearchive'` on `…/revision` rows; `'logging'` on
   * `…/event` rows.
   */
  type?: "revision" | "archive" | "oldimage" | "filearchive" | "logging";

  /**
   * Ids of the targeted revisions, file versions or log entries — numbers on
   * current rows, strings on legacy ones.
   */
  ids?: Array<number | string>;

  /** Visibility state before the change. */
  old?: ApiLogRevDelVisibility;

  /** Visibility state after the change. */
  new?: ApiLogRevDelVisibility;

  // --- newusers/create, newusers/create2, newusers/autocreate ---

  /**
   * Id of the account the row reports (on `newusers/create`, `newusers/create2`
   * and `newusers/autocreate` rows).
   */
  userid?: number;

  // --- rights/rights, rights/autopromote ---

  /**
   * Groups the target user belonged to before the change (on `rights/rights`
   * and `rights/autopromote` rows).
   */
  oldgroups?: string[];

  /** Groups after the change. */
  newgroups?: string[];

  /**
   * Per-group membership expiry, parallel to {@link oldgroups}; `[]` when the
   * memberships were all permanent. Absent on `rights/autopromote` rows.
   */
  oldmetadata?: ApiLogGroupMetadata[];

  /**
   * Per-group membership expiry, parallel to {@link newgroups}; `[]` when
   * permanent. Absent on `rights/autopromote` rows.
   */
  newmetadata?: ApiLogGroupMetadata[];

  // --- contentmodel/change, contentmodel/new ---

  /**
   * Content model before the change (on `contentmodel/change` and
   * `contentmodel/new` rows).
   */
  oldmodel?: ContentModel;

  /** Content model after the change. */
  newmodel?: ContentModel;

  // --- merge/merge ---

  /** Namespace of the page the history was merged into. */
  dest_ns?: number;

  /** Title of the page the history was merged into. */
  dest_title?: string;

  // --- merge/merge-into ---

  /**
   * Namespace of the page whose history was merged in (`merge/merge-into` row
   * filed on the destination page).
   *
   * @since MediaWiki 1.45
   */
  src_ns?: number;

  /**
   * Title of the page whose history was merged in (`merge/merge-into`).
   *
   * @since MediaWiki 1.45
   */
  src_title?: string;

  /**
   * Revision the histories were interleaved at (ISO 8601), on `merge/merge`
   * and `merge/merge-into` rows.
   */
  mergepoint?: Timestamp;

  /**
   * Boundary revision id the merge stopped at; stored raw, so it appears as
   * a number or its decimal string.
   *
   * @since MediaWiki 1.42
   */
  mergerevid?: number | string;

  /**
   * Timestamp of the first revision kept out of the merge, when a start
   * boundary was used (ISO 8601); the id of that revision is
   * {@link mergestartid}. Only `merge/merge` rows carry it — `merge/merge-into`
   * rows do not report the start boundary at all.
   *
   * @since MediaWiki 1.45
   */
  mergestart?: Timestamp;

  /**
   * First revision id kept out of the merge; stored raw like
   * {@link mergerevid}.
   *
   * @since MediaWiki 1.45
   */
  mergestartid?: number | string;

  // --- import/upload, import/interwiki ---

  /** Namespace of the source page on the foreign wiki (`import/interwiki`). */
  interwiki_ns?: number;

  /** Source page on the foreign wiki, with its interwiki prefix (`import/interwiki`). */
  interwiki_title?: string;

  // --- upload/upload, upload/overwrite, upload/revert ---

  /**
   * SHA-1 of the uploaded file (base36), on `upload/upload`, `upload/overwrite`
   * and `upload/revert` rows.
   */
  img_sha1?: string;

  /** File timestamp (ISO 8601), which can differ from the row's timestamp. */
  img_timestamp?: Timestamp;

  // --- patrol/patrol ---

  /** Revision id that was marked patrolled, on `patrol/patrol` rows. */
  curid?: number;

  /** Revision id the patrolled one followed. */
  previd?: number;

  /** Always `false`: automatic patrols are not logged. */
  auto?: boolean;

  // --- tag/update ---

  /**
   * Revision the tags were applied to (`tag/update` rows); a raw value from
   * the tagging caller, so forms vary (a number, its decimal string, or
   * `false` when the update targeted a log entry).
   */
  revid?: number | string | false;

  /**
   * Log entry the tags were applied to, on rows that targeted one; a raw
   * value like {@link revid} — `false` when the update targeted a revision.
   */
  logid?: number | string | false;

  /** Tags the update added. */
  tagsAdded?: string[];

  /** How many tags {@link tagsAdded} holds. */
  tagsAddedCount?: number;

  /** Tags the update removed. */
  tagsRemoved?: string[];

  /** How many tags {@link tagsRemoved} holds. */
  tagsRemovedCount?: number;

  /** Tags the target carried before the update. */
  initialTags?: string[];

  // --- managetags/activate, managetags/deactivate, managetags/create, managetags/delete ---

  /** Name of the managed tag (`managetags/create|activate|deactivate|delete`). */
  tag?: string;

  // --- pagelang/pagelang ---

  /**
   * Page language before the change, on `pagelang/pagelang` rows; the wiki's
   * default language carries a `[def]` suffix (e.g. `'en[def]'`).
   */
  oldlanguage?: string;

  /** Page language after the change; also `[def]`-suffixed when set to default. */
  newlanguage?: string;

  /**
   * Any other parameter a log action attaches — a log action registered by an
   * extension or site configuration, or a legacy key form on rows written by
   * an older MediaWiki version.
   */
  [key: string]: unknown;
}

/** One page a partial block is restricted to (`restrictions.pages` entry). */
export interface ApiLogPageRef {
  /** Namespace index. */
  page_ns: number;

  /** Full page title. */
  page_title: string;
}

/** Scope of a partial block (`restrictions`). */
export interface ApiLogBlockRestrictions {
  /** Pages the block is restricted to. */
  pages?: ApiLogPageRef[];

  /** Namespace indexes the block is restricted to. */
  namespaces?: number[];

  /** Action names the block is restricted to (e.g. `'edit'`). */
  actions?: string[];
}

/** One protection restriction (`details` entry on `protect/protect`, `protect/modify`). */
export interface ApiLogProtectDetail {
  /** Action being restricted (e.g. `'edit'`); `'create'` for title protection. */
  type: string;

  /** Protection level (e.g. `'autoconfirmed'`, `'sysop'`). */
  level: string;

  /** When the protection lapses (ISO 8601), or `'infinite'`. */
  expiry: Timestamp | "infinite";

  /** Whether this restriction cascades; absent on `'create'` entries. */
  cascade?: boolean;
}

/** One visibility state (`old`/`new` on a RevisionDelete row). */
export interface ApiLogRevDelVisibility {
  /** Raw visibility bitfield. */
  bitmask: number;

  /** Whether the content is hidden. */
  content: boolean;

  /** Whether the edit summary is hidden. */
  comment: boolean;

  /** Whether the performer is hidden. */
  user: boolean;

  /** Whether only suppressors can unhide. */
  restricted: boolean;
}

/** One group-membership change with its expiry (`oldmetadata`/`newmetadata` entry). */
export interface ApiLogGroupMetadata {
  /** Group name. */
  group: string;

  /** When the membership lapses. */
  expiry: Expiry;
}
