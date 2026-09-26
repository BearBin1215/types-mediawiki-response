/**
 * Type-level assertions for `meta=userinfo`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiAcceptLang,
  ApiBlockInfo,
  ApiQueryResponse,
  ApiQueryResult,
  ApiRateLimit,
  ApiUserInfo,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import userinfoFixture from "../../fixtures/core/query/userinfo.json";

export const sample = {
  batchcomplete: true,
  query: {
    userinfo: {
      id: 0,
      name: "203.0.113.7",
      anon: true,
      messages: false,
      groups: ["*"],
      groupmemberships: [],
      implicitgroups: ["*"],
      rights: ["read", "edit"],
      editcount: 0,
      acceptlang: [{ q: 1, code: "*" }],
      watchlistlabels: [],
      centralids: { CentralAuth: 0, local: 0 },
      attachedlocal: { CentralAuth: false, local: false },
    },
  },
} satisfies ApiQueryResponse;

// A logged-in `uiprop=email|ratelimits|changeablegroups` payload (1.43): `email`
// is the **address string** (empty when unset), not an object; the two
// rate-limit maps share a shape; `changeablegroups` uses `add`/`add-self`.
export const privateSample = {
  id: 15,
  name: "Capaudit",
  groups: ["sysop"],
  groupmemberships: [{ group: "sysop", expiry: "infinity" }],
  changeablegroups: { add: ["bot"], remove: ["bot"], "add-self": [], "remove-self": [] },
  options: {},
  realname: "",
  email: "",
  emailauthenticated: "2026-09-27T17:08:44Z",
  ratelimits: {},
  theoreticalratelimits: { edit: { user: { hits: 90, seconds: 60 } } },
  centralids: { local: 15 },
  attachedlocal: { local: true },
} satisfies ApiUserInfo;

// `uiprop=blockinfo` on a blocked user: the five block markers are real
// booleans and the expiry sentinel is the literal `infinite`.
export const blockedSample = {
  blockid: 123,
  blockedby: "Admin",
  blockedbyid: 5,
  blockreason: "vandalism",
  blockedtimestamp: "2026-01-01T00:00:00Z",
  blockedtimestampformatted: "00:00, 1 January 2026",
  blockexpiry: "infinite",
  blockpartial: true,
  blocknocreate: false,
  blockanononly: true,
  blockemail: false,
  blockowntalk: false,
} satisfies ApiUserInfo;

// `email` is a plain string; `changeablegroups` has no `set` key.
expectTypeOf<ApiUserInfo>().toHaveProperty("email").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiUserInfo>()
  .toHaveProperty("theoreticalratelimits")
  .toEqualTypeOf<Record<string, Record<string, ApiRateLimit>> | undefined>();
expectTypeOf<ApiUserInfo>()
  .toHaveProperty("changeablegroups")
  .toEqualTypeOf<
    | { add?: string[]; remove?: string[]; "add-self"?: string[]; "remove-self"?: string[] }
    | undefined
  >();

// `anon`/`temp` are Flags (only present when they apply); `messages` a real boolean.
expectTypeOf<ApiUserInfo>().toHaveProperty("anon").toEqualTypeOf<true | undefined>();
expectTypeOf<ApiUserInfo>().toHaveProperty("temp").toEqualTypeOf<true | undefined>();
expectTypeOf<ApiUserInfo>().toHaveProperty("messages").toEqualTypeOf<boolean | undefined>();

// `uiprop=blockinfo` emits `blockedby`/`blockedbyid`/`blockedtimestamp`; the
// expiry sentinel is the literal `infinite`.
expectTypeOf<ApiUserInfo>().toHaveProperty("blockedby").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiUserInfo>().toHaveProperty("blockedbyid").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiUserInfo>().toHaveProperty("blockedtimestamp").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiUserInfo>()
  .toHaveProperty("blockexpiry")
  .toEqualTypeOf<string | "infinite" | undefined>();
expectTypeOf<ApiUserInfo>()
  .toHaveProperty("blockcomponents")
  .toEqualTypeOf<ApiBlockInfo[] | undefined>();

// `cancreateaccount` can come back `false`; `unreadcount` caps as the string `1000+`.
expectTypeOf<ApiUserInfo>().toHaveProperty("cancreateaccount").toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiUserInfo>()
  .toHaveProperty("unreadcount")
  .toEqualTypeOf<number | string | undefined>();

expectTypeOf<ApiQueryResult>().toHaveProperty("userinfo").toEqualTypeOf<ApiUserInfo | undefined>();

expectTypeOf<ExtraKeys<typeof userinfoFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof userinfoFixture.query.userinfo, keyof ApiUserInfo>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof userinfoFixture.query.userinfo.acceptlang)[number], keyof ApiAcceptLang>
>().toEqualTypeOf<never>();
