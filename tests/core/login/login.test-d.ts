/**
 * Type-level assertions for the deprecated `action=login` (local MediaWiki 1.43
 * fv2 fixture; the deprecation `warnings` block is the modeled fact). See the
 * recipe in `info.test-d.ts`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiLoginResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/login/login.json";

export const sample = {
  login: { result: "Success", lguserid: 11, lgusername: "Capj" },
} satisfies ApiLoginResponse;

expectTypeOf<ApiLoginResponse["login"]>()
  .toHaveProperty("result")
  .toMatchTypeOf<string | undefined>();
expectTypeOf<ApiLoginResponse["login"]>()
  .toHaveProperty("lguserid")
  .toEqualTypeOf<number | undefined>();

// The fixture carries the deprecation `warnings` (an envelope fact) + `login`.
expectTypeOf<ExtraKeys<typeof fixture, keyof ApiLoginResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.login, keyof ApiLoginResponse["login"]>
>().toEqualTypeOf<never>();
