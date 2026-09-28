/**
 * Type-level assertions for the SiteMatrix ext pack (`action=sitematrix`),
 * checked against a real local 1.43 fv2 fixture (a fabricated farm matrix).
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiSiteMatrixLanguage,
  ApiSiteMatrixResponse,
  ApiSiteMatrixResult,
  ApiSiteMatrixSite,
  ApiSiteMatrixSpecial,
} from "../../src/extensions/sitematrix";
import type { ExtraKeys } from "../typeutil";
import sitematrixFixture from "../fixtures/extensions/sitematrix.json";

export const sample = {
  sitematrix: {
    count: 5,
    "0": {
      code: "de",
      name: "Deutsch",
      dir: "ltr",
      site: [
        {
          url: "https://de.wikipedia.org",
          dbname: "dewiki",
          code: "wiki",
          sitename: "Deutsche Wikipedia",
          closed: true,
        },
      ],
    },
    specials: [
      {
        url: "https://meta.wikimedia.org",
        dbname: "metawiki",
        code: "meta",
        lang: "en",
        sitename: "Meta Wiki",
        private: true,
      },
    ],
  },
} satisfies ApiSiteMatrixResponse;

// Language entries keep their numeric-string keys (fv2: `count` breaks the array).
expectTypeOf<ApiSiteMatrixResult>().toHaveProperty("count").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiSiteMatrixResult>()
  .toHaveProperty("specials")
  .toEqualTypeOf<ApiSiteMatrixSpecial[] | undefined>();

// Language-site rows can only ever carry `closed` as a state flag; the
// private/fishbowl/nonglobal flags exist on special-wiki rows only.
expectTypeOf<ApiSiteMatrixSite>().toHaveProperty("closed").toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiSiteMatrixSpecial>().toHaveProperty("private").toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiSiteMatrixSpecial>()
  .toHaveProperty("fishbowl")
  .toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiSiteMatrixSpecial>()
  .toHaveProperty("nonglobal")
  .toEqualTypeOf<boolean | undefined>();

// The fixture's language rows land under numeric-string keys; grab one directly
// from the fixture (concrete array shape) rather than the optional-typed interface.
const language = sitematrixFixture.sitematrix["0"];
expectTypeOf<ExtraKeys<typeof language, keyof ApiSiteMatrixLanguage>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof language.site)[number], keyof ApiSiteMatrixSite>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof sitematrixFixture.sitematrix)["specials"][number], keyof ApiSiteMatrixSpecial>
>().toEqualTypeOf<never>();
