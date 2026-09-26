/**
 * Type-level assertions for `action=import`, checked against a real local 1.43
 * fv2 fixture (XML dump upload). The `invalid`-flag branch is not reachable via
 * an XML upload in 1.43 (invalid titles are skipped before reporting), so that
 * entry stays a hand-written source-derived sample. See `info.test-d.ts` for
 * the recipe. Compiled by `pnpm typecheck`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiImportEntry, ApiImportResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/import/import.json";

export const sample = {
  import: [{ ns: 0, title: "Imported page", revisions: 1 }],
} satisfies ApiImportResponse;

// An un-importable title carries only `title` + the `invalid` flag.
export const invalidSample = {
  import: [{ title: "Bad [title]", invalid: true }],
} satisfies ApiImportResponse;

// `invalid` is a Flag; `revisions` is a numeric count.
expectTypeOf<ApiImportEntry>().toHaveProperty("invalid").toEqualTypeOf<true | undefined>();
expectTypeOf<ApiImportEntry>().toHaveProperty("revisions").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiImportEntry>().toHaveProperty("ns").toEqualTypeOf<number | undefined>();

expectTypeOf<ApiImportResponse>().toHaveProperty("import").toEqualTypeOf<ApiImportEntry[]>();

// Widening-tolerant structural check on the real fixture.
expectTypeOf(fixture.import).toExtend<unknown[]>();
expectTypeOf<
  ExtraKeys<(typeof fixture.import)[number], keyof ApiImportEntry>
>().toEqualTypeOf<never>();
