/**
 * Type-level assertions for `action=managetags` (local MediaWiki 1.43 fv2
 * fixtures: create and delete). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiManageTagsResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import createFixture from "../../fixtures/core/managetags/create.json";
import deleteFixture from "../../fixtures/core/managetags/delete.json";

export const createSample = {
  managetags: { operation: "create", tag: "gap-tag", success: true, logid: 753 },
} satisfies ApiManageTagsResponse;

export const deleteSample = {
  managetags: { operation: "delete", tag: "gap-tag", success: true, logid: 756 },
} satisfies ApiManageTagsResponse;

// A modern `errorformat` renders the in-band warnings as `ApiMessage`s.
export const modernWarningSample = {
  managetags: {
    operation: "create",
    tag: "gap-tag",
    success: true,
    warnings: [{ code: "deprecated-tag", text: "…" }],
  },
} satisfies ApiManageTagsResponse;

// `success` is a real boolean; `operation` is the echoed verb.
expectTypeOf<ApiManageTagsResponse["managetags"]>()
  .toHaveProperty("success")
  .toEqualTypeOf<boolean>();
expectTypeOf<ApiManageTagsResponse["managetags"]>()
  .toHaveProperty("operation")
  .toMatchTypeOf<string>();

expectTypeOf<ExtraKeys<typeof createFixture, keyof ApiManageTagsResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof createFixture.managetags, keyof ApiManageTagsResponse["managetags"]>
>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof deleteFixture, keyof ApiManageTagsResponse>>().toEqualTypeOf<never>();
