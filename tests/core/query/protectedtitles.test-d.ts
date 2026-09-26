/**
 * Type-level assertions for `list=protectedtitles`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiProtectedTitle, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/protectedtitles.json";

export const sample = {
  batchcomplete: true,
  query: {
    protectedtitles: [
      {
        ns: 0,
        title: "Protected title 1790419598688",
        timestamp: "2026-09-26T10:46:46Z",
        user: "Capadmin",
        userid: 3,
        comment: "fixture protected title",
        parsedcomment: "fixture protected title",
        expiry: "infinity",
        level: "sysop",
      },
    ],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("protectedtitles")
  .toEqualTypeOf<ApiProtectedTitle[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.protectedtitles)[number], keyof ApiProtectedTitle>
>().toEqualTypeOf<never>();
