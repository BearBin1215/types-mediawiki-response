/**
 * Type-level assertions for the Thanks opt-in ext pack (`action=thank`), checked
 * against a real local 1.43 fv2 fixture. See `tests/README.md` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiThankResponse, ApiThankResult } from "../../src/extensions/thanks";
import type { ExtraKeys } from "../typeutil";
import fixture from "../fixtures/extensions/thank.json";

export const sample = {
  result: { success: 1, recipient: "Peerx" },
} satisfies ApiThankResponse;

// `success` is a number (fv2), `recipient` a string; both come from a single
// literal, so both are required.
expectTypeOf<ApiThankResult>().toHaveProperty("success").toEqualTypeOf<number>();
expectTypeOf<ApiThankResult>().toHaveProperty("recipient").toEqualTypeOf<string>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiThankResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof fixture.result, keyof ApiThankResult>>().toEqualTypeOf<never>();
