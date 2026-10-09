/**
 * Opt-in extension pack: **ReadingLists** (`meta=readinglists`,
 * `list=readinglistentries`, `action=readinglists`).
 *
 * Not in the default export. Two shapes live here:
 *
 * - `meta=readinglists` / `list=readinglistentries` merge their result arrays
 *   into `ApiQueryResult` automatically — importing anything from this file
 *   activates the augmentation shipped at the bottom:
 *
 *   ```ts
 *   import type {} from 'types-mediawiki-response/ext/readinglists';
 *   ```
 *
 * - `action=readinglists` writes a root-level key named after the `command`
 *   submodule (`create`, `update`, `setup`, …); import the matching response
 *   type directly:
 *
 *   ```ts
 *   import type { ApiReadingListsCreateResponse } from 'types-mediawiki-response/ext/readinglists';
 *   ```
 *
 * Both modules require a logged-in user: the reads check the
 * `viewmyprivateinfo` right and the writes `editmyprivateinfo`, so an anonymous
 * request gets a top-level `notloggedin` error and lists are always the current
 * user's own. The extension marks its API internal (`isInternal()`), so the
 * modules are omitted from public listings but still callable.
 *
 * fv2 notes: an id is a `number` inside a list/entry record but a *string* at
 * the root of a write response (`id` / `ids`) — those carry the raw database
 * value, uncoupled from the cast record. `duplicate` appears only while a
 * write's repository row is merge-flagged (the create commands), never on a
 * plain read. `deleted` (`true`) appears only in `changedsince` mode; a deleted
 * list is reported under a `deleted-<hash>` name. The read continuation cursor
 * (`rlcontinue`) is the extension's own and is not merged into
 * `ApiQueryContinue`.
 *
 * @see https://www.mediawiki.org/wiki/Extension:ReadingLists
 */
import type { Timestamp } from "../common";
import type { ApiEnvelope } from "../envelope";

/**
 * One reading list (`meta=readinglists`, and the `list`/`lists` payload of the
 * `create` / `update` / `setup` commands).
 */
export interface ApiReadingListItem {
  /** List id. */
  id: number;

  /** List title as set by the owner. */
  name: string;

  /** Whether this is the user's catch-all default list. */
  default: boolean;

  /** Free-text description; `""` when none was set. */
  description: string;

  /** Creation time (ISO 8601). */
  created: Timestamp;

  /** Last update time (ISO 8601). */
  updated: Timestamp;

  /**
   * Whether a list with the same name already existed, carried by the `create`
   * command; absent on plain reads.
   */
  duplicate?: boolean;

  /**
   * `true` for a list soft-deleted within the retention window; appears only in
   * `changedsince` mode, where the list is reported under a `deleted-<hash>`
   * `name`.
   */
  deleted?: true;
}

/**
 * One page saved in a reading list (`list=readinglistentries`, and the
 * `entry`/`entries` payload of the `createentry` command).
 */
export interface ApiReadingListEntry {
  /** Entry id. */
  id: number;

  /** Id of the list this entry belongs to. */
  listId: number;

  /**
   * Canonical base URL of the wiki the entry points to (port omitted, e.g.
   * `https://www.mediawiki.org`). Entries are cross-wiki; the `@local` project
   * value resolves to the serving wiki's own URL here.
   */
  project: string;

  /** Page title on {@link project}. */
  title: string;

  /** Creation time (ISO 8601). */
  created: Timestamp;

  /** Last update time (ISO 8601). */
  updated: Timestamp;

  /** Merge-detection flag of the `createentry` command; absent on plain reads. */
  duplicate?: boolean;

  /** `true` for an entry soft-deleted within the retention window; changes mode only. */
  deleted?: true;
}

/** Response of `action=readinglists&command=setup` (no arguments). */
export interface ApiReadingListsSetupResponse extends ApiEnvelope {
  /** Result of the `setup` command. */
  setup: {
    /** The user's default list, created for them. */
    list: ApiReadingListItem;

    /** Always `Success` on the success branch; failures are top-level errors. */
    result: "Success";
  };
}

