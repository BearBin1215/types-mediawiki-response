/**
 * Type-level assertions for `action=upload` (local MediaWiki 1.43 fv2 fixture).
 * The embedded `imageinfo` carries the upload's stored-revision metadata,
 * including `extmetadata`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiUploadImageinfo, ApiUploadResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/upload/upload.json";

export const sample = {
  upload: { result: "Success", filename: "Example.png" },
} satisfies ApiUploadResponse;

// The stored revision's imageinfo is a subset shape with the observed keys.
expectTypeOf<ApiUploadResponse["upload"]>()
  .toHaveProperty("imageinfo")
  .toEqualTypeOf<ApiUploadImageinfo | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiUploadResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.upload, keyof ApiUploadResponse["upload"]>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.upload.imageinfo, keyof ApiUploadImageinfo>
>().toEqualTypeOf<never>();
