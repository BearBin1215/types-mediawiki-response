/**
 * Type-level assertions for `prop=images`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiPage, ApiQueryResponse, ApiUsedImage } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import imagesFixture from "../../fixtures/core/query/images.json";

export const sample = {
  query: {
    pages: [
      {
        pageid: 181915,
        ns: 0,
        title: "JetBrains IDEs",
        images: [{ ns: 6, title: "File:01-wikitech-phpstorm-winscp-instance-name.png" }],
      },
    ],
  },
  continue: { imcontinue: "181915|06.png", continue: "||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiPage>().toHaveProperty("images").toEqualTypeOf<ApiUsedImage[] | undefined>();

expectTypeOf<ExtraKeys<typeof imagesFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof imagesFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof imagesFixture.query.pages)[number]["images"][number], keyof ApiUsedImage>
>().toEqualTypeOf<never>();
