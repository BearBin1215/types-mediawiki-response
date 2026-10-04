/**
 * Type-level assertions for `action=changeauthenticationdata`, checked against
 * a real local 1.43 fv2 fixture (password change completed on a throwaway
 * account via the `PasswordAuthenticationRequest` request). See
 * `info.test-d.ts` for the recipe. Compiled by `pnpm typecheck`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiChangeAuthenticationDataResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/changeauthenticationdata/changeauthenticationdata.json";

export const successSample = {
  changeauthenticationdata: { status: "success" },
} satisfies ApiChangeAuthenticationDataResponse;

expectTypeOf<ApiChangeAuthenticationDataResponse["changeauthenticationdata"]>()
  .toHaveProperty("status")
  .toEqualTypeOf<"success">();

// Widening-tolerant structural check on the real fixture.
expectTypeOf<
  ExtraKeys<typeof fixture, keyof ApiChangeAuthenticationDataResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    typeof fixture.changeauthenticationdata,
    keyof ApiChangeAuthenticationDataResponse["changeauthenticationdata"]
  >
>().toEqualTypeOf<never>();
