/**
 * Type-level assertions for `list=alldeletedrevisions`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiAllDeletedRevisions, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/alldeletedrevisions.json";

// A live page whose oldest revision was deleted...
export const sample = {
  batchcomplete: true,
  query: {
    alldeletedrevisions: [
      {
        pageid: 313,
        revisions: [
          {
            revid: 508,
            parentid: 0,
            user: "Capadmin",
            userid: 3,
            timestamp: "2026-09-26T10:48:45Z",
            size: 19,
            sha1: "f3a7a31c3cc96a4082c7ac9a142026a1f679f8b4",
            roles: ["main"],
            slots: { main: { contentmodel: "wikitext" } },
            comment: 'Created page with "first revision text"',
            parsedcomment: "Created page with &quot;first revision text&quot;",
            tags: [],
          },
        ],
        ns: 0,
        title: "Deleted revisions target 1790419716433",
      },
    ],
  },
} satisfies ApiQueryResponse;

// ...and a fully deleted page, grouped under `pageid: 0`.
export const deletedPageSample = {
  batchcomplete: true,
  query: {
    alldeletedrevisions: [
      { pageid: 0, revisions: [{ revid: 394, parentid: 0 }], ns: 0, title: "X" },
    ],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("alldeletedrevisions")
  .toEqualTypeOf<ApiAllDeletedRevisions[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.alldeletedrevisions)[number], keyof ApiAllDeletedRevisions>
>().toEqualTypeOf<never>();
