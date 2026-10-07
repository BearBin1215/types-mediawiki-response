/**
 * Type-level assertions for the BetaFeatures ext pack (`list=betafeatures`),
 * checked against a real 1.43 response (a wiki with one seeded feature).
 */
import { expectTypeOf } from "expect-type";
import type { ApiBetaFeature } from "../../src/extensions/betafeatures";
import type { ExtraKeys } from "../typeutil";
import fixture from "../fixtures/extensions/betafeatures.json";

export const sample = {
  name: "fixture-beta-feature",
  count: 0,
} satisfies ApiBetaFeature;

expectTypeOf<ApiBetaFeature>().toHaveProperty("name").toEqualTypeOf<string>();
expectTypeOf<ApiBetaFeature>().toHaveProperty("count").toEqualTypeOf<number>();

// The map is keyed by feature id; its keys are site-configured, so only the
// row shape is checked against the fixture.
expectTypeOf<
  ExtraKeys<(typeof fixture.query.betafeatures)["fixture-beta-feature"], keyof ApiBetaFeature>
>().toEqualTypeOf<never>();
