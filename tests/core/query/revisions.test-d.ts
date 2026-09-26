/**
 * Type-level assertions for `prop=revisions`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiPage,
  ApiQueryResponse,
  ApiRevision,
  ApiRevisionSlot,
  ApiRevisionSlots,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import revisionsFixture from "../../fixtures/core/query/revisions.json";
import revisionsRolesFixture from "../../fixtures/core/query/revisions-roles.json";

// A realistic prop=revisions response (mirrors the fixture) must satisfy the type.
export const sample = {
  query: {
    pages: [
      {
        pageid: 1,
        ns: 0,
        title: "MediaWiki",
        revisions: [
          {
            revid: 1,
            parentid: 0,
            minor: false,
            user: "192.0.2.22",
            anon: true,
            userid: 0,
            timestamp: "2004-08-06T20:32:02Z",
            size: 1,
            sha1: "86f7e437faa5a7fce15d1ddcb9eaeaea377667b8",
            slots: {
              main: { contentmodel: "wikitext", contentformat: "text/x-wiki", content: "a" },
            },
            comment: "",
            parsedcomment: "",
            tags: [],
          },
        ],
      },
    ],
  },
  continue: { rvcontinue: "20050721193523|2368", continue: "||" },
} satisfies ApiQueryResponse;

// `minor` is a real boolean (present as `false`), while `anon` is a `Flag`.
expectTypeOf<ApiRevision>().toHaveProperty("minor").toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiRevision>().toHaveProperty("anon").toEqualTypeOf<true | undefined>();
// Slot content is reachable through `slots.main.content` (the pageSource path).
expectTypeOf<ApiRevisionSlots>()
  .toHaveProperty("main")
  .toEqualTypeOf<ApiRevisionSlot | undefined>();

// Widening-tolerant structural check on the real fixture.
expectTypeOf(revisionsFixture.query.pages).toExtend<unknown[]>();

// No omissions at each level the fixture exercises.
expectTypeOf<ExtraKeys<typeof revisionsFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof revisionsFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
type Rev = (typeof revisionsFixture.query.pages)[number]["revisions"][number];
expectTypeOf<ExtraKeys<Rev, keyof ApiRevision>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<Rev["slots"]["main"], keyof ApiRevisionSlot>>().toEqualTypeOf<never>();

// --- rvprop=roles|slotsize|slotsha1 (fixtures/core/query/revisions-roles.json) ---

export const rolesSample = {
  query: {
    pages: [
      {
        pageid: 1,
        ns: 0,
        title: "MediaWiki",
        revisions: [
          {
            revid: 6287429,
            parentid: 6167770,
            timestamp: "2023-12-29T18:14:25Z",
            roles: ["main"],
            slots: {
              main: {
                size: 250,
                sha1: "793751947729f922bfded02904a3e63efeb7ea22",
                contentmodel: "wikitext",
              },
            },
          },
        ],
      },
    ],
  },
  continue: { rvcontinue: "20231024172057|6167770", continue: "||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiRevision>().toHaveProperty("roles").toEqualTypeOf<string[] | undefined>();
expectTypeOf<ApiRevisionSlot>().toHaveProperty("size").toEqualTypeOf<number | undefined>();

type RolesRev = (typeof revisionsRolesFixture.query.pages)[number]["revisions"][number];
expectTypeOf<ExtraKeys<RolesRev, keyof ApiRevision>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<RolesRev["slots"]["main"], keyof ApiRevisionSlot>>().toEqualTypeOf<never>();
