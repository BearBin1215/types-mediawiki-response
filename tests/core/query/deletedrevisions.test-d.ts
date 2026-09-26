/**
 * Type-level assertions for `prop=deletedrevisions`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiPage, ApiQueryResponse, ApiRevision } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/deletedrevisions.json";

export const sample = {
  batchcomplete: true,
  query: {
    pages: [
      {
        pageid: 271,
        ns: 0,
        title: "Deleted revisions target 1790419598688",
        deletedrevisions: [
          {
            revid: 440,
            parentid: 0,
            user: "Capadmin",
            userid: 3,
            timestamp: "2026-09-26T10:46:47Z",
            size: 19,
            sha1: "f3a7a31c3cc96a4082c7ac9a142026a1f679f8b4",
            roles: ["main"],
            slots: {
              main: {
                size: 19,
                sha1: "f3a7a31c3cc96a4082c7ac9a142026a1f679f8b4",
                contentmodel: "wikitext",
              },
            },
            comment: 'Created page with "first revision text"',
            parsedcomment: "Created page with &quot;first revision text&quot;",
            tags: [],
          },
        ],
      },
    ],
  },
} satisfies ApiQueryResponse;

// Deleted revisions are formatted exactly like live ones.
expectTypeOf<ApiPage>()
  .toHaveProperty("deletedrevisions")
  .toEqualTypeOf<ApiRevision[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.pages)[number]["deletedrevisions"][number], keyof ApiRevision>
>().toEqualTypeOf<never>();
