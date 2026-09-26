/**
 * Type-level assertions for `list=users`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiQueryResponse, ApiQueryResult, ApiUser } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import usersFixture from "../../fixtures/core/query/users.json";

export const sample = {
  batchcomplete: true,
  query: {
    users: [
      {
        userid: 743,
        name: "Tim Starling",
        editcount: 1030,
        registration: null,
        groups: ["sysop", "*", "user"],
        implicitgroups: ["*", "user"],
        rights: ["read", "edit"],
        emailable: true,
        gender: "male",
        centralids: { CentralAuth: 1, local: 743 },
        attachedlocal: { CentralAuth: true, local: true },
      },
      { name: "NoSuchUser 0a1b2c3d", missing: true, cancreate: true },
      // `usprop=groupmemberships|emailable` on a local 1.43 wiki: the membership
      // rows key the group as `group` (not `name`), and `emailable` is a real
      // boolean that comes back `false` rather than being omitted.
      {
        userid: 15,
        name: "Capaudit",
        groups: ["sysop", "user"],
        groupmemberships: [{ group: "sysop", expiry: "infinity" }],
        emailable: false,
      },
    ],
  },
} satisfies ApiQueryResponse;

// `usprop=groupmemberships` rows carry `group` + `expiry` only.
expectTypeOf<ApiUser>().toHaveProperty("groupmemberships").not.toBeAny();
expectTypeOf<ApiUser["groupmemberships"]>().toExtend<
  { group?: string; expiry?: string }[] | undefined
>();

// `registration` is nullable (auto-registered accounts report `null`).
expectTypeOf<ApiUser>().toHaveProperty("registration").toEqualTypeOf<string | null | undefined>();
expectTypeOf<ApiQueryResult>().toHaveProperty("users").toEqualTypeOf<ApiUser[] | undefined>();

// `cancreate` can come back `false`; blockinfo uses `blockedby`/`blockedtimestamp`
// with the expiry sentinel `infinite`.
expectTypeOf<ApiUser>().toHaveProperty("cancreate").toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiUser>().toHaveProperty("blockedby").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiUser>().toHaveProperty("blockedtimestamp").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiUser>()
  .toHaveProperty("blockexpiry")
  .toEqualTypeOf<string | "infinite" | undefined>();

expectTypeOf(usersFixture.query.users).toExtend<unknown[]>();
expectTypeOf<ExtraKeys<typeof usersFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof usersFixture.query, keyof ApiQueryResult>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof usersFixture.query.users)[number], keyof ApiUser>
>().toEqualTypeOf<never>();