/**
 * Response of `action=readinglists&command=create`. A single `name` returns
 * `id` + `list`; a `batch` returns `ids` + `lists`.
 */
export interface ApiReadingListsCreateResponse extends ApiEnvelope {
  /** Result of the `create` command. */
  create: {
    /** New list id (raw database value) for a single create. */
    id?: string;

    /** New list for a single create. */
    list?: ApiReadingListItem;

    /** New list ids for a batch create. */
    ids?: string[];

    /** New lists for a batch create. */
    lists?: ApiReadingListItem[];

    /** Always `Success` on the success branch; failures are top-level errors. */
    result: "Success";
  };
}

/**
 * Response of `action=readinglists&command=update`. A single `list` returns
 * `id` + `list`; a `batch` returns `ids` + `lists`.
 */
export interface ApiReadingListsUpdateResponse extends ApiEnvelope {
  /** Result of the `update` command. */
  update: {
    /** Updated list id (raw database value) for a single update. */
    id?: string;

    /** Updated list for a single update. */
    list?: ApiReadingListItem;

    /** Updated list ids for a batch update. */
    ids?: string[];

    /** Updated lists for a batch update. */
    lists?: ApiReadingListItem[];

    /** Always `Success` on the success branch; failures are top-level errors. */
    result: "Success";
  };
}

/** Response of `action=readinglists&command=delete` (single `list` or `batch`). */
export interface ApiReadingListsDeleteResponse extends ApiEnvelope {
  /** Result of the `delete` command — a bare success sentinel. */
  delete: {
    /** Always `Success` on the success branch; failures are top-level errors. */
    result: "Success";
  };
}

/**
 * Response of `action=readinglists&command=createentry`. A single `project` +
 * `title` returns `id` + `entry`; a `batch` returns `ids` + `entries`.
 */
export interface ApiReadingListsCreateEntryResponse extends ApiEnvelope {
  /** Result of the `createentry` command. */
  createentry: {
    /** New entry id (raw database value) for a single create. */
    id?: string;

    /** New entry for a single create. */
    entry?: ApiReadingListEntry;

    /** New entry ids for a batch create. */
    ids?: string[];

    /** New entries for a batch create. */
    entries?: ApiReadingListEntry[];

    /** Always `Success` on the success branch; failures are top-level errors. */
    result: "Success";
  };
}

/**
 * Response of `action=readinglists&command=deleteentry` (single `entry` or
 * `batch`).
 */
export interface ApiReadingListsDeleteEntryResponse extends ApiEnvelope {
  /** Result of the `deleteentry` command — a bare success sentinel. */
  deleteentry: {
    /** Always `Success` on the success branch; failures are top-level errors. */
    result: "Success";
  };
}

/** Response of `action=readinglists&command=teardown` (no arguments). */
export interface ApiReadingListsTeardownResponse extends ApiEnvelope {
  /** Result of the `teardown` command — a bare success sentinel. */
  teardown: {
    /** Always `Success` on the success branch; failures are top-level errors. */
    result: "Success";
  };
}

declare module "types-mediawiki-response" {
  interface ApiQueryResult {
    /**
     * The current user's reading lists. `meta=readinglists`.
     */
    readinglists?: ApiReadingListItem[];

    /**
     * A sync watermark: querying with this timestamp as `changedsince`
     * guarantees no intervening change is skipped. Sibling of {@link readinglists},
     * `meta=readinglists`; omitted on continuation requests.
     */
    "readinglists-synctimestamp"?: Timestamp;

    /**
     * Pages saved in the requested list(s). `list=readinglistentries` (or
     * `generator=readinglistentries`, where the entries feed `pages` and this
     * array comes back empty).
     */
    readinglistentries?: ApiReadingListEntry[];
  }
}
