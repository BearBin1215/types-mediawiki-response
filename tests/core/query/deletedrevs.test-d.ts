/**
 * Type-level assertions for `list=deletedrevs` (deprecated since MediaWiki 1.25).
 * See `info.test-d.ts` for the recipe.
 *
 * Guards worth having: this module's names differ from its modern replacements
 * (`len` as a string, `revid`/`minor` instead of `ids`/`flags`), and the fixture
 * intentionally keeps core's deprecation `warnings` block.
 */
import { expectTypeOf } from "expect-type";
import type { ApiDeletedRevs, ApiDeletedRev, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/deletedrevs.json";

export const sample = {
  batchcomplete: true,
  continue: {
    drcontinue: "0|Deleted_revisions_target_1790419290387|20260926104139|9",
    continue: "-||",
  },
  query: {
    deletedrevs: [
      {
        revisions: [
          {
            timestamp: "2026-09-26T11:43:25Z",
            revid: 645,
            parentid: 0,
            user: "Capadmin",
            userid: 3,
            comment: 'Created page with "first revision text"',
            parsedcomment: "Created page with &quot;first revision text&quot;",
            minor: false,
            len: "19",
            sha1: "f3a7a31c3cc96a4082c7ac9a142026a1f679f8b4",
            tags: [],
          },
        ],
        ns: 0,
        title: "Deleted revisions target 1790422809652",
      },
    ],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("deletedrevs")
  .toEqualTypeOf<ApiDeletedRevs[] | undefined>();

// `len` stays a string here, unlike `prop=revisions`' numeric `size`.
expectTypeOf<ApiDeletedRev>().toHaveProperty("len").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiDeletedRev>().toHaveProperty("minor").toEqualTypeOf<boolean | undefined>();
// This module never uses the modern `ids`/`flags` grouping or a numeric `size`.
expectTypeOf<"size" extends keyof ApiDeletedRev ? true : false>().toEqualTypeOf<false>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof fixture.query, keyof ApiQueryResult>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.deletedrevs)[number], keyof ApiDeletedRevs>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    NonNullable<(typeof fixture.query.deletedrevs)[number]["revisions"]>[number],
    keyof ApiDeletedRev
  >
>().toEqualTypeOf<never>();
