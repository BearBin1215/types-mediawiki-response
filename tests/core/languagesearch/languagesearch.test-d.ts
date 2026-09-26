/**
 * Type-level assertions for `action=languagesearch`. The fixture is a real
 * response captured from a wiki running MediaWiki 1.46+ (the action moved into
 * core in 1.46). Compiled by `pnpm typecheck`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiLanguageSearchResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/languagesearch/zh.json";

export const sample = {
  languagesearch: { zh: "zh – chinese", za: "zhuang" },
} satisfies ApiLanguageSearchResponse;

// An empty result serializes as [] (PHP empty map), hence the union.
expectTypeOf<ApiLanguageSearchResponse["languagesearch"]>().toEqualTypeOf<
  Record<string, string> | unknown[] | undefined
>();

// Widening-tolerant structural check on the real fixture.
expectTypeOf(fixture.languagesearch).toExtend<Record<string, string>>();
expectTypeOf<ExtraKeys<typeof fixture, keyof ApiLanguageSearchResponse>>().toEqualTypeOf<never>();
