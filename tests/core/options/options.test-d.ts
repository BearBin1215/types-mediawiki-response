/**
 * Type-level assertions for `action=options`, checked against a local MediaWiki
 * 1.43 fv2 fixture. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiOptionsResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import optionsFixture from "../../fixtures/core/options/options.json";

// fv2 success is the plain string "success" (not an object).
export const sample = { options: "success" } satisfies ApiOptionsResponse;

expectTypeOf<ApiOptionsResponse>().toHaveProperty("options").toEqualTypeOf<"success">();

expectTypeOf<ExtraKeys<typeof optionsFixture, keyof ApiOptionsResponse>>().toEqualTypeOf<never>();
