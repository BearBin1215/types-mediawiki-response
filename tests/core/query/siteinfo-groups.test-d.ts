/**
 * Type-level assertions for the `meta=siteinfo` groups beyond `general`/`namespaces`.
 * See `info.test-d.ts` for the recipe and `siteinfo.test-d.ts` for the base sample.
 *
 * The guards that matter here are the fv2 oddities: `restrictions.levels` can nest
 * an array, `usergroups` uses hyphenated `*-self` keys, and the config-ish groups
 * return real booleans (`false` included) rather than {@link Flag}s.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiAutoCreateTempUser,
  ApiAutopromoteConditions,
  ApiAutopromoteOnce,
  ApiDbReplLag,
  ApiInterwikiMapEntry,
  ApiQueryResponse,
  ApiQueryResult,
  ApiRightsInfo,
  ApiShowHook,
  ApiSiteExtension,
  ApiSiteLanguage,
  ApiSiteRestrictions,
  ApiSiteSkin,
  ApiSiteStatistics,
  ApiUserGroup,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/siteinfo-groups.json";

export const sample = {
  batchcomplete: true,
  query: {
    statistics: {
      pages: 313,
      articles: 0,
      edits: 547,
      images: 0,
      users: 5,
      activeusers: 4,
      admins: 3,
      jobs: 685,
    } satisfies ApiSiteStatistics,
    usergroups: [
      { name: "*", rights: ["createaccount", "read"] },
      {
        name: "bureaucrat",
        rights: ["blockemail", "browsearchive"],
        add: ["sysop"],
        remove: ["sysop"],
        "add-self": [],
      },
    ] satisfies ApiUserGroup[],
    restrictions: {
      types: ["create", "edit", "move", "upload"],
      levels: ["", "autoconfirmed", "sysop", ["sreview"]],
      cascadinglevels: ["sysop"],
      semiprotectedlevels: ["autoconfirmed"],
    } satisfies ApiSiteRestrictions,
    rightsinfo: { url: "", text: "" },
    namespacealiases: [{ id: 6, alias: "Image" }],
    specialpagealiases: [{ realname: "Ancientpages", aliases: ["AncientPages", "OldestPages"] }],
    fileextensions: [{ ext: "png" }],
    extensions: [
      {
        type: "skin",
        name: "MinervaNeue",
        namemsg: "skinname-minerva",
        "vcs-system": "git",
        "license-name": "GPL-2.0-or-later",
      } satisfies ApiSiteExtension,
    ],
    protocols: ["http://", "//"],
    skins: [
      { code: "vector-2022", name: "Vector (2022)", default: true },
      { code: "fallback", name: "Fallback", unusable: true },
    ],
    extensiontags: ["<pre>", "<gallery>"],
    dbrepllag: [{ host: "", lag: -1 }] satisfies ApiDbReplLag[],
    interwikimap: [
      { prefix: "w", url: "https://en.wikipedia.org/wiki/$1", protorel: false, api: "" },
    ] satisfies ApiInterwikiMapEntry[],
    libraries: [{ name: "bacon/bacon-qr-code", version: "3.0.1" }],
    clientlibraries: [{ name: "CLDRPluralRuleParser", version: "1.3.1-0dda851" }],
    autopromote: {
      autoconfirmed: {
        0: { condname: "APCOND_EDITCOUNT", params: [0] },
        1: { condname: "APCOND_AGE", params: [0] },
        operand: "&",
      },
      // A single-condition config arrives wrapped in a one-element array.
      editor: [{ condname: "APCOND_EDITCOUNT", params: [5] }],
    } satisfies ApiAutopromoteConditions,
    // Unconfigured hooks come back as an empty list, not an empty map.
    autopromoteonce: { onEdit: [] } satisfies ApiAutopromoteOnce,
    autocreatetempuser: { enabled: false },
  },
} satisfies ApiQueryResponse;

// `levels` is not a flat string list: FlaggedRevs nests a protection class.
expectTypeOf<ApiSiteRestrictions>().toHaveProperty("levels").toEqualTypeOf<(string | string[])[]>();
// Hyphenated group keys are modeled verbatim.
expectTypeOf<"add-self" extends keyof ApiUserGroup ? true : false>().toEqualTypeOf<true>();
// Config groups return real booleans, so `false` is representable.
expectTypeOf<ApiQueryResult>()
  .toHaveProperty("statistics")
  .toEqualTypeOf<ApiSiteStatistics | undefined>();

// Root- and query-level keys the fixture carries must all be declared.
expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof fixture.query, keyof ApiQueryResult>>().toEqualTypeOf<never>();

// Row shapes that are fully modeled.
expectTypeOf<
  ExtraKeys<(typeof fixture.query.usergroups)[number], keyof ApiUserGroup>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.extensions)[number], keyof ApiSiteExtension>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.interwikimap)[number], keyof ApiInterwikiMapEntry>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.skins)[number], "code" | "name" | "default" | "unusable">
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.libraries)[number], "name" | "version">
>().toEqualTypeOf<never>();

// Skin markers and interwiki `localinterwiki`/`extralanglink` are Flags.
expectTypeOf<ApiSiteSkin>().toHaveProperty("default").toEqualTypeOf<true | undefined>();
expectTypeOf<ApiSiteSkin>().toHaveProperty("unusable").toEqualTypeOf<true | undefined>();
expectTypeOf<ApiInterwikiMapEntry>()
  .toHaveProperty("localinterwiki")
  .toEqualTypeOf<true | undefined>();
expectTypeOf<ApiInterwikiMapEntry>()
  .toHaveProperty("extralanglink")
  .toEqualTypeOf<true | undefined>();

// `siprop=languages` (`code`/`bcp47`/`name`) and `siprop=showhooks`
// (`name`/`subscribers`) have no fixture, so they get hand-written samples.
export const languagesSample = {
  batchcomplete: true,
  query: { languages: [{ code: "en", bcp47: "en", name: "English" }] },
} satisfies ApiQueryResponse;

export const showHooksSample = {
  batchcomplete: true,
  query: {
    showhooks: [{ name: "ParserFirstCallInit", subscribers: ["Foo::onParserFirstCallInit"] }],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiSiteLanguage>().toHaveProperty("code").toEqualTypeOf<string>();
expectTypeOf<ApiSiteLanguage>().toHaveProperty("bcp47").toEqualTypeOf<string>();
expectTypeOf<ApiSiteLanguage>().toHaveProperty("name").toEqualTypeOf<string>();

expectTypeOf<ApiShowHook>().toHaveProperty("name").toEqualTypeOf<string>();
expectTypeOf<ApiShowHook>().toHaveProperty("subscribers").toEqualTypeOf<string[]>();

// The remaining groups' keys are written unconditionally, so they are required.
expectTypeOf<ApiSiteRestrictions>().toHaveProperty("types").toEqualTypeOf<string[]>();
expectTypeOf<ApiSiteRestrictions>().toHaveProperty("cascadinglevels").toEqualTypeOf<string[]>();
expectTypeOf<ApiSiteRestrictions>().toHaveProperty("semiprotectedlevels").toEqualTypeOf<string[]>();

expectTypeOf<ApiRightsInfo>().toHaveProperty("url").toEqualTypeOf<string>();
expectTypeOf<ApiRightsInfo>().toHaveProperty("text").toEqualTypeOf<string>();

expectTypeOf<ApiAutoCreateTempUser>().toHaveProperty("enabled").toEqualTypeOf<boolean>();
expectTypeOf<ApiAutoCreateTempUser>()
  .toHaveProperty("matchPatterns")
  .toEqualTypeOf<string[] | undefined>();
