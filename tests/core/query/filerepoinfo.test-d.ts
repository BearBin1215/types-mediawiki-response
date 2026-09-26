/**
 * Type-level assertions for `meta=filerepoinfo`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiFileRepoInfo, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/filerepoinfo.json";

export const sample = {
  batchcomplete: true,
  query: {
    repos: [
      {
        name: "local",
        displayname: "ApiAdmin",
        rootUrl: "/images",
        local: true,
        url: "/images",
        thumbUrl: "/images/thumb",
        initialCapital: true,
        scriptDirUrl: "",
        favicon: "http://localhost:8080/favicon.ico",
        canUpload: false,
      },
    ],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("repos")
  .toEqualTypeOf<ApiFileRepoInfo[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.repos)[number], keyof ApiFileRepoInfo>
>().toEqualTypeOf<never>();
