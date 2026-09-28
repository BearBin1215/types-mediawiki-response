/**
 * Type-level assertions for the GlobalPreferences ext pack
 * (`meta=globalpreferences`, `action=globalpreferences`,
 * `action=globalpreferenceoverrides`), checked against real local 1.43 fixtures.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiGlobalPreferenceOverridesResponse,
  ApiGlobalPreferencesResponse,
  ApiGlobalPreferencesResult,
} from "../../src/extensions/globalpreferences";
import type { ExtraKeys } from "../typeutil";
import changeFixture from "../fixtures/extensions/globalpreferences-change.json";
import overrideChangeFixture from "../fixtures/extensions/globalpreferenceoverrides-change.json";
import queryFixture from "../fixtures/extensions/globalpreferences.json";

export const changeSample = {
  globalpreferences: "success",
} satisfies ApiGlobalPreferencesResponse;

export const overrideChangeSample = {
  globalpreferenceoverrides: "success",
} satisfies ApiGlobalPreferenceOverridesResponse;

// The write modules reply with the plain string "success" at the module key
// (inherited from core ApiOptions); open union per repo convention.
expectTypeOf<ApiGlobalPreferencesResponse["globalpreferences"]>().toEqualTypeOf<
  "success" | (string & {})
>();
expectTypeOf<ApiGlobalPreferenceOverridesResponse["globalpreferenceoverrides"]>().toEqualTypeOf<
  "success" | (string & {})
>();

// Global preference values are the stored strings, returned verbatim.
expectTypeOf<ApiGlobalPreferencesResult["preferences"]>().toEqualTypeOf<
  Record<string, string> | undefined
>();

// Local overrides are copied from the option store, whose scalars are unconstrained.
expectTypeOf<ApiGlobalPreferencesResult["localoverrides"]>().toEqualTypeOf<
  Record<string, string | number | boolean> | undefined
>();

expectTypeOf<
  ExtraKeys<typeof queryFixture.query.globalpreferences, keyof ApiGlobalPreferencesResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof changeFixture, keyof ApiGlobalPreferencesResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof overrideChangeFixture, keyof ApiGlobalPreferenceOverridesResponse>
>().toEqualTypeOf<never>();
