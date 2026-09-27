/**
 * Type-level assertions for the TextExtracts ext pack (`prop=extracts`),
 * checked against a real mediawiki.org fv2 fixture (a page with a plain-text
 * intro extract).
 */
import { expectTypeOf } from "expect-type";
import type { ApiPage } from "../../src";
import type { ApiExtract } from "../../src/extensions/extracts";
import type { ExtraKeys } from "../typeutil";
import fixture from "../fixtures/core/query/extracts.json";

export const sample = "Intro text…" satisfies ApiExtract;

// The extract is plain text / HTML — a string.
expectTypeOf<ApiExtract>().toEqualTypeOf<string>();

// The field rides on the shared page shape; a page without an extract omits it.
expectTypeOf<ApiPage>().toHaveProperty("extract").toEqualTypeOf<ApiExtract | undefined>();

// Widening-tolerant structural check on the real fixture.
expectTypeOf<
  ExtraKeys<(typeof fixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
