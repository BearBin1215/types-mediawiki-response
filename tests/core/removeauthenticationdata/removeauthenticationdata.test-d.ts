/**
 * Type-level assertions for `action=removeauthenticationdata`, checked against
 * a real local 1.43 fv2 fixture (password removal completed on a throwaway
 * account, with `$wgRemoveCredentialsBlacklist` emptied — the default forbids
 * removing the local password). See `info.test-d.ts` for the recipe. Compiled
 * by `pnpm typecheck`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiRemoveAuthenticationDataResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/removeauthenticationdata/removeauthenticationdata.json";

export const successSample = {
  removeauthenticationdata: { status: "success" },
} satisfies ApiRemoveAuthenticationDataResponse;

expectTypeOf<ApiRemoveAuthenticationDataResponse["removeauthenticationdata"]>()
  .toHaveProperty("status")
  .toEqualTypeOf<"success">();

// Widening-tolerant structural check on the real fixture.
expectTypeOf<
  ExtraKeys<typeof fixture, keyof ApiRemoveAuthenticationDataResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    typeof fixture.removeauthenticationdata,
    keyof ApiRemoveAuthenticationDataResponse["removeauthenticationdata"]
  >
>().toEqualTypeOf<never>();
