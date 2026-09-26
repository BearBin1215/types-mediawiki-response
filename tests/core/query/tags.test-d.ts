/**
 * Type-level assertions for `list=tags`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiQueryResponse, ApiQueryResult, ApiTag } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import tagsFixture from "../../fixtures/core/query/tags.json";

export const sample = {
  batchcomplete: true,
  query: {
    tags: [
      {
        name: "AWB",
        displayname: "AutoWikiBrowser",
        description: "Edits made with AutoWikiBrowser",
        hitcount: 1346,
        defined: true,
        source: ["manual"],
        active: true,
      },
    ],
  },
  continue: { tgcontinue: "Emoji", continue: "-||" },
} satisfies ApiQueryResponse;

// `defined` / `active` are real booleans; `source` is an array of tags sources.
expectTypeOf<ApiTag>().toHaveProperty("defined").toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiQueryResult>().toHaveProperty("tags").toEqualTypeOf<ApiTag[] | undefined>();

expectTypeOf(tagsFixture.query.tags).toExtend<unknown[]>();
expectTypeOf<ExtraKeys<typeof tagsFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof tagsFixture.query, keyof ApiQueryResult>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof tagsFixture.query.tags)[number], keyof ApiTag>
>().toEqualTypeOf<never>();
