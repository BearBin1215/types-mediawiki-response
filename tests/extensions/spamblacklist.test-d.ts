/**
 * Type-level assertions for the SpamBlacklist opt-in ext pack
 * (`action=spamblacklist`), checked against real local 1.43 fv2 fixtures: the
 * no-match `ok` case and the `blacklisted` hit against a local file blacklist.
 */
import { expectTypeOf } from "expect-type";
import type { ApiSpamBlacklistResponse } from "../../src/extensions/spamblacklist";
import type { ExtraKeys } from "../typeutil";
import fixture from "../fixtures/extensions/spamblacklist.json";
import hitFixture from "../fixtures/extensions/spamblacklist-hit.json";

export const okSample = {
  spamblacklist: { result: "ok" },
} satisfies ApiSpamBlacklistResponse;

export const blacklistedSample = {
  spamblacklist: { result: "blacklisted", matches: ["spam\\.example\\.com"] },
} satisfies ApiSpamBlacklistResponse;

expectTypeOf<ApiSpamBlacklistResponse["spamblacklist"]>()
  .toHaveProperty("matches")
  .toEqualTypeOf<string[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiSpamBlacklistResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.spamblacklist, keyof ApiSpamBlacklistResponse["spamblacklist"]>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof hitFixture.spamblacklist, keyof ApiSpamBlacklistResponse["spamblacklist"]>
>().toEqualTypeOf<never>();
