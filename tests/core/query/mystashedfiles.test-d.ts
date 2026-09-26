/**
 * Type-level assertions for `list=mystashedfiles`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiQueryResponse, ApiQueryResult, ApiStashedFile } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/mystashedfiles.json";

export const sample = {
  batchcomplete: true,
  query: {
    mystashedfiles: [
      {
        filekey: "1cyx9v655hes.p9qzkf.3.png",
        status: "finished",
        size: 70,
        width: 1,
        height: 1,
        bits: 8,
        mimetype: "image/png",
        mediatype: "BITMAP",
      },
    ] satisfies ApiStashedFile[],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("mystashedfiles")
  .toEqualTypeOf<ApiStashedFile[] | undefined>();
// Numbers here, unlike `list=filearchive`'s string sizes.
expectTypeOf<ApiStashedFile>().toHaveProperty("size").toEqualTypeOf<number | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.mystashedfiles)[number], keyof ApiStashedFile>
>().toEqualTypeOf<never>();
