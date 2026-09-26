/**
 * Type-level assertions for `list=allimages`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiAllImage, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import allimagesFixture from "../../fixtures/core/query/allimages.json";

export const sample = {
  batchcomplete: true,
  query: {
    allimages: [
      {
        timestamp: "2015-02-27T16:48:36Z",
        user: "Kaldari",
        userid: 31661,
        size: 31040,
        width: 135,
        height: 135,
        comment: "Reverted",
        canonicaltitle: "File:Wiki.png",
        url: "https://upload.example/Wiki.png",
        descriptionurl: "https://www.mediawiki.org/wiki/File:Wiki.png",
        descriptionshorturl: "https://www.mediawiki.org/w/index.php?curid=1345",
        sha1: "42fff239b5cd83bf3814f2556bae36801587e9be",
        mime: "image/png",
        mediatype: "BITMAP",
        bitdepth: 8,
        name: "Wiki.png",
        ns: 6,
        title: "File:Wiki.png",
      },
    ],
  },
  continue: { aicontinue: "WikiFarmChanges.png", continue: "-||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("allimages")
  .toEqualTypeOf<ApiAllImage[] | undefined>();

expectTypeOf(allimagesFixture.query.allimages).toExtend<unknown[]>();
expectTypeOf<ExtraKeys<typeof allimagesFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof allimagesFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof allimagesFixture.query.allimages)[number], keyof ApiAllImage>
>().toEqualTypeOf<never>();
