/**
 * Type-level assertions for `meta=siteinfo` (`general` + `namespaces`), checked
 * against a real fixture. Compiled by `pnpm typecheck`.
 *
 * Note: `general` carries a long, site/extension-specific tail of keys, so it is
 * modeled as a curated subset and NOT subset-checked with `ExtraKeys` here; only
 * the stable `query`-level keys and the namespace shape are asserted precisely.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiImageLimit,
  ApiNamespaceInfo,
  ApiQueryResponse,
  ApiQueryResult,
  ApiSiteGeneral,
  ApiSbom,
  ApiSbomComponent,
  Timestamp,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import siteinfoFixture from "../../fixtures/core/query/siteinfo.json";
import sbomFixture from "../../fixtures/core/query/siteinfo-sbom.json";

export const sample = {
  batchcomplete: true,
  query: {
    general: {
      mainpage: "Main Page",
      base: "https://www.mediawiki.org/wiki/MediaWiki",
      sitename: "MediaWiki",
      logo: "https://www.mediawiki.org/resources/assets/change-your-logo.svg",
      generator: "MediaWiki 1.43.0",
      phpversion: "8.3.33",
      phpsapi: "apache2handler",
      dbtype: "sqlite",
      dbversion: "3.46.1",
      case: "first-letter",
      lang: "en",
      rtl: false,
      readonly: false,
      writeapi: true,
      articlepath: "/wiki/$1",
      scriptpath: "/w",
      script: "/w/index.php",
      server: "//www.mediawiki.org",
      servername: "www.mediawiki.org",
      wikiid: "mediawikiwiki",
      time: "2026-09-29T11:48:11Z",
      timezone: "UTC",
      timeoffset: 0,
      maxarticlesize: 2097152,
      mainpageisdomainroot: false,
      langconversion: true,
      titleconversion: true,
      linkconversion: true,
      linkprefixcharset: "",
      linkprefix: "",
      linktrail: "/^([a-z]+)(.*)$/sD",
      legaltitlechars: " %!\"$&'()*,\\-.\\/0-9:;=?@A-Z\\^_`a-z~\\x80-\\xFF+",
      invalidusernamechars: "@:>=",
      allunicodefixes: false,
      fixarabicunicode: true,
      fixmalayalamunicode: true,
      fallback: [{ code: "de" }],
      fallback8bitEncoding: "windows-1252",
      uploadsenabled: true,
      maxuploadsize: 104857600,
      minuploadchunksize: 1024,
      galleryoptions: {
        imagesPerRow: 0,
        imageWidth: 120,
        imageHeight: 120,
        captionLength: true,
        showBytes: true,
        showDimensions: true,
        mode: "traditional",
      },
      thumblimits: { 0: 120, 1: 150 },
      imagelimits: { 0: { width: 320, height: 240 } },
      nofollowlinks: true,
      nofollownsexceptions: [],
      nofollowdomainexceptions: ["mediawiki.org"],
      externallinktarget: false,
      interwikimagic: true,
      magiclinks: { ISBN: false, PMID: false, RFC: false },
      centralidlookupprovider: "local",
      allcentralidlookupproviders: ["local"],
      misermode: false,
      categorycollation: "uppercase",
      variantarticlepath: false,
      // Site config can suppress these two.
      favicon: "https://www.mediawiki.org/favicon.ico",
      imagewhitelistenabled: false,
    } satisfies ApiSiteGeneral,
    namespaces: {
      "0": {
        id: 0,
        case: "first-letter",
        name: "",
        subpages: true,
        content: true,
        nonincludable: false,
      },
      "1": {
        id: 1,
        case: "first-letter",
        name: "Talk",
        canonical: "Talk",
        subpages: true,
        content: false,
        nonincludable: false,
      },
      "-1": {
        id: -1,
        case: "first-letter",
        name: "Special",
        canonical: "Special",
        subpages: false,
        content: false,
        nonincludable: true,
      },
    },
  },
} satisfies ApiQueryResponse;

// fv2 namespaces use `name` (fv1 `*`) and real booleans for the flags.
expectTypeOf<ApiNamespaceInfo>().toHaveProperty("subpages").toEqualTypeOf<boolean>();

// fv2 oddities in `general`: BCassoc lists arrive as objects, `writeapi` is a
// Flag (deprecated), and `variantarticlepath` passes the raw config through.
expectTypeOf<ApiSiteGeneral>()
  .toHaveProperty("thumblimits")
  .toEqualTypeOf<Record<string, number>>();
expectTypeOf<ApiSiteGeneral>()
  .toHaveProperty("imagelimits")
  .toEqualTypeOf<Record<string, ApiImageLimit>>();
expectTypeOf<ApiSiteGeneral>().toHaveProperty("writeapi").toEqualTypeOf<true>();
expectTypeOf<ApiSiteGeneral>()
  .toHaveProperty("variantarticlepath")
  .toEqualTypeOf<string | boolean>();
expectTypeOf<ApiSiteGeneral>().toHaveProperty("fallback").toEqualTypeOf<{ code: string }[]>();
expectTypeOf<ApiSiteGeneral>()
  .toHaveProperty("variants")
  .toEqualTypeOf<{ code: string; name: string }[] | undefined>();

// Keys core writes unconditionally, against the few a site config can suppress.
expectTypeOf<ApiSiteGeneral["mainpage"]>().toEqualTypeOf<string>();
expectTypeOf<ApiSiteGeneral["logo"]>().toEqualTypeOf<string>();
expectTypeOf<ApiSiteGeneral["wikiid"]>().toEqualTypeOf<string>();
expectTypeOf<ApiSiteGeneral["time"]>().toEqualTypeOf<Timestamp>();
expectTypeOf<ApiSiteGeneral["readonly"]>().toEqualTypeOf<boolean>();
expectTypeOf<ApiSiteGeneral["misermode"]>().toEqualTypeOf<boolean>();
expectTypeOf<ApiSiteGeneral["magiclinks"]>().toEqualTypeOf<Record<string, boolean>>();
expectTypeOf<ApiSiteGeneral["favicon"]>().toEqualTypeOf<string | undefined>();
expectTypeOf<ApiSiteGeneral["externalimages"]>().toEqualTypeOf<string[] | undefined>();
expectTypeOf<ApiSiteGeneral["readonlyreason"]>().toEqualTypeOf<string | undefined>();
expectTypeOf<ApiSiteGeneral["git-hash"]>().toEqualTypeOf<string | undefined>();

// Widening-tolerant structural checks on the real fixture.
expectTypeOf(siteinfoFixture.query.namespaces["0"]).toExtend<ApiNamespaceInfo>();
expectTypeOf(siteinfoFixture.query.general).toExtend<Record<string, unknown>>();

// `siprop=crosssiteajaxdomains` (1.47): a plain string array, no fixture yet.
export const crossSiteAjaxDomainsSample = {
  batchcomplete: true,
  query: {
    crosssiteajaxdomains: ["*.example.org"],
  },
} satisfies ApiQueryResponse;
expectTypeOf<ApiQueryResult>()
  .toHaveProperty("crosssiteajaxdomains")
  .toEqualTypeOf<string[] | undefined>();

// `siprop=sbom` (1.46): CycloneDX 1.6 envelope; requires a named account, so
// there is no fixture — sample hand-written from source.
export const sbomSample = {
  batchcomplete: true,
  query: {
    sbom: {
      $schema: "http://cyclonedx.org/schema/bom-1.6.schema.json",
      bomFormat: "CycloneDX",
      specVersion: "1.6",
      serialNumber: "urn:uuid:0f36d39f-3716-4a49-beea-6b9e8b6d1d6a",
      version: 1,
      metadata: { timestamp: "2026-09-30T00:00:00Z" },
      components: [
        { type: "platform", name: "PHP", version: "8.3.0" },
        { type: "application", name: "MediaWiki", version: "1.46.0" },
      ],
    },
  },
} satisfies ApiQueryResponse;
expectTypeOf<ApiQueryResult>().toHaveProperty("sbom").toEqualTypeOf<ApiSbom | undefined>();

// Only subset-check the levels whose shape we fully model.
expectTypeOf<ExtraKeys<typeof siteinfoFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof siteinfoFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();

// --- `siprop=sbom` (fixtures/core/query/siteinfo-sbom.json, 1.46 wiki) ---

// The real CycloneDX BOM: nested components (PHP → its extensions), the
// platform/library/application component kinds, and the metadata timestamp.
expectTypeOf(sbomFixture.query.sbom.components).toExtend<unknown[]>();
expectTypeOf<ExtraKeys<typeof sbomFixture.query, keyof ApiQueryResult>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<NonNullable<ApiSbom["components"]>[number], keyof ApiSbomComponent>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    NonNullable<NonNullable<ApiSbom["components"]>[number]["components"]>[number],
    keyof ApiSbomComponent
  >
>().toEqualTypeOf<never>();
