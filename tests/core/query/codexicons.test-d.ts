/**
 * Type-level assertions for `list=codexicons`, checked against a real fixture
 * captured from mediawiki.org (module added in 1.44). Compiled by
 * `pnpm typecheck`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiCodexIcon, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/codexicons.json";

export const sample = {
  batchcomplete: true,
  query: {
    codexicons: {
      // Plain form: raw SVG markup.
      cdxIconTrash: '<path d="M10 1.6 2.8 14h14.4z"/>',
      // Object form: directionality-aware definition.
      cdxIconHelp: {
        ltr: '<path d="M8 14h4v4H8z"/>',
        shouldFlip: true,
        shouldFlipExceptions: ["he", "yi"],
      },
    },
  },
} satisfies ApiQueryResponse;

// An empty result serializes as [] (e.g. no icon matched), hence the union.
expectTypeOf<ApiQueryResult>()
  .toHaveProperty("codexicons")
  .toEqualTypeOf<Record<string, ApiCodexIcon> | unknown[] | undefined>();

// Widening-tolerant structural checks on the real fixture.
expectTypeOf(fixture.query.codexicons).toExtend<Record<string, ApiCodexIcon>>();
expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof fixture.query, keyof ApiQueryResult>>().toEqualTypeOf<never>();
