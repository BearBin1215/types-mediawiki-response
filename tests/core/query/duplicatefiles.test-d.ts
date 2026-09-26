/**
 * Type-level assertions for `prop=duplicatefiles`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiDuplicateFile, ApiPage, ApiQueryResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/duplicatefiles.json";

export const sample = {
  batchcomplete: true,
  query: {
    pages: [
      {
        pageid: 442,
        ns: 6,
        title: "File:Fixture duplicate a.png",
        duplicatefiles: [
          {
            name: "Fixture_duplicate_b.png",
            timestamp: "2026-09-26T12:52:07Z",
            shared: false,
            user: "Capadmin",
          },
        ],
      },
    ],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiPage>()
  .toHaveProperty("duplicatefiles")
  .toEqualTypeOf<ApiDuplicateFile[] | undefined>();
// `shared` is a real boolean (a local file answers `false`), always present.
expectTypeOf<ApiDuplicateFile>().toHaveProperty("shared").toEqualTypeOf<boolean>();
expectTypeOf<ApiDuplicateFile>().toHaveProperty("name").toEqualTypeOf<string>();
expectTypeOf<ApiDuplicateFile>().toHaveProperty("timestamp").toEqualTypeOf<string>();
// `user` needs a visible uploader, so it stays optional.
expectTypeOf<ApiDuplicateFile>().toHaveProperty("user").toEqualTypeOf<string | undefined>();
// The module has no `prop` parameter, so no extra keys are selectable.
expectTypeOf<keyof ApiDuplicateFile>().toEqualTypeOf<"name" | "timestamp" | "shared" | "user">();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    NonNullable<(typeof fixture.query.pages)[number]["duplicatefiles"]>[number],
    keyof ApiDuplicateFile
  >
>().toEqualTypeOf<never>();
