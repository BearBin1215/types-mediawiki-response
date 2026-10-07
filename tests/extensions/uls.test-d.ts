/**
 * Type-level assertions for the ULS ext pack (`ulssetlang`, `ulslocalization`),
 * checked against real 1.43 responses.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiUlsLocalizationMetadata,
  ApiUlsLocalizationResponse,
  ApiUlsSetLanguageResponse,
} from "../../src/extensions/uls";
import fixture from "../fixtures/extensions/ulslocalization.json";

// `action=ulssetlang` returns no payload on success (the type exists so the
// shape is explicit, mirroring `logout`).
export const setlangSample = {} satisfies ApiUlsSetLanguageResponse;

export const metadataSample = {
  authors: ["Amire80", "Santhosh.thottingal"],
  "message-documentation": "qqq",
} satisfies ApiUlsLocalizationMetadata;

// The bundle is a flat message map with an optional metadata block; the union
// index signature accommodates both.
export const sample: ApiUlsLocalizationResponse = {
  "@metadata": { authors: ["Amire80"] },
  "uls-region-WW": "Worldwide",
};

expectTypeOf<ApiUlsLocalizationMetadata>()
  .toHaveProperty("authors")
  .toEqualTypeOf<string[] | undefined>();

// Spot-check the fixture's message values stay strings under the index signature.
expectTypeOf(fixture["uls-region-WW"]).toEqualTypeOf<string>();
