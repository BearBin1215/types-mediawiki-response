/**
 * Type-level assertions for `prop=stashimageinfo`. See `info.test-d.ts` for the recipe.
 *
 * Placement matters: the module is keyed by `siifilekey`, so its rows sit at
 * `query.stashimageinfo` rather than under a `pages[]` entry.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiImageMetadataItem,
  ApiQueryResponse,
  ApiQueryResult,
  ApiStashImageInfo,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/stashimageinfo.json";
import urlFixture from "../../fixtures/core/query/stashimageinfo-url.json";

export const sample = {
  batchcomplete: true,
  query: {
    stashimageinfo: [
      {
        timestamp: "2026-09-26T12:18:54Z",
        size: 70,
        width: 1,
        height: 1,
        sha1: "7c61e84ce8f8e2e32d8ff61b1bf938b16d6212ca",
        metadata: [{ name: "bitDepth", value: 8 }],
        mime: "image/png",
        bitdepth: 8,
      },
    ] satisfies ApiStashImageInfo[],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("stashimageinfo")
  .toEqualTypeOf<ApiStashImageInfo[] | undefined>();
// Numbers, unlike `list=filearchive`'s stringed columns.
expectTypeOf<ApiStashImageInfo>().toHaveProperty("size").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiStashImageInfo>().toHaveProperty("bitdepth").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiStashImageInfo>().toHaveProperty("duration").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiStashImageInfo>().toHaveProperty("pagecount").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiStashImageInfo>()
  .toHaveProperty("metadata")
  .toEqualTypeOf<ApiImageMetadataItem[] | null | undefined>();
// 1.43 rejects these `siiprop` values, so the type must not offer them.
expectTypeOf<"user" extends keyof ApiStashImageInfo ? true : false>().toEqualTypeOf<false>();
expectTypeOf<"mediatype" extends keyof ApiStashImageInfo ? true : false>().toEqualTypeOf<false>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.stashimageinfo)[number], keyof ApiStashImageInfo>
>().toEqualTypeOf<never>();

// --- `siiprop=url` family (fixtures/core/query/stashimageinfo-url.json) ---

// The full stash entry for a file requested with every `siiprop` value plus a
// `siiurlwidth` transform: the stash URL family mirrors `prop=imageinfo`'s,
// with the description links pointing at the UploadStash special page.
export const urlSample = {
  batchcomplete: true,
  query: {
    stashimageinfo: [
      {
        timestamp: "2024-01-15T12:00:00Z",
        size: 70,
        width: 1,
        height: 1,
        canonicaltitle: "File:20240115120000!Example.png",
        thumburl: "https://www.mediawiki.org/index.php/Special:UploadStash/file/abc.png",
        thumbwidth: 1,
        thumbheight: 1,
        thumbmime: "image/png",
        url: "https://www.mediawiki.org/index.php/Special:UploadStash/file/abc.png",
        descriptionurl: "https://www.mediawiki.org/index.php/Special:UploadStash/file/abc.png",
        sha1: "b2bbe763c7e1828c750d53f78550709a6fea19be",
        metadata: [{ name: "bitDepth", value: 8 }],
        commonmetadata: [],
        extmetadata: {
          DateTime: { value: "2024-01-15T12:00:00Z", source: "mediawiki-metadata", hidden: "" },
        },
        mime: "image/png",
        bitdepth: 8,
      },
    ] satisfies ApiStashImageInfo[],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiStashImageInfo>().toHaveProperty("url").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiStashImageInfo>()
  .toHaveProperty("descriptionurl")
  .toEqualTypeOf<string | undefined>();
expectTypeOf<ApiStashImageInfo>()
  .toHaveProperty("descriptionshorturl")
  .toEqualTypeOf<string | undefined>();
expectTypeOf<ApiStashImageInfo>().toHaveProperty("thumburl").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiStashImageInfo>().toHaveProperty("thumbmime").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiStashImageInfo>()
  .toHaveProperty("responsiveUrls")
  .toEqualTypeOf<Record<string, string> | undefined>();

expectTypeOf<
  ExtraKeys<(typeof urlFixture.query.stashimageinfo)[number], keyof ApiStashImageInfo>
>().toEqualTypeOf<never>();
