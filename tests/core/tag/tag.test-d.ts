/**
 * Type-level assertions for `action=tag` (local MediaWiki 1.43 fv2 fixture).
 * `tag` is a top-level **array**, one entry per target. See `info.test-d.ts`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiTagEntry, ApiTagResponse } from "../../../src";
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

expectTypeOf<ApiTagResponse>().toHaveProperty("tag").toEqualTypeOf<ApiTagEntry[]>();
expectTypeOf<ApiTagEntry>().toHaveProperty("status").toMatchTypeOf<string | undefined>();

expectTypeOf<(typeof fixture.tag)[number]>().toExtend<ApiTagEntry>();
expectTypeOf<ExtraKeys<typeof fixture, keyof ApiTagResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<(typeof fixture.tag)[number], keyof ApiTagEntry>>().toEqualTypeOf<never>();
