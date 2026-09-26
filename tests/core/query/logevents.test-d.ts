/**
 * Type-level assertions for `list=logevents`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiLogEvent, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import logeventsFixture from "../../fixtures/core/query/logevents.json";

export const sample = {
  batchcomplete: true,
  query: {
    logevents: [
      {
        logid: 22822357,
        ns: 1198,
        title: "Translations:Help:Import/23/zh",
        pageid: 2479700,
        logpage: 2479700,
        revid: 8621116,
        params: {},
        type: "create",
        action: "create",
        user: "Pristome",
        userid: 18203310,
        timestamp: "2026-09-25T19:00:08Z",
        comment: "x",
        parsedcomment: "x",
        tags: [],
      },
    ],
  },
  continue: { lecontinue: "20260925185832|22822353", continue: "-||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("logevents")
  .toEqualTypeOf<ApiLogEvent[] | undefined>();
// `params` carries the structured log details (an object).
expectTypeOf<ApiLogEvent>()
  .toHaveProperty("params")
  .toEqualTypeOf<Record<string, unknown> | undefined>();

expectTypeOf(logeventsFixture.query.logevents).toExtend<unknown[]>();
expectTypeOf<ExtraKeys<typeof logeventsFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof logeventsFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof logeventsFixture.query.logevents)[number], keyof ApiLogEvent>
>().toEqualTypeOf<never>();

// The same visibility flags as `list=recentchanges` (`leprop=user|userid` on a
// restricted log entry); all are `Flag`s.
export const hiddenSample = {
  logid: 792,
  ns: 0,
  title: "Audit probe protected",
  type: "protect",
  action: "modify",
  anon: true,
  temp: true,
  actionhidden: true,
  userhidden: true,
  commenthidden: true,
  suppressed: true,
} satisfies ApiLogEvent;
