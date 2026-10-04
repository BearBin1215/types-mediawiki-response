/**
 * Type-level assertions for `action=tag` (local MediaWiki 1.43 fv2 fixture).
 * `tag` is a top-level **array**, one entry per target. See `info.test-d.ts`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiBlockInfo, ApiTagEntry, ApiTagResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/tag/tag.json";

export const sample = {
  tag: [
    {
      revid: 806,
      status: "success",
      actionlogid: 755,
      added: ["gap-tag"],
      removed: [],
    },
  ],
} satisfies ApiTagResponse;

// An `error` entry merges the formatted failure message into the entry (with
// any `apiData`, e.g. `blockinfo`); a `failure` entry carries an `errors` array.
// Both follow the request's `errorformat`.
export const errorEntrySample = {
  tag: [
    {
      revid: 807,
      status: "error",
      code: "blocked",
      info: "You have been blocked from editing.",
      blockinfo: { blockid: 1, blockedby: "Admin" },
    },
    {
      revid: 808,
      status: "failure",
      errors: [{ message: "protectedpage", code: "protectedpage", type: "error" }],
    },
  ],
} satisfies ApiTagResponse;

export const errorEntryModernSample = {
  tag: [
    { revid: 807, status: "error", code: "blocked", text: "You have been blocked from editing." },
    { revid: 808, status: "failure", errors: [{ code: "protectedpage", text: "…" }] },
  ],
} satisfies ApiTagResponse;

expectTypeOf<ApiTagResponse>().toHaveProperty("tag").toEqualTypeOf<ApiTagEntry[]>();
expectTypeOf<ApiTagEntry>().toHaveProperty("status").toMatchTypeOf<string | undefined>();
expectTypeOf<ApiTagEntry>().toHaveProperty("code").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiTagEntry>().toHaveProperty("text").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiTagEntry>().toHaveProperty("blockinfo").toEqualTypeOf<ApiBlockInfo | undefined>();

expectTypeOf<(typeof fixture.tag)[number]>().toExtend<ApiTagEntry>();
expectTypeOf<ExtraKeys<typeof fixture, keyof ApiTagResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<(typeof fixture.tag)[number], keyof ApiTagEntry>>().toEqualTypeOf<never>();
