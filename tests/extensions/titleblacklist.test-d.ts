/**
 * Type-level assertions for the TitleBlacklist opt-in ext pack
 * (`action=titleblacklist`), checked against real local 1.43 fv2 fixtures: the
 * no-match `ok` case and the `blacklisted` hit against the on-wiki
 * MediaWiki:Titleblacklist page (probed anonymously — sysops hold
 * `tboverride`).
 */
import { expectTypeOf } from "expect-type";
import type { ApiTitleBlacklistResponse } from "../../src/extensions/titleblacklist";
import type { ExtraKeys } from "../typeutil";
import fixture from "../fixtures/extensions/titleblacklist.json";
import hitFixture from "../fixtures/extensions/titleblacklist-hit.json";

export const okSample = {
  titleblacklist: { result: "ok" },
} satisfies ApiTitleBlacklistResponse;

export const blacklistedSample = {
  titleblacklist: {
    result: "blacklisted",
    reason: "Not allowed",
    line: ".*GapBlocked.*",
    message: "titleblacklist-forbidden-edit",
  },
} satisfies ApiTitleBlacklistResponse;

// `result` is set on both branches; the match details only on a hit.
expectTypeOf<ApiTitleBlacklistResponse["titleblacklist"]>()
  .toHaveProperty("result")
  .toEqualTypeOf<"ok" | "blacklisted" | (string & {})>();
expectTypeOf<ApiTitleBlacklistResponse["titleblacklist"]>()
  .toHaveProperty("line")
  .toEqualTypeOf<string | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiTitleBlacklistResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.titleblacklist, keyof ApiTitleBlacklistResponse["titleblacklist"]>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof hitFixture.titleblacklist, keyof ApiTitleBlacklistResponse["titleblacklist"]>
>().toEqualTypeOf<never>();
