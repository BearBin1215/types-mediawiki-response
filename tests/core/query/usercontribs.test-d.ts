/**
 * Type-level assertions for `list=usercontribs`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiQueryResponse, ApiQueryResult, ApiUserContrib } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import usercontribsFixture from "../../fixtures/core/query/usercontribs.json";

export const sample = {
  batchcomplete: true,
  query: {
    usercontribs: [
      {
        userid: 743,
        user: "Tim Starling",
        pageid: 26681,
        revid: 8532502,
        parentid: 7932599,
        ns: 0,
        title: "Wikidiff2",
        timestamp: "2026-07-30T03:17:40Z",
        new: false,
        minor: false,
        top: false,
        comment: "now in PIE",
        size: 9530,
        sizediff: 313,
        tags: ["wikieditor"],
      },
    ],
  },
  continue: { uccontinue: "20260113054209|8148396", continue: "-||" },
} satisfies ApiQueryResponse;

// `new`/`minor`/`top` are real booleans here (unlike `prop=revisions` flags).
expectTypeOf<ApiUserContrib>().toHaveProperty("new").toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiQueryResult>()
  .toHaveProperty("usercontribs")
  .toEqualTypeOf<ApiUserContrib[] | undefined>();

expectTypeOf(usercontribsFixture.query.usercontribs).toExtend<unknown[]>();
expectTypeOf<
  ExtraKeys<typeof usercontribsFixture, keyof ApiQueryResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof usercontribsFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof usercontribsFixture.query.usercontribs)[number], keyof ApiUserContrib>
>().toEqualTypeOf<never>();

// `ucprop=patrolled` emits **both** keys as real booleans (a non-patrolled edit
// returns `patrolled: false`, `autopatrolled: false`), and `ucprop=flags` adds
// `top` alongside `new`/`minor`.
export const patrolSample = {
  userid: 15,
  user: "Audituser",
  pageid: 525,
  revid: 830,
  parentid: 0,
  ns: 0,
  title: "Audit probe stub",
  timestamp: "2026-09-27T17:11:05Z",
  new: true,
  minor: false,
  top: true,
  patrolled: false,
  autopatrolled: false,
  size: 12,
  sizediff: 12,
  tags: [],
} satisfies ApiUserContrib;

expectTypeOf<ApiUserContrib>().toHaveProperty("patrolled").toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiUserContrib>().toHaveProperty("autopatrolled").toEqualTypeOf<boolean | undefined>();

// Hidden/suppressed markers appear only when true (`Flag`).
export const hiddenSample = {
  userid: 0,
  user: "10.0.0.1",
  texthidden: true,
  userhidden: true,
  commenthidden: true,
  suppressed: true,
} satisfies ApiUserContrib;

expectTypeOf<ApiUserContrib>().toHaveProperty("suppressed").toEqualTypeOf<true | undefined>();
