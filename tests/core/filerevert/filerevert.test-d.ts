/**
 * Type-level assertions for `action=filerevert` (local MediaWiki 1.43 fv2
 * fixture). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiFileRevertResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/filerevert/filerevert.json";

export const sample = {
  filerevert: { result: "Success" },
} satisfies ApiFileRevertResponse;

// A modern `errorformat` renders the in-band failure as `ApiMessage`s.
export const modernFailureSample = {
  filerevert: {
    result: "Failure",
    errors: [{ code: "filedoesnotexist", text: "The file does not exist." }],
  },
} satisfies ApiFileRevertResponse;

expectTypeOf<ApiFileRevertResponse["filerevert"]>()
  .toHaveProperty("result")
  .toMatchTypeOf<string | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiFileRevertResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.filerevert, keyof ApiFileRevertResponse["filerevert"]>
>().toEqualTypeOf<never>();
