/**
 * Type-level assertions for the Linter and Gadgets opt-in packs, checked
 * against real MediaWiki 1.43 responses. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiLintError,
  ApiLintErrorParams,
  ApiLintTemplateInfo,
  ApiQueryLinterStats,
} from "../../src/extensions/linter";
import type {
  ApiGadget,
  ApiGadgetCategory,
  ApiGadgetModule,
  ApiGadgetSettings,
} from "../../src/extensions/gadgets";
import type { ExtraKeys } from "../typeutil";
import lintErrorsFixture from "../fixtures/extensions/linterrors.json";
import linterStatsFixture from "../fixtures/extensions/linterstats.json";
import gadgetsFixture from "../fixtures/extensions/gadgets.json";
import gadgetCategoriesFixture from "../fixtures/extensions/gadgetcategories.json";

// `meta=linterstats`: per-category totals, keyed by site-configurable names.
export const statsSample = {
  batchcomplete: true,
  query: {
    linterstats: {
      totals: {
        "missing-end-tag": 3,
        "html5-misnesting": 0,
      },
    },
  },
} satisfies { batchcomplete?: true; query: { linterstats: ApiQueryLinterStats } };

// A lint row: `location` stays a two-element array, `params` is a map.
export const lintErrorSample = {
  pageid: 542,
  ns: 0,
  title: "Linter probe",
  lintId: 7,
  category: "missing-end-tag",
  location: [12, 18],
  templateInfo: { title: "Template:Foo", multiPartTemplateBlock: true },
  params: { name: "span" },
} satisfies ApiLintError;

// `list=linterrors` takes no `*prop=`: every field is written unconditionally.
expectTypeOf<ApiLintError>().toHaveProperty("templateInfo").toEqualTypeOf<ApiLintTemplateInfo>();
expectTypeOf<ApiLintError>().toHaveProperty("pageid").toEqualTypeOf<number>();
expectTypeOf<ApiLintError>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiLintError>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiLintError>().toHaveProperty("lintId").toEqualTypeOf<number>();
expectTypeOf<ApiLintError>().toHaveProperty("params").toEqualTypeOf<ApiLintErrorParams>();

// `list=gadgets`: metadata splits into settings and module lists.
export const gadgetSample = {
  id: "AuditGadget",
  desc: "<p>audit gadget description</p>",
  metadata: {
    settings: {
      actions: [],
      categories: [],
      category: "",
      contentModels: [],
      default: false,
      hidden: false,
      legacyscripts: false,
      namespaces: [],
      package: false,
      requiresES6: false,
      rights: ["edit"],
      shared: false,
      skins: [],
      supportsUrlLoad: false,
    },
    module: {
      datas: [],
      dependencies: ["mediawiki.api"],
      messages: [],
      peers: [],
      scripts: ["site"],
      styles: [],
    },
  },
} satisfies ApiGadget;

// `gcprop=title` writes the value under `desc`, not `title`.
export const gadgetCategorySample = {
  name: "Gadget cat A",
  desc: "<p>section text</p>",
  members: 2,
} satisfies ApiGadgetCategory;
expectTypeOf<ApiGadgetCategory>().not.toHaveProperty("title");

// `totals` is an open map: any category key the site registers must fit.
expectTypeOf<ApiQueryLinterStats>()
  .toHaveProperty("totals")
  .toEqualTypeOf<Record<string, number> | undefined>();
// `location` stays an array under fv2; `category` is a site-configurable name.
expectTypeOf<ApiLintError>().toHaveProperty("location").toEqualTypeOf<number[]>();
expectTypeOf<ApiLintError>().toHaveProperty("category").toEqualTypeOf<string>();
// `desc` is HTML, not a plain string type.
expectTypeOf<ApiGadget>().toHaveProperty("desc").toEqualTypeOf<string | undefined>();

// --- real fixtures ---

// The recorded lint row (`self-closed-tag` on the seeded page): `templateInfo`
// is the always-present `{}` for a non-transclusion error.
expectTypeOf<
  ExtraKeys<(typeof lintErrorsFixture.query.linterrors)[number], keyof ApiLintError>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof linterStatsFixture.query.linterstats, keyof ApiQueryLinterStats>
>().toEqualTypeOf<never>();

// The captured gadgets both live in a definition section, so `category` is
// non-empty and `package`/`hidden` split across the two rows.
expectTypeOf<
  ExtraKeys<(typeof gadgetsFixture.query.gadgets)[number], keyof ApiGadget>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof gadgetsFixture.query.gadgets)[number]["metadata"]["settings"],
    keyof ApiGadgetSettings
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof gadgetsFixture.query.gadgets)[number]["metadata"]["module"],
    keyof ApiGadgetModule
  >
>().toEqualTypeOf<never>();

// The definition section surfaces as one category with its members count.
expectTypeOf<
  ExtraKeys<
    (typeof gadgetCategoriesFixture.query.gadgetcategories)[number],
    keyof ApiGadgetCategory
  >
>().toEqualTypeOf<never>();
