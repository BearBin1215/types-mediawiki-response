/**
 * Type-level assertions for `action=clearhasmsg` (local MediaWiki 1.43 fv2
 * fixture). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiClearHasMsgResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/clearhasmsg/clearhasmsg.json";

export const sample = {
  clearhasmsg: "success",
} satisfies ApiClearHasMsgResponse;

// `clearhasmsg` is a bare status string.
expectTypeOf<ApiClearHasMsgResponse>().toHaveProperty("clearhasmsg").toEqualTypeOf<string>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiClearHasMsgResponse>>().toEqualTypeOf<never>();
