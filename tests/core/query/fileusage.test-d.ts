/**
 * Type-level assertions for `prop=fileusage`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiFileUsage, ApiPage, ApiQueryResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fileusageFixture from "../../fixtures/core/query/fileusage.json";

export const sample = {
  query: {
    pages: [
      {
        pageid: 455229,
        ns: 6,
        title: "File:01-wikitech-phpstorm-winscp-instance-name.png",
        fileusage: [{ pageid: 181915, ns: 0, title: "JetBrains IDEs", redirect: false }],
      },
    ],
  },
  continue: { fucontinue: "1817645", continue: "||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiPage>().toHaveProperty("fileusage").toEqualTypeOf<ApiFileUsage[] | undefined>();

expectTypeOf(fileusageFixture.query.pages).toExtend<unknown[]>();
expectTypeOf<ExtraKeys<typeof fileusageFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fileusageFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fileusageFixture.query.pages)[number]["fileusage"][number], keyof ApiFileUsage>
>().toEqualTypeOf<never>();
