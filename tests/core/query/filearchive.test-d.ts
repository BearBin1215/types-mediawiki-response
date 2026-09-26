/**
 * Type-level assertions for `list=filearchive`. See `info.test-d.ts` for the recipe.
 *
 * The load-bearing assertion is the sizing one: this module hands back the raw
 * `filearchive` columns, so `size`/`width`/`height`/`bitdepth` are strings while
 * `prop=imageinfo` and `list=mystashedfiles` return numbers for the same ideas.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiFileArchiveEntry,
  ApiImageMetadataItem,
  ApiQueryResponse,
  ApiQueryResult,
  Flag,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/filearchive.json";

export const sample = {
  batchcomplete: true,
  query: {
    filearchive: [
      {
        id: 1,
        name: "Fixture_archive_1790425120883.png",
        ns: 6,
        title: "File:Fixture archive 1790425120883.png",
        parseddescription: "fixture archived file",
        description: "fixture archived file",
        userid: 3,
        user: "Capadmin",
        sha1: "7c61e84ce8f8e2e32d8ff61b1bf938b16d6212ca",
        timestamp: "2026-09-26T12:18:54Z",
        size: "70",
        height: "1",
        width: "1",
        mediatype: "BITMAP",
        metadata: [
          { name: "frameCount", value: 0 },
          { name: "colorType", value: "truecolour-alpha" },
          { name: "metadata", value: [{ name: "_MW_PNG_VERSION", value: 1 }] },
        ] satisfies ApiImageMetadataItem[],
        bitdepth: "8",
        mime: "image/png",
      },
    ] satisfies ApiFileArchiveEntry[],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("filearchive")
  .toEqualTypeOf<ApiFileArchiveEntry[] | undefined>();

expectTypeOf<ApiFileArchiveEntry>().toHaveProperty("size").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiFileArchiveEntry>().toHaveProperty("bitdepth").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiFileArchiveEntry>().toHaveProperty("pagecount").toEqualTypeOf<number | undefined>();
// Only set when the file's stored content is missing.
expectTypeOf<ApiFileArchiveEntry>().toHaveProperty("filemissing").toEqualTypeOf<Flag | undefined>();
// `metadata` is explicitly `null` when the row carries none.
expectTypeOf<ApiFileArchiveEntry>()
  .toHaveProperty("metadata")
  .toEqualTypeOf<ApiImageMetadataItem[] | null | undefined>();
// The id key is `id`, not `pageid`/`arvid`.
expectTypeOf<"pageid" extends keyof ApiFileArchiveEntry ? true : false>().toEqualTypeOf<false>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.filearchive)[number], keyof ApiFileArchiveEntry>
>().toEqualTypeOf<never>();
