/**
 * Type-level assertions for `action=parse`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiParse,
  ApiParseCategory,
  ApiParseIWLink,
  ApiParseLangLink,
  ApiParseLink,
  ApiParseResponse,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import parseFixture from "../../fixtures/core/parse/parse.json";

export const sample = {
  parse: {
    title: "Project:Types-mediawiki-response fixture",
    pageid: 0,
    // fv2: `text` is a plain HTML string (fv1 wrapped it as `{'*': …}`).
    text: "<div>…</div>",
    langlinks: [],
    categories: [{ sortkey: "", category: "Fixture", missing: true }],
    links: [{ ns: 0, title: "MediaWiki", exists: true }],
    templates: [],
    images: [],
    externallinks: ["https://example.org"],
    parsewarnings: [],
    displaytitle: "<span>…</span>",
    properties: { unexpectedUnconnectedPage: -4 },
  },
} satisfies ApiParseResponse;

expectTypeOf<ApiParse>().toHaveProperty("text").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiParse>()
  .toHaveProperty("categories")
  .toEqualTypeOf<ApiParseCategory[] | undefined>();
// `exists` is a real boolean: red links come back as an explicit `false`.
// `title`/`pageid` and the sub-item identity keys are written unconditionally.
expectTypeOf<ApiParseLink>().toHaveProperty("exists").toEqualTypeOf<boolean>();
expectTypeOf<ApiParseLink>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiParse>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiParse>().toHaveProperty("pageid").toEqualTypeOf<number>();
expectTypeOf<ApiParseCategory>().toHaveProperty("sortkey").toEqualTypeOf<string>();
expectTypeOf<ApiParseLangLink>().toHaveProperty("lang").toEqualTypeOf<string>();
expectTypeOf<ApiParseIWLink>().toHaveProperty("prefix").toEqualTypeOf<string>();

expectTypeOf(parseFixture.parse).toExtend<Record<string, unknown>>();
expectTypeOf<ExtraKeys<typeof parseFixture, keyof ApiParseResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof parseFixture.parse, keyof ApiParse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof parseFixture.parse.categories)[number], keyof ApiParseCategory>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof parseFixture.parse.links)[number], keyof ApiParseLink>
>().toEqualTypeOf<never>();
