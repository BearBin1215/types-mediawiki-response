/**
 * `query.pages` entry states.
 *
 * `ApiPage` merges every `prop=` field and keeps the framework identity fields
 * optional, because a single response can mix states. `ApiPageExisting` /
 * `QueryPageExisting` narrow to the state in which the framework always
 * resolves `pageid`/`ns`/`title`.
 *
 * The five shapes below were probed on 1.39–1.46 and agree with the per-version
 * core source (`ApiPageSet::addPageById`/`addMissingTitles`).
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiMessage,
  ApiPage,
  ApiPageExisting,
  ApiPageProtection,
  ApiRevision,
  ContentModel,
  InfoPageExisting,
  PropConstantKeys,
  QueryPage,
  QueryPageExisting,
  Timestamp,
} from "../../../src";

// Existing page: the framework resolves all three.
export const existingPage = {
  pageid: 1,
  ns: 0,
  title: "Main Page",
} satisfies ApiPageExisting;

// Missing, requested by title: no pageid.
export const missingByTitle = { ns: 0, title: "NoSuchPage zzz", missing: true } satisfies ApiPage;

// Missing, requested by page id: no ns/title.
export const missingById = { pageid: 999999999, missing: true } satisfies ApiPage;

// A `known` page is always also `missing` (`ApiPageSet` emits `[ missing, known ]`).
export const knownButMissing = {
  ns: 0,
  title: "MediaWiki:SomeMessage",
  missing: true,
  known: true,
} satisfies ApiPage;

// Invalid title: only title/invalidreason.
export const invalidTitle = {
  title: "[]",
  invalidreason: "The requested page title contains invalid characters.",
  invalid: true,
} satisfies ApiPage;

// Under a modern `errorformat` `invalidreason` is an `ApiMessage`.
export const invalidTitleModern = {
  title: "[]",
  invalidreason: {
    code: "title-invalid-characters",
    key: "title-invalid-characters",
    params: ["[", "&#91;&#93;"],
  },
  invalid: true,
} satisfies ApiPage;

expectTypeOf<ApiPage>()
  .toHaveProperty("invalidreason")
  .toEqualTypeOf<string | ApiMessage | undefined>();

// Special page: ns/title, no pageid.
export const specialPage = { ns: -1, title: "Special:Version", special: true } satisfies ApiPage;

// The merged ApiPage keeps the identity fields optional.
expectTypeOf<ApiPage>().toHaveProperty("pageid").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiPage>().toHaveProperty("ns").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiPage>().toHaveProperty("title").toEqualTypeOf<string | undefined>();

// ApiPageExisting requires them.
expectTypeOf<ApiPageExisting>().toHaveProperty("pageid").toEqualTypeOf<number>();
expectTypeOf<ApiPageExisting>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiPageExisting>().toHaveProperty("title").toEqualTypeOf<string>();

// QueryPage stays optional; QueryPageExisting requires the identity fields.
expectTypeOf<QueryPage<"revisions">>().toHaveProperty("pageid").toEqualTypeOf<number | undefined>();
expectTypeOf<QueryPageExisting<"revisions">>().toHaveProperty("pageid").toEqualTypeOf<number>();
expectTypeOf<QueryPageExisting<"revisions">>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<QueryPageExisting<"revisions">>().toHaveProperty("title").toEqualTypeOf<string>();

// Picked constant keys (`PropConstantKeys`, verified 1.39–1.47) are required on
// the existing-page projection; gated keys stay optional, and the all-state
// `QueryPage` is unchanged.
expectTypeOf<PropConstantKeys>().toEqualTypeOf<
  | "contentmodel"
  | "pagelanguage"
  | "pagelanguagehtmlcode"
  | "pagelanguagedir"
  | "touched"
  | "lastrevid"
  | "length"
  | "revisions"
>();
expectTypeOf<QueryPageExisting<"revisions">["revisions"]>().toEqualTypeOf<ApiRevision[]>();
expectTypeOf<QueryPageExisting<"contentmodel">["contentmodel"]>().toEqualTypeOf<ContentModel>();
expectTypeOf<QueryPageExisting<"protection">["protection"]>().toEqualTypeOf<
  ApiPageProtection[] | undefined
>();
expectTypeOf<QueryPage<"revisions">["revisions"]>().toEqualTypeOf<ApiRevision[] | undefined>();

// The `InfoPageExisting` alias requires the whole unconditional `prop=info` set.
expectTypeOf<InfoPageExisting["contentmodel"]>().toEqualTypeOf<ContentModel>();
expectTypeOf<InfoPageExisting["touched"]>().toEqualTypeOf<Timestamp>();
expectTypeOf<InfoPageExisting["protection"]>().toEqualTypeOf<ApiPageProtection[] | undefined>();
