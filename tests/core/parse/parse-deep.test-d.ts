/**
 * Type-level assertions for the second `action=parse` pass (`tocdata`, `modules`,
 * `jsconfigvars`, `limitreportdata`). See `parse.test-d.ts` for the recipe.
 *
 * The guards that matter here: `tocdata.sections` is camelCased while
 * `prop=sections` is lowercase, and `modulestyles` is a module-name **list**
 * under fv2.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiParse,
  ApiParseLimitReportEntry,
  ApiParseResponse,
  ApiParseSection,
  ApiParseTocData,
  ApiParseTocSection,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/parse/parse-deep.json";

export const sample = {
  parse: {
    title: "ApiAdmin:Types-mediawiki-response fixture",
    pageid: 0,
    tocdata: {
      sections: [
        {
          tocLevel: 1,
          hLevel: 1,
          line: "A",
          number: "1",
          index: "1",
          fromTitle: "ApiAdmin:Types-mediawiki-response_fixture",
          codepointOffset: 0,
          anchor: "A",
          linkAnchor: "#A",
        },
      ],
      extensionData: [],
    } satisfies ApiParseTocData,
    // `showtoc` comes back as a real boolean, `false` included.
    showtoc: false,
    parsewarnings: [],
    parsewarningshtml: [],
    modules: [],
    modulescripts: [],
    modulestyles: ["mediawiki.page.gallery.styles"],
    jsconfigvars: {},
    encodedjsconfigvars: "[]",
    indicators: {},
    properties: {},
    // fv2 keeps the PHP list's numeric keys: `"0"` is the value, `"1"` the limit.
    limitreportdata: [
      { 0: "0.005", name: "limitreport-cputime" },
      { 0: 10, 1: 1000000, name: "limitreport-ppvisitednodes" },
      { 0: false, name: "cachereport-transientcontent" },
    ] satisfies ApiParseLimitReportEntry[],
  },
} satisfies ApiParseResponse;

expectTypeOf<ApiParse>().toHaveProperty("tocdata").toEqualTypeOf<ApiParseTocData | undefined>();
expectTypeOf<ApiParse>().toHaveProperty("modulestyles").toEqualTypeOf<string[] | undefined>();
expectTypeOf<ApiParse>().toHaveProperty("encodedjsconfigvars").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiParse>().toHaveProperty("showtoc").toEqualTypeOf<boolean | undefined>();

// Deprecated-but-modeled props stay visible so consumers get the IDE's strikethrough
// and replacement hint instead of a missing key (`modulescripts` is core-hard-coded
// to `[]` since 1.32).
expectTypeOf<ApiParse>().toHaveProperty("modulescripts").toEqualTypeOf<never[] | undefined>();
expectTypeOf<"headitems" extends keyof ApiParse ? true : false>().toEqualTypeOf<true>();
expectTypeOf<"parsetree" extends keyof ApiParse ? true : false>().toEqualTypeOf<true>();
expectTypeOf<"limitreporthtml" extends keyof ApiParse ? true : false>().toEqualTypeOf<true>();
expectTypeOf<"parseroutput" extends keyof ApiParse ? true : false>().toEqualTypeOf<false>(); // 1.47+ prop, outside the 1.43 baseline

// The casing asymmetry between the two TOC props is pinned on both sides.
// `prop=tocdata` omits every key whose value is empty, so its section keys are
// all optional; `prop=sections` runs `SectionMetadata::toLegacy()`, which fills
// all nine keys unconditionally from 1.40 on (1.39's core parser stopped at
// `anchor`, hence `linkAnchor` stays optional).
expectTypeOf<ApiParseTocSection>().toHaveProperty("tocLevel").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiParseTocSection>().toHaveProperty("hLevel").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiParseSection>().toHaveProperty("toclevel").toEqualTypeOf<number>();
expectTypeOf<ApiParseSection>().toHaveProperty("byteoffset").toEqualTypeOf<number | null>();
expectTypeOf<ApiParseSection>().toHaveProperty("fromtitle").toEqualTypeOf<string | false>();
expectTypeOf<ApiParseSection>().toHaveProperty("linkAnchor").toEqualTypeOf<string | undefined>();
// `TOCData::toJsonArray()` writes both container keys unconditionally.
expectTypeOf<ApiParseTocData>().toHaveProperty("sections").toEqualTypeOf<ApiParseTocSection[]>();
expectTypeOf<ApiParseTocData>()
  .toHaveProperty("extensionData")
  .toEqualTypeOf<Record<string, unknown> | unknown[]>();
// Regression guard: `prop=sections` never returned an `id`; the corrected type
// must not claim one again.
expectTypeOf<"id" extends keyof ApiParseSection ? true : false>().toEqualTypeOf<false>();
// `tocdata` sections carry a `linkAnchor` (leading `#` included).
expectTypeOf<"linkAnchor" extends keyof ApiParseTocSection ? true : false>().toEqualTypeOf<true>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiParseResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof fixture.parse, keyof ApiParse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.parse.tocdata)["sections"][number], keyof ApiParseTocSection>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.parse.tocdata, keyof ApiParseTocData>
>().toEqualTypeOf<never>();
