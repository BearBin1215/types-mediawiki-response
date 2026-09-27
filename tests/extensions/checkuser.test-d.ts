/**
 * Type-level assertions for the CheckUser ext pack (`list=checkuser`,
 * `list=checkuserlog`), checked against real local 1.43 fv2 fixtures.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiCheckUserActionRow,
  ApiCheckUserIpRow,
  ApiCheckUserIpUserRow,
  ApiCheckUserLogEntry,
  ApiQueryCheckUserResult,
} from "../../src/extensions/checkuser";
import type { ExtraKeys } from "../typeutil";
import actionsFixture from "../fixtures/extensions/checkuser-actions.json";
import ipusersFixture from "../fixtures/extensions/checkuser-ipusers.json";
import useripsFixture from "../fixtures/extensions/checkuser-userips.json";
import checkuserlogFixture from "../fixtures/extensions/checkuserlog.json";

export const ipRow = {
  end: "2026-09-29T14:22:36Z",
  editcount: 13,
  start: "2026-09-27T00:48:05Z",
  address: "127.0.0.1",
} satisfies ApiCheckUserIpRow;

export const actionRow = {
  timestamp: "2026-09-29T14:22:36Z",
  ns: 0,
  title: "Ext_cu_ed_1790691754710",
  user: "Capx",
  ip: "127.0.0.1",
  agent: "curl/8.14.1",
  summary: 'Created page with "checkuser fixture edit"',
} satisfies ApiCheckUserActionRow;

export const ipUserRow = {
  end: "2026-09-29T14:22:36Z",
  editcount: 7,
  ips: ["127.0.0.1"],
  agents: ["curl/8.14.1", null],
  start: "2026-09-27T00:48:05Z",
  name: "Capx",
} satisfies ApiCheckUserIpUserRow;

export const logEntry = {
  timestamp: "2026-09-29T14:22:36Z",
  checkuser: "Capx",
  type: "userips",
  reason: "API: fixture check",
  target: "Capx",
} satisfies ApiCheckUserLogEntry;

// `agent` keeps an explicit `null` (not omitted) when unrecorded; the whole row
// literal is written per iteration, so the six base keys are required.
expectTypeOf<ApiCheckUserActionRow>().toHaveProperty("agent").toEqualTypeOf<string | null>();
expectTypeOf<ApiCheckUserActionRow>().toHaveProperty("timestamp").toEqualTypeOf<string>();
expectTypeOf<ApiCheckUserActionRow>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiCheckUserActionRow>().toHaveProperty("title").toEqualTypeOf<string>();

// `minor` only appears (as the literal `m`) on minor edits.
expectTypeOf<ApiCheckUserActionRow>().toHaveProperty("minor").toEqualTypeOf<"m" | undefined>();

// `ip` and `user` are `null` (not omitted) on rows recorded without them.
expectTypeOf<ApiCheckUserActionRow>().toHaveProperty("ip").toEqualTypeOf<string | null>();
expectTypeOf<ApiCheckUserActionRow>().toHaveProperty("user").toEqualTypeOf<string | null>();

// `ips`/`agents` entries are `null` for rows recorded without one; the arrays
// themselves (and `end`/`editcount`/`name`) are always written.
expectTypeOf<ApiCheckUserIpUserRow>().toHaveProperty("ips").toEqualTypeOf<(string | null)[]>();
expectTypeOf<ApiCheckUserIpUserRow>().toHaveProperty("end").toEqualTypeOf<string>();
expectTypeOf<ApiCheckUserIpUserRow>().toHaveProperty("name").toEqualTypeOf<string>();

// `address` is stringified, so a row recorded without an IP reports `""`.
expectTypeOf<ApiCheckUserIpRow>().toHaveProperty("address").toEqualTypeOf<string>();
expectTypeOf<ApiCheckUserIpRow>().toHaveProperty("editcount").toEqualTypeOf<number>();
// `start` needs more than one edit, so it stays optional.
expectTypeOf<ApiCheckUserIpRow>().toHaveProperty("start").toEqualTypeOf<string | undefined>();

expectTypeOf<
  ExtraKeys<(typeof actionsFixture.query.checkuser.edits)[number], keyof ApiCheckUserActionRow>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof useripsFixture.query.checkuser.userips)[number], keyof ApiCheckUserIpRow>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof ipusersFixture.query.checkuser.ipusers)[number], keyof ApiCheckUserIpUserRow>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof checkuserlogFixture.query.checkuserlog.entries)[number],
    keyof ApiCheckUserLogEntry
  >
>().toEqualTypeOf<never>();

// Each `curequest` mode fills exactly one key of the `checkuser` object.
expectTypeOf<keyof ApiQueryCheckUserResult>().toEqualTypeOf<"userips" | "edits" | "ipusers">();
