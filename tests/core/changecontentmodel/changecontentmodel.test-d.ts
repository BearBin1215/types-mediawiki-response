/**
 * Type-level assertions for `action=changecontentmodel` (local MediaWiki 1.43 fv2
 * fixture). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiChangeContentModelResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/changecontentmodel/changecontentmodel.json";

export const sample = {
  changecontentmodel: {
    result: "Success",
    title: "Gap ccm target",
    pageid: 479,
    contentmodel: "javascript",
    logid: 692,
    revid: 770,
  },
} satisfies ApiChangeContentModelResponse;

expectTypeOf<ApiChangeContentModelResponse["changecontentmodel"]>()
  .toHaveProperty("contentmodel")
  .toMatchTypeOf<string | undefined>();

expectTypeOf<
  ExtraKeys<typeof fixture, keyof ApiChangeContentModelResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    typeof fixture.changecontentmodel,
    keyof ApiChangeContentModelResponse["changecontentmodel"]
  >
>().toEqualTypeOf<never>();
