/**
 * Type-level assertions for the CategoryTree and TemplateData opt-in packs,
 * checked against real MediaWiki 1.43 responses. See `info.test-d.ts` for the
 * assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiCategoryTreeResponse } from "../../src/extensions/categorytree";
import type {
  ApiTemplateDataMap,
  ApiTemplateDataPage,
  ApiTemplateDataParam,
  ApiTemplateDataResponse,
  ApiTemplateDataRoot,
  ApiTemplateDataText,
  TemplateDataType,
} from "../../src/extensions/templatedata";
import type { ExtraKeys } from "../typeutil";
import treeFixture from "../fixtures/extensions/categorytree.json";
import templateDataFixture from "../fixtures/extensions/templatedata.json";

// `action=categorytree` returns only rendered HTML — no `category` echo.
export const treeSample = {
  batchcomplete: true,
  categorytree: {
    html: "",
  },
} satisfies ApiCategoryTreeResponse;
expectTypeOf<ApiCategoryTreeResponse["categorytree"]>().not.toHaveProperty("category");

// `action=templatedata`: `pages` is keyed by page id; the API fills in every
// parameter field, using `null` / `[]` rather than omitting them. Without the
// `lang` request parameter the InterfaceText fields are language-keyed maps;
// with `lang` they arrive as plain strings.
export const templateDataSample = {
  batchcomplete: true,
  pages: {
    "530": {
      title: "Template:Audit templatedata",
      description: { en: "audit template" },
      params: {
        a: {
          label: { en: "A" },
          description: { en: "first" },
          type: "string",
          required: true,
          deprecated: false,
          suggested: true,
          example: { en: "x" },
          default: { en: "d" },
          autovalue: "av",
          aliases: ["aa"],
          suggestedvalues: ["p", "q"],
        },
        b: {
          label: { en: "B" },
          type: "number",
          description: null,
          required: false,
          suggested: false,
          deprecated: false,
          aliases: [],
          autovalue: null,
          default: null,
          suggestedvalues: [],
          example: null,
        },
      },
      format: "inline",
      paramOrder: ["a", "b"],
      sets: [{ label: { en: "Set one" }, params: ["a", "b"] }],
    },
    // A page without a `<templatedata>` block: only names extracted from the
    // raw wikitext, each mapping to an empty entry.
    "531": {
      title: "Template:Audit notemplatedata probe",
      notemplatedata: true,
      params: { wikitextparam: [] },
    },
    "-1": { title: "Template:Audit missing probe", missing: true },
  },
} satisfies ApiTemplateDataResponse;

// A `null` default and an empty `aliases` array are both representable, and
// InterfaceText is a language-keyed map (a string only with `lang`).
expectTypeOf<ApiTemplateDataParam>()
  .toHaveProperty("default")
  .toEqualTypeOf<ApiTemplateDataText | null | undefined>();
expectTypeOf<ApiTemplateDataParam>()
  .toHaveProperty("label")
  .toEqualTypeOf<ApiTemplateDataText | null | undefined>();
expectTypeOf<ApiTemplateDataParam>()
  .toHaveProperty("aliases")
  .toEqualTypeOf<string[] | undefined>();
// `inherits` is resolved at save time and never served.
expectTypeOf<ApiTemplateDataParam>().not.toHaveProperty("inherits");
// `type` is an open union: unknown values must still fit.
expectTypeOf<ApiTemplateDataParam>()
  .toHaveProperty("type")
  .toEqualTypeOf<TemplateDataType | undefined>();
// `maps` values are parameter references under consumer-defined keys.
expectTypeOf<ApiTemplateDataRoot>()
  .toHaveProperty("maps")
  .toEqualTypeOf<Record<string, ApiTemplateDataMap> | unknown[] | undefined>();
// A page entry may be flagged as having no data rather than being dropped.
expectTypeOf<ApiTemplateDataPage>()
  .toHaveProperty("notemplatedata")
  .toEqualTypeOf<true | undefined>();

// --- real fixtures ---

// A non-empty category renders two member rows inside the tree markup.
expectTypeOf(treeFixture.categorytree.html).toExtend<string>();
expectTypeOf<ExtraKeys<typeof treeFixture, keyof ApiCategoryTreeResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof treeFixture.categorytree, keyof ApiCategoryTreeResponse["categorytree"]>
>().toEqualTypeOf<never>();

// The captured template has a `maps` group and multilingual InterfaceText.
expectTypeOf<
  ExtraKeys<typeof templateDataFixture, keyof ApiTemplateDataResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof templateDataFixture.pages)[keyof typeof templateDataFixture.pages],
    keyof ApiTemplateDataPage
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    NonNullable<(typeof templateDataFixture.pages)["575"]["params"]>["name"],
    keyof ApiTemplateDataParam
  >
>().toEqualTypeOf<never>();
