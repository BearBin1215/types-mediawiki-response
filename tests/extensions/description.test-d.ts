/**
 * Type-level assertions for the Wikibase Client ext pack (`prop=description`),
 * checked against a real mediawiki.org fv2 fixture (a page with a central
 * description next to one without).
 */
import { expectTypeOf } from "expect-type";
import type { ApiPage } from "../../src";
import type { DescriptionSource } from "../../src/extensions/description";
import type { ExtraKeys } from "../typeutil";
import fixture from "../fixtures/core/query/description.json";

export const sample = "central" satisfies DescriptionSource;

// Open union of known sources plus any string (forward-compatible).
expectTypeOf<"local">().toExtend<DescriptionSource>();
expectTypeOf<DescriptionSource>().toExtend<string>();

// Both fields ride on the shared page shape; a page without a description
// simply omits them.
expectTypeOf<ApiPage>().toHaveProperty("description").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiPage>()
  .toHaveProperty("descriptionsource")
  .toEqualTypeOf<DescriptionSource | undefined>();

// Widening-tolerant structural check on the real fixture: the page without a
// description must not carry extra keys either.
expectTypeOf<
  ExtraKeys<(typeof fixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
