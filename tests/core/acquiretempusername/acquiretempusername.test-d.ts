/**
 * Type-level assertions for `action=acquiretempusername`, checked against a
 * real local 1.43 fv2 fixture (temporary-account auto-creation enabled; the
 * same logged-out session is reused, so repeated calls return the stashed
 * name). See `info.test-d.ts` for the recipe. Compiled by `pnpm typecheck`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiAcquireTempUserNameResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/acquiretempusername/acquiretempusername.json";

export const sample = {
  acquiretempusername: "~2026-9",
} satisfies ApiAcquireTempUserNameResponse;

expectTypeOf<ApiAcquireTempUserNameResponse["acquiretempusername"]>().toEqualTypeOf<
  string | undefined
>();

// Widening-tolerant structural check on the real fixture.
expectTypeOf(fixture.acquiretempusername).toExtend<string>();
expectTypeOf<
  ExtraKeys<typeof fixture, keyof ApiAcquireTempUserNameResponse>
>().toEqualTypeOf<never>();
