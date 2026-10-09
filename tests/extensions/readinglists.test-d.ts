/**
 * Type-level assertions for the ReadingLists ext pack (`meta=readinglists`,
 * `list=readinglistentries`, `action=readinglists`), checked against real local
 * 1.43 fv2 fixtures captured from a logged-in session (setup → create → entries
 * → delete → changes).
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiReadingListEntry,
  ApiReadingListItem,
  ApiReadingListsCreateEntryResponse,
  ApiReadingListsCreateResponse,
  ApiReadingListsDeleteEntryResponse,
  ApiReadingListsDeleteResponse,
  ApiReadingListsSetupResponse,
  ApiReadingListsTeardownResponse,
  ApiReadingListsUpdateResponse,
} from "../../src/extensions/readinglists";
import type { ApiQueryResult } from "../../src";
import type { ExtraKeys } from "../typeutil";
import metaFixture from "../fixtures/extensions/readinglists-meta.json";
import changesFixture from "../fixtures/extensions/readinglists-changes.json";
import entriesFixture from "../fixtures/extensions/readinglistentries.json";
import entriesChangesFixture from "../fixtures/extensions/readinglistentries-changes.json";
import generatorFixture from "../fixtures/extensions/readinglistentries-generator.json";
import createFixture from "../fixtures/extensions/readinglists-create.json";
import createEntryFixture from "../fixtures/extensions/readinglists-createentry.json";

// --- hand-written `satisfies` samples (literal precision) ---

/** A plain read item: every core key present, no `duplicate` / `deleted`. */
export const listItem = {
  id: 5,
  name: "Reading list one",
  default: false,
  description: "desc one",
  created: "2026-10-09T14:45:23Z",
  updated: "2026-10-09T14:45:24Z",
} satisfies ApiReadingListItem;

/** A changes-mode item: `deleted` true, name rewritten to `deleted-<hash>`. */
export const deletedItem = {
  id: 2,
  name: "deleted-cbcf1a9ad9b970ca38022d791fa638bb",
  default: false,
  description: "desc one",
  created: "2026-10-09T14:38:51Z",
  updated: "2026-10-09T14:38:52Z",
  deleted: true,
} satisfies ApiReadingListItem;

/** A create-response item carries the merge flag the plain read omits. */
export const duplicateItem = {
  id: 3,
  name: "Reading list three",
  default: false,
  description: "",
  created: "2026-10-09T14:38:51Z",
  updated: "2026-10-09T14:38:51Z",
  duplicate: true,
} satisfies ApiReadingListItem;

export const entryItem = {
  id: 1,
  listId: 5,
  project: "http://localhost",
  title: "Main Page",
  created: "2026-10-09T14:45:23Z",
  updated: "2026-10-09T14:45:23Z",
} satisfies ApiReadingListEntry;

// Root ids are strings; the nested record id is a number.
export const createSingle = {
  create: {
    id: "5",
    list: {
      id: 5,
      name: "Reading list one",
      default: false,
      description: "desc one",
      created: "2026-10-09T14:45:23Z",
      updated: "2026-10-09T14:45:23Z",
      duplicate: false,
    },
    result: "Success",
  },
} satisfies ApiReadingListsCreateResponse;

export const createBatch = {
  create: {
    ids: ["3", "4"],
    lists: [duplicateItem],
    result: "Success",
  },
} satisfies ApiReadingListsCreateResponse;

export const setupResponse = {
  setup: { list: listItem, result: "Success" },
} satisfies ApiReadingListsSetupResponse;

export const updateResponse = {
  update: { id: "5", list: listItem, result: "Success" },
} satisfies ApiReadingListsUpdateResponse;

export const deleteResponse = {
  delete: { result: "Success" },
} satisfies ApiReadingListsDeleteResponse;

export const createEntryResponse = {
  createentry: {
    id: "1",
    entry: { ...entryItem, duplicate: false },
    result: "Success",
  },
} satisfies ApiReadingListsCreateEntryResponse;

export const deleteEntryResponse = {
  deleteentry: { result: "Success" },
} satisfies ApiReadingListsDeleteEntryResponse;

// Teardown success is a bare sentinel; the shape could not be captured on the
// SQLite baseline (teardownForUser renames lists via an UPDATE whose SQL-side
// CONCAT/MD5 SQLite lacks) and is modeled from source.
export const teardownResponse = {
  teardown: { result: "Success" },
} satisfies ApiReadingListsTeardownResponse;

// --- contract: required vs optional ---

expectTypeOf<ApiReadingListItem>().toHaveProperty("id").toEqualTypeOf<number>();
expectTypeOf<ApiReadingListItem>().toHaveProperty("default").toEqualTypeOf<boolean>();
expectTypeOf<ApiReadingListItem>().toHaveProperty("description").toEqualTypeOf<string>();
expectTypeOf<ApiReadingListItem>().toHaveProperty("created").toEqualTypeOf<string>();
// `duplicate` rides only on create-command rows; `deleted` only on changes mode.
expectTypeOf<ApiReadingListItem>().toHaveProperty("duplicate").toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiReadingListItem>().toHaveProperty("deleted").toEqualTypeOf<true | undefined>();

expectTypeOf<ApiReadingListEntry>().toHaveProperty("listId").toEqualTypeOf<number>();
expectTypeOf<ApiReadingListEntry>().toHaveProperty("project").toEqualTypeOf<string>();
expectTypeOf<ApiReadingListEntry>().toHaveProperty("deleted").toEqualTypeOf<true | undefined>();

// Write id (root) is a string while the record id is a number.
expectTypeOf<ApiReadingListsCreateResponse>()
  .toHaveProperty("create")
  .toHaveProperty("id")
  .toEqualTypeOf<string | undefined>();
expectTypeOf<ApiReadingListsCreateResponse>()
  .toHaveProperty("create")
  .toHaveProperty("result")
  .toEqualTypeOf<"Success">();

// --- query augmentation (merged field groups) ---

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("readinglists")
  .toEqualTypeOf<ApiReadingListItem[] | undefined>();
expectTypeOf<ApiQueryResult>()
  .toHaveProperty("readinglistentries")
  .toEqualTypeOf<ApiReadingListEntry[] | undefined>();
expectTypeOf<ApiQueryResult>()
  .toHaveProperty("readinglists-synctimestamp")
  .toEqualTypeOf<string | undefined>();

// --- structural checks against the captured fixtures ---

expectTypeOf<
  ExtraKeys<(typeof metaFixture.query.readinglists)[number], keyof ApiReadingListItem>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof changesFixture.query.readinglists)[number], keyof ApiReadingListItem>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof entriesFixture.query.readinglistentries)[number], keyof ApiReadingListEntry>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof entriesChangesFixture.query.readinglistentries)[number],
    keyof ApiReadingListEntry
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof generatorFixture.query.readinglistentries)[number], keyof ApiReadingListEntry>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof createFixture.create, keyof ApiReadingListsCreateResponse["create"]>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    typeof createEntryFixture.createentry,
    keyof ApiReadingListsCreateEntryResponse["createentry"]
  >
>().toEqualTypeOf<never>();

// The generator injects titles into `pages` and returns an empty entries array.
expectTypeOf(generatorFixture.query.pages).not.toBeNever();
