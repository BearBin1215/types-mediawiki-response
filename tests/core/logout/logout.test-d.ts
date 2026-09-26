/**
 * Type-level assertions for `action=logout` (local MediaWiki 1.43 fv2 fixture —
 * the success body is empty; `ApiLogout` emits no payload key). See the recipe
 * in `info.test-d.ts`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiLogoutResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/logout/logout.json";

export const sample = {} satisfies ApiLogoutResponse;

// The empty fixture carries no keys the type does not already allow (envelope).
expectTypeOf<ExtraKeys<typeof fixture, keyof ApiLogoutResponse>>().toEqualTypeOf<never>();
