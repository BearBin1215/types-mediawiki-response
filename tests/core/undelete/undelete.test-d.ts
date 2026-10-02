/**
 * Type-level assertions for `action=undelete` (local MediaWiki 1.43 fv2
 * fixture). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiUndeleteResponse, ApiUndeleteResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import undeleteFixture from "../../fixtures/core/undelete/undelete.json";

export const undeleteSample = {
  undelete: { title: "Delete target", revisions: 1, fileversions: 0, reason: "fixture undelete" },
} satisfies ApiUndeleteResponse;

expectTypeOf<ExtraKeys<typeof undeleteFixture, keyof ApiUndeleteResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof undeleteFixture.undelete, keyof ApiUndeleteResult>
>().toEqualTypeOf<never>();
