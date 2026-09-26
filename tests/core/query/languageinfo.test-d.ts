/**
 * Type-level assertions for `meta=languageinfo`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `query/info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiLanguageInfo, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import languageinfoFixture from "../../fixtures/core/query/languageinfo.json";

export const sample = {
  batchcomplete: true,
  query: {
    languageinfo: {
      en: {
        code: "en",
        bcp47: "en",
        dir: "ltr",
        autonym: "English",
        name: "English",
        fallbacks: [],
        variants: ["en"],
        variantnames: { en: "English" },
      },
    },
  },
} satisfies ApiQueryResponse;

// `meta=languageinfo` adds a `languageinfo` map (keyed by language code).
expectTypeOf<ApiQueryResult>()
  .toHaveProperty("languageinfo")
  .toEqualTypeOf<Record<string, ApiLanguageInfo> | undefined>();

// No omissions: response, query, and each language entry (distributed over en|zh).
expectTypeOf<
  ExtraKeys<typeof languageinfoFixture, keyof ApiQueryResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof languageinfoFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
type Lang =
  (typeof languageinfoFixture.query.languageinfo)[keyof typeof languageinfoFixture.query.languageinfo];
expectTypeOf<ExtraKeys<Lang, keyof ApiLanguageInfo>>().toEqualTypeOf<never>();
