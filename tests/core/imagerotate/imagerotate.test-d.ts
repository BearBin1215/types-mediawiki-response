/**
 * Type-level assertions for `action=imagerotate` (local MediaWiki 1.43 fv2
 * fixture). `imagerotate` is a top-level **array**. See `info.test-d.ts`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiImageRotateEntry, ApiImageRotateResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/imagerotate/imagerotate.json";

export const sample = {
  batchcomplete: true,
  imagerotate: [{ id: 501, ns: 6, title: "File:Example.png", result: "Success" }],
} satisfies ApiImageRotateResponse;

// Problem entries from the pageSet carry no `result`.
export const problemSample = {
  batchcomplete: true,
  imagerotate: [
    {
      id: 502,
      ns: 6,
      title: "File:Missing.png",
      missing: true,
      known: true,
      result: "Failure",
      errors: [
        { message: "apierror-filedoesnotexist", code: "apierror-filedoesnotexist", type: "error" },
      ],
    },
    { title: "Bad|Title", invalid: true, invalidreason: "…" },
    { pageid: 12, missing: true },
    { revid: 34, missing: true },
    { title: "Interwiki:File.png", iw: "interwiki" },
  ],
} satisfies ApiImageRotateResponse;

expectTypeOf<ApiImageRotateResponse>()
  .toHaveProperty("imagerotate")
  .toEqualTypeOf<ApiImageRotateEntry[]>();

expectTypeOf<(typeof fixture.imagerotate)[number]>().toExtend<ApiImageRotateEntry>();
expectTypeOf<ExtraKeys<typeof fixture, keyof ApiImageRotateResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.imagerotate)[number], keyof ApiImageRotateEntry>
>().toEqualTypeOf<never>();
