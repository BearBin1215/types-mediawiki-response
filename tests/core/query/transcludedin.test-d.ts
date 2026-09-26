/**
 * Type-level assertions for `prop=transcludedin`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiPage, ApiQueryResponse, ApiTranscludedIn } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import transcludedinFixture from "../../fixtures/core/query/transcludedin.json";

export const sample = {
  query: {
    pages: [
      {
        pageid: 1188583,
        ns: 10,
        title: "Template:Version",
        transcludedin: [{ pageid: 4429, ns: 10, title: "Template:MediaWikiHook", redirect: false }],
      },
    ],
  },
  continue: { ticontinue: "4434", continue: "||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiPage>()
  .toHaveProperty("transcludedin")
  .toEqualTypeOf<ApiTranscludedIn[] | undefined>();

expectTypeOf(transcludedinFixture.query.pages).toExtend<unknown[]>();
expectTypeOf<
  ExtraKeys<typeof transcludedinFixture, keyof ApiQueryResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof transcludedinFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof transcludedinFixture.query.pages)[number]["transcludedin"][number],
    keyof ApiTranscludedIn
  >
>().toEqualTypeOf<never>();
