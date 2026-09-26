/**
 * Type-level assertions for `list=allusers`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiAllusersEntry, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import allusersFixture from "../../fixtures/core/query/allusers.json";

export const sample = {
  batchcomplete: true,
  query: {
    allusers: [
      {
        userid: 7030595,
        name: "Example user",
        editcount: 0,
        registration: "2016-08-03T20:27:06Z",
        groups: ["*", "user", "autoconfirmed"],
        implicitgroups: ["*", "user", "autoconfirmed"],
        rights: ["read", "edit"],
      },
    ],
  },
  continue: { aufrom: "Next user", continue: "-||" },
} satisfies ApiQueryResponse;

// Entries largely share the `list=users` shape, plus the module-only
// `recentactions` (with `auactiveusers=1`).
expectTypeOf<ApiQueryResult>()
  .toHaveProperty("allusers")
  .toEqualTypeOf<ApiAllusersEntry[] | undefined>();
expectTypeOf<ApiAllusersEntry>()
  .toHaveProperty("recentactions")
  .toEqualTypeOf<number | undefined>();

expectTypeOf(allusersFixture.query.allusers).toExtend<unknown[]>();
expectTypeOf<ExtraKeys<typeof allusersFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof allusersFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof allusersFixture.query.allusers)[number], keyof ApiAllusersEntry>
>().toEqualTypeOf<never>();
