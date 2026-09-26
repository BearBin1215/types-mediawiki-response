/**
 * Type-level assertions for the revision-delete (suppression) shape of
 * `prop=revisions`, checked against a locally-captured suppressed-revision
 * fixture. Complements `revisions.test-d.ts`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiQueryResponse, ApiRevision } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import suppressedFixture from "../../fixtures/core/query/revisions-suppressed.json";

// A suppressed revision carries `userhidden` / `commenthidden` flags.
export const sample = {
  batchcomplete: true,
  query: {
    pages: [
      {
        pageid: 204,
        ns: 0,
        title: "Revdel target",
        revisions: [
          {
            revid: 329,
            parentid: 328,
            minor: false,
            userhidden: true,
            user: "Capadmin",
            timestamp: "2026-09-26T04:36:13Z",
            size: 20,
            roles: ["main"],
            slots: {
              main: {
                contentmodel: "wikitext",
                contentformat: "text/x-wiki",
                content: "second revision text",
              },
            },
            commenthidden: true,
            comment: "",
          },
        ],
      },
    ],
  },
} satisfies ApiQueryResponse;

// The suppression flags are Flags (present only when hidden).
expectTypeOf<ApiRevision>().toHaveProperty("userhidden").toEqualTypeOf<true | undefined>();
expectTypeOf<ApiRevision>().toHaveProperty("commenthidden").toEqualTypeOf<true | undefined>();
expectTypeOf<ApiRevision>().toHaveProperty("texthidden").toEqualTypeOf<true | undefined>();

type Rev = (typeof suppressedFixture.query.pages)[number]["revisions"][number];
expectTypeOf<ExtraKeys<Rev, keyof ApiRevision>>().toEqualTypeOf<never>();
