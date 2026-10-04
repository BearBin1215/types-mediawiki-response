/**
 * `meta=siteinfo` — wiki configuration, merged into {@link ApiQueryResult} via
 * declaration merging.
 *
 * The module is a set of sub-object groups selected by `siprop`; every group with
 * a stable shape is modeled below (`statistics`, `usergroups`, `restrictions`,
 * `interwikimap`, `extensions`, `uploaddialog`, …).
 *
 * `general` lists the keys MediaWiki core writes; sites and extensions inject
 * further keys, which consumers add by declaration merging like any other
 * extension field.
 *
 * @see https://www.mediawiki.org/wiki/API:Siteinfo
 */
import type { ContentModel, Flag, Timestamp } from "../../common";

/**
 * Whether/case-sensitivity of page titles in a namespace. Open union for
 * forward compatibility.
 */
export type CaseSensitivity = "first-letter" | "case-sensitive" | (string & {});

/** One namespace entry in `query.namespaces`, keyed by namespace index. */
export interface ApiNamespaceInfo {
  /** Namespace index. */
  id: number;

  /** Canonical name (e.g. `Talk`), the language-independent identifier. */
  canonical?: string;

  /** Localized name for this wiki. */
  name: string;

  /** Title case-sensitivity within the namespace. */
  case: CaseSensitivity;

  /** Whether subpages are allowed. A real `boolean` under `formatversion=2`. */
  subpages: boolean;

  /** Whether the namespace is a content namespace. A real `boolean`. */
  content: boolean;

  /** Whether pages here are non-includable. A real `boolean`. */
  nonincludable: boolean;

  /**
   * Right required to edit this namespace, e.g. `editinterface` for `MediaWiki:`.
   * Absent when the namespace is unrestricted. A single right, or several joined
   * with `|` when the config lists more than one.
   */
  namespaceprotection?: string;

  /** Default content model for the namespace, e.g. `javascript`. Absent for wikitext. */
  defaultcontentmodel?: ContentModel;
}

/**
 * `query.namespaces`: a map from namespace index to its info. Negative indexes
 * are pseudo-namespaces; some indexes are absent (gaps).
 */
export interface ApiNamespaces {
  /** Info for the namespace index the key names. */
  [nsIndex: string]: ApiNamespaceInfo | undefined;
}

/**
 * Fields of `query.general` (`siprop=general`), closed on the 1.43 core key
 * set — extend by declaration merging for site- or extension-specific keys.
 */
export interface ApiSiteGeneral {
  /** Main page title. */
  mainpage: string;

  /** Canonical URL of the main page. */
  base: string;

  /** Site name. */
  sitename: string;

  /** Site logo URL. */
  logo: string;

  /** Generator, e.g. `MediaWiki 1.43.0`. */
  generator: string;

  /** PHP version string. */
  phpversion: string;

  /** Title case-sensitivity for the wiki. */
  case: CaseSensitivity;

  /** Content language code, e.g. `en`. */
  lang: string;

  /** Whether the content language is right-to-left. A real `boolean`. */
  rtl: boolean;

  /** Whether the wiki is read-only. A real `boolean`. */
  readonly: boolean;

  /**
   * Whether the write API is enabled. A {@link Flag}.
   *
   * @deprecated since MediaWiki 1.32; the write API can no longer be disabled.
   */
  writeapi: Flag;

  /** Path pattern to an article, with `$1` for the title. */
  articlepath: string;

  /** Path to `index.php`, without the host. */
  scriptpath: string;

  /** Full path to `index.php`. */
  script: string;

  /** Server host (protocol-relative or bare), e.g. `//www.mediawiki.org`. */
  server: string;

  /** Server host name. */
  servername: string;

  /** Wiki id, e.g. `mediawikiwiki`. */
  wikiid: string;

  /** Current server time. */
  time: Timestamp;

  /** Site timezone id. */
  timezone: string;

  /** Timezone offset from UTC in seconds. */
  timeoffset: number;

  /** Maximum article size in bytes. */
  maxarticlesize: number;

  /**
   * Whether the main page is served at the domain root (i.e. `$wgArticlePath`
   * is `/$1`). A real `boolean`.
   */
  mainpageisdomainroot: boolean;

  /** PHP SAPI name, e.g. `apache2handler` / `fpm-fcgi`. */
  phpsapi: string;

  /** DBMS driver, e.g. `sqlite` / `mysql`. */
  dbtype: string;

  /** DBMS server version string. */
  dbversion: string;

  /**
   * Whether the image whitelist is active. A real `boolean`, emitted only while
   * the site disallows inline external images (`$wgAllowExternalImages` off).
   */
  imagewhitelistenabled?: boolean;

  /** Whether language conversion is enabled. A real `boolean`. */
  langconversion: boolean;

  /**
   * Whether title conversion is enabled. A real `boolean`, mirroring
   * {@link linkconversion}.
   *
   * @deprecated Soft-deprecated since MediaWiki 1.36; use `linkconversion`.
   */
  titleconversion: boolean;

  /** Whether interwiki-link conversion is enabled. A real `boolean`. */
  linkconversion: boolean;

  /** Charset allowed for interwiki link prefixes (`""` when unused). */
  linkprefixcharset: string;

  /** Link-prefix regex (legacy; `""` when unused). */
  linkprefix: string;

  /** Regex deciding how much of a link trails into surrounding text. */
  linktrail: string;

  /** Characters legal in page titles, as a regex character class body. */
  legaltitlechars: string;

  /** Characters illegal in usernames. */
  invalidusernamechars: string;

  /** Whether all Unicode normalization fixes are applied. A real `boolean`. */
  allunicodefixes: boolean;

  /**
   * Whether Arabic-specific Unicode fixes are applied. A {@link Flag}.
   *
   * @deprecated since MediaWiki 1.45; the underlying config was removed in 1.35
   * (the field always reported `true`) and is no longer emitted.
   */
  fixarabicunicode?: Flag;

  /**
   * Whether Malayalam-specific Unicode fixes are applied. A {@link Flag}.
   *
   * @deprecated since MediaWiki 1.45; the underlying config was removed in 1.35
   * (the field always reported `true`) and is no longer emitted.
   */
  fixmalayalamunicode?: Flag;

  /**
   * Language fallback chain of the content language, one entry per fallback
   * code. An empty PHP list serializes as `[]`.
   */
  fallback: {
    /** Fallback language code. */
    code: string;
  }[];

  /** Fallback encoding for 8-bit text, e.g. `windows-1252`. */
  fallback8bitEncoding: string;

  /** Language variants of the content language; absent without variant support. */
  variants?: {
    /** Variant code, e.g. `zh-cn`. */
    code: string;

    /** Variant name in its own language. */
    name: string;
  }[];

  /**
   * Why the wiki is read-only; only present while {@link readonly} is `true`.
   */
  readonlyreason?: string;

  /** Whether uploads are enabled. A real `boolean` (`$wgEnableUploads`). */
  uploadsenabled: boolean;

  /**
   * Maximum upload size in bytes; an array `$wgMaxUploadSize` collapses to its
   * `*` entry.
   */
  maxuploadsize: number;

  /** Minimum chunk size for staged uploads, in bytes. */
  minuploadchunksize: number;

  /** Site favicon URL; absent when the site sets no `$wgFavicon`. */
  favicon?: string;

  /**
   * Host prefixes external images may be loaded from; `[""]` when external
   * images are allowed at large (`$wgAllowExternalImages`).
   */
  externalimages?: string[];

  /** Gallery rendering defaults. */
  galleryoptions: ApiGalleryOptions;

  /**
   * Selectable thumbnail widths, in pixels, keyed by position. Always an object
   * under `formatversion=2`, even though the value is a list server-side.
   */
  thumblimits: Record<string, number>;

  /** Selectable image-display size presets, keyed by position. Always an object under `formatversion=2`. */
  imagelimits: Record<string, ApiImageLimit>;

  /** Whether `nofollow` is added to external links. A real `boolean`. */
  nofollowlinks: boolean;

  /** Namespaces exempted from {@link nofollowlinks}. */
  nofollownsexceptions: number[];

  /** Domains exempted from {@link nofollowlinks}. */
  nofollowdomainexceptions: string[];

  /**
   * `target` for external links. A real `boolean` (`false`) while the site sets
   * no target, otherwise the attribute string such as `_blank`.
   */
  externallinktarget: string | boolean;

  /** Whether interwiki prefixes may be used as magic links. A real `boolean`. */
  interwikimagic: boolean;

  /**
   * Magic-link keywords and whether each is enabled; mirrors
   * `$wgEnableMagicLinks` verbatim, so an empty set serializes as `[]`.
   */
  magiclinks: Record<string, boolean> | unknown[];

  /** Method used to look up a user's central account id. */
  centralidlookupprovider: string;

  /** All available central-id lookup providers. */
  allcentralidlookupproviders: string[];

  /** Whether misc (miser-mode) features are enabled. A real `boolean`. */
  misermode: boolean;

  /** Category sort order algorithm, e.g. `uppercase` / `unicode`. */
  categorycollation: string;

  /**
   * `$wgVariantArticlePath` as configured: the URL pattern, or `false` when
   * unset.
   */
  variantarticlepath: string | boolean;

  /** Git branch of the deployment; only present on git checkouts. */
  "git-branch"?: string;

  /** Git commit hash of the deployment; only present on git checkouts. */
  "git-hash"?: string;
}

/**
 * `general.galleryoptions`: the site's `$wgGalleryOptions`, with core's defaults
 * filled in for any key the site omits.
 */
export interface ApiGalleryOptions {
  /** Images per row; `0` lets the skin decide. */
  imagesPerRow: number;

  /** Thumbnail width in pixels. */
  imageWidth: number;

  /** Thumbnail height in pixels. */
  imageHeight: number;

  /** Whether captions are length-limited. A real `boolean`. */
  captionLength: boolean;

  /** Whether file sizes are shown. A real `boolean`. */
  showBytes: boolean;

  /** Whether dimensions are shown. A real `boolean`. */
  showDimensions: boolean;

  /** Gallery layout, e.g. `traditional`, `nolines`, `packed`, `modified-packed`. */
  mode: string;
}

/** One entry of `general.imagelimits`: a selectable display size. */
export interface ApiImageLimit {
  /** Width in pixels. */
  width: number;

  /** Height in pixels. */
  height: number;
}

/** Site counters (`siprop=statistics`). */
export interface ApiSiteStatistics {
  /** Total pages in all namespaces. */
  pages: number;

  /** Pages in content namespaces. */
  articles: number;

  /** Total revisions. */
  edits: number;

  /** Stored files. */
  images: number;

  /** Registered users. */
  users: number;

  /** Users active within the activity window. */
  activeusers: number;

  /** Members of the `sysop` group. */
  admins: number;

  /** Queued jobs. */
  jobs: number;
}

/**
 * One user group (`siprop=usergroups`). The right-granting lists come from
 * `$wgAddGroups`/`$wgRemoveGroups`/…, so they are absent when unconfigured.
 */
export interface ApiUserGroup {
  /** Group key; `*` is the anonymous group. */
  name: string;

  /** Rights granted by the group. */
  rights: string[];

  /** Member count. Only with `sinumberingroup`; absent for `*` and autopromote groups. */
  number?: number;

  /** Groups an admin may add this group to. */
  add?: string[];

  /** Groups an admin may remove this group from. */
  remove?: string[];

  /** Groups a user may grant to themselves. */
  "add-self"?: string[];

  /** Groups a user may revoke from themselves. */
  "remove-self"?: string[];
}

/**
 * `siprop=restrictions`: protection types and levels. `levels` is **not** a flat
 * string list — FlaggedRevs registers a protection class as a nested array, so an
 * element can be `string[]` (e.g. `["sreview"]`).
 */
export interface ApiSiteRestrictions {
  /** Restriction kinds, e.g. `create`, `edit`, `move`, `upload`. */
  types: string[];

  /** Selectable protection levels; `""` means unrestricted. */
  levels: (string | string[])[];

  /** Levels that may cascade. */
  cascadinglevels: string[];

  /** Levels treated as semi-protection. */
  semiprotectedlevels: string[];
}

/** `siprop=rightsinfo`: where to read the site's content-rights statement. */
export interface ApiRightsInfo {
  /** Rights-page/account URL; empty string when unset (not absent). */
  url: string;

  /** Link text override; empty string when unset. */
  text: string;
}

/** One localized namespace alias (`siprop=namespacealiases`). */
export interface ApiNamespaceAlias {
  /** Alias of the namespace this entry belongs to, not a page id. */
  id: number;

  /** The alias, e.g. `Image`. */
  alias: string;
}

/** One localized special-page alias (`siprop=specialpagealiases`). */
export interface ApiSpecialPageAlias {
  /** Canonical page name, e.g. `Ancientpages`. */
  realname: string;

  /** Aliases recognized for it in the content language. */
  aliases: string[];
}

/** One uploadable file extension (`siprop=fileextensions`). */
export interface ApiFileExtension {
  /** Extension without the dot, e.g. `png`. */
  ext: string;
}

/**
 * `siprop=extensions`: one installed extension or skin. Keys other than
 * {@link type} appear only when the component's `extension.json` declares them.
 */
export interface ApiSiteExtension {
  /**
   * Component class. The names MediaWiki has display labels for are
   * `specialpage`, `editor`, `wikifamily`, `parserhook`, `variable`, `media`,
   * `antispam`, `skin`, `api` and `other`, but the value is never validated
   * against them: a component declares its own `type` in `extension.json`,
   * `$wgExtensionCredits` entries pass through as written, and the
   * `ExtensionTypes` hook can add further names — **open union**.
   */
  type:
    | "specialpage"
    | "editor"
    | "wikifamily"
    | "parserhook"
    | "variable"
    | "media"
    | "antispam"
    | "skin"
    | "api"
    | "other"
    | (string & {});

  /** Display name. */
  name?: string;

  /** Message key holding the name. */
  namemsg?: string;

  /** Literal description, when configured. */
  description?: string;

  /** Message key holding the description. */
  descriptionmsg?: string;

  /** Parameters for {@link descriptionmsg}. */
  descriptionmsgparams?: string[];

  /** Authors, joined with `, ` (links are embedded as URLs). */
  author?: string;

  /** Project URL. */
  url?: string;

  /** Declared version. */
  version?: string;

  /** VCS system, e.g. `git`; only for checkout-installed components. */
  "vcs-system"?: string;

  /** VCS commit of the checkout. */
  "vcs-version"?: string;

  /**
   * VCS URL of the checkout; `false` when the repository has no viewable
   * remote URL.
   */
  "vcs-url"?: string | false;

  /** VCS commit date of the checkout. */
  "vcs-date"?: Timestamp;

  /** License identifier from `extension.json`. */
  "license-name"?: string;

  /** URL of `Special:Version/License/<name>`. */
  license?: string;

  /** URL of `Special:Version/Credits/<name>`. */
  credits?: string;
}

/** One installed skin (`siprop=skins`). */
export interface ApiSiteSkin {
  /** Skin key, e.g. `vector-2022`. */
  code: string;

  /** Display name, localized when `skinname-*` exists. */
  name: string;

  /** Present when the skin is the site default. A {@link Flag}. */
  default?: Flag;

  /** Present when the skin is installed but not selectable. A {@link Flag}. */
  unusable?: Flag;
}

/** One magic word (`siprop=magicwords`). */
export interface ApiMagicWord {
  /** Internal name, e.g. `img_lossy`. */
  name: string;

  /** Alias patterns, with `$1` for the argument. */
  aliases: string[];

  /** Whether matching is case-sensitive. A real `boolean`. */
  "case-sensitive": boolean;
}

/** One hook and its subscribers (`siprop=showhooks`). */
export interface ApiShowHook {
  /** Hook name. */
  name: string;

  /** `Class::method` handlers registered for it. */
  subscribers: string[];
}

/** One database host (`siprop=dbrepllag`). */
export interface ApiDbReplLag {
  /** Host name; empty string when `$wgShowHostnames` hides it. */
  host: string;

  /** Seconds of lag; `-1` when the host is not a replica. */
  lag: number;
}

/** One interwiki prefix (`siprop=interwikimap`). */
export interface ApiInterwikiMapEntry {
  /** Interwiki prefix, e.g. `mw`. */
  prefix: string;

  /** `true` when links using this prefix are always local (`iw_local`). A {@link Flag}. */
  local?: Flag;

  /** `true` when the prefix may be transcluded (`iw_trans`). A {@link Flag}. */
  trans?: Flag;

  /** URL template, with `$1` for the target title. */
  url: string;

  /** Whether the stored template is protocol-relative. A real `boolean`. */
  protorel: boolean;

  /** Language name, for language-coded prefixes. */
  language?: string;

  /**
   * Current code when {@link prefix} is a deprecated language code.
   *
   * @since MediaWiki 1.40
   */
  deprecated?: string;

  /** BCP 47 form of the language code. */
  bcp47?: string;

  /** Present for a locally defined prefix (`$wgLocalInterwikis`). A {@link Flag}. */
  localinterwiki?: Flag;

  /** Present when the prefix feeds interlanguage links. A {@link Flag}. */
  extralanglink?: Flag;

  /** Effective language code of an `extralanglink` prefix. */
  code?: string;

  /** Link text from `interlanguage-link-<prefix>`. */
  linktext?: string;

  /** Site name from `interlanguage-link-sitename-<prefix>`. */
  sitename?: string;

  /** Wiki id, for `wikiid`-scoped prefixes. */
  wikiid?: string;

  /** API endpoint from the `interwiki` table. */
  api?: string;
}

/** One language entry (`siprop=languages`). */
export interface ApiSiteLanguage {
  /** Language code. */
  code: string;

  /** BCP 47 form of {@link code}. */
  bcp47: string;

  /** Localized language name. */
  name: string;
}

/** One language variant and its fallbacks (`siprop=languagevariants`). */
export interface ApiLanguageVariant {
  /** Variant codes tried before falling back to the base language. */
  fallbacks?: string[];
}

/** One software component (`siprop=libraries` / `siprop=clientlibraries`). */
export interface ApiSoftwareLibrary {
  /** Package name, e.g. `bacon/bacon-qr-code`. */
  name: string;

  /** Installed version. */
  version: string;
}

/**
 * One autopromote condition. A group's set is an **object with numeric keys**
 * under fv2 (the PHP array also carries `operand`), so nested sets surface as
 * `"0"`, `"1"`, … entries alongside {@link operand}.
 */
export interface ApiAutopromoteCondition {
  /** Condition constant name, e.g. `APCOND_EDITCOUNT`. */
  condname?: string;

  /** Arguments for the condition (counts in days, edits, …). */
  params?: unknown[];

  /** Operator combining the set: `&`, `|`, `^`, or `!`. */
  operand?: string;

  /** Nested condition sets, keyed by position. */
  [position: string]: ApiAutopromoteCondition | string | unknown[] | undefined;
}

/**
 * Autopromote condition sets keyed by group name (`siprop=autopromote`). A full
 * condition set arrives as a single {@link ApiAutopromoteCondition} carrying an
 * `operand`; a single-condition or bare-string configuration arrives wrapped in
 * a one-element array.
 */
export interface ApiAutopromoteConditions {
  /** Condition set for the group the key names. */
  [group: string]: ApiAutopromoteCondition | ApiAutopromoteCondition[] | string[] | undefined;
}

/**
 * Autopromote-once configuration keyed by hook name (`siprop=autopromoteonce`).
 * A hook with nothing configured arrives as an empty **array**, because
 * `formatversion=2` cannot tell an empty PHP list from an empty map.
 */
export interface ApiAutopromoteOnce {
  /** Condition groups for the hook the key names; `[]` when none is configured. */
  [hook: string]: ApiAutopromoteConditions | unknown[] | undefined;
}

/** Temporary-account creation config (`siprop=autocreatetempuser`). */
export interface ApiAutoCreateTempUser {
  /**
   * Whether automatic temporary-account creation is on. A real `boolean`.
   *
   * @since MediaWiki 1.41
   */
  enabled: boolean;

  /**
   * Name patterns reserved for temporary accounts; only when configured.
   *
   * @since MediaWiki 1.43
   */
  matchPatterns?: string[];
}

/**
 * Upload dialog configuration (`siprop=uploaddialog`), mirroring
 * `$wgUploadDialog` verbatim.
 */
export interface ApiUploadDialog {
  /** Which extra form fields are shown. Keys are absent when not applicable. */
  fields?: {
    /** The free-form description field. */
    description?: boolean;

    /** The date field. */
    date?: boolean;

    /** The categories field. */
    categories?: boolean;
  };

  /** Message keys for the license selectors, per upload target. */
  licensemessages?: {
    /** Used when the target is this wiki. */
    local?: string;

    /** Used when the target is a foreign repo. */
    foreign?: string;
  };

  /**
   * Default edit summaries, per upload target (`local`/`foreign`), or a single
   * string on wikis that configure one. `$PAGENAME` and `$HOST` are substituted.
   */
  comment?:
    | string
    | {
        /** Used when the target is this wiki. */
        local?: string;

        /** Used when the target is a foreign repo. */
        foreign?: string;
      };

  /** Templates/placeholder text used to build the file page. */
  format?: {
    /** File page wikitext, with `$DESCRIPTION`, `$DATE`, `$SOURCE`, `$AUTHOR`, `$LICENSE` and `$CATEGORIES` substituted. */
    filepage?: string;

    /** Template for one description, with `$LANGUAGE` and `$TEXT` substituted. */
    description?: string;

    /** Source wikitext used when the uploader declares the work as their own. */
    ownwork?: string;

    /** Wikitext for the chosen license. */
    license?: string;

    /** Wikitext used instead of category links when no categories are given. */
    uncategorized?: string;
  };
}

/**
 * One component of the CycloneDX SBOM (`siprop=sbom`). Components nest: the
 * platform entries carry their PHP extensions, MediaWiki core carries its
 * composer packages and foreign resources, each extension carries its own
 * composer packages.
 */
export interface ApiSbomComponent {
  /** CycloneDX component type, e.g. `platform`, `library`, `application`. */
  type: "platform" | "library" | "application" | (string & {});

  /** Component name, e.g. `PHP`, `MediaWiki`, an extension/skin or package name. */
  name: string;

  /**
   * Version string; `null` when a foreign resource declares none, absent when
   * the source does not report one.
   */
  version?: string | null;

  /** Authors; extensions report `{ name }`, composer packages carry the raw
   * `installed.json` entries (`name`, `email`, `homepage`, `role`). */
  authors?: {
    /** Author name. */
    name?: string;

    /** Contact address, when the author declares one. */
    email?: string;

    /** Author home page. */
    homepage?: string;

    /** Contribution role as declared, e.g. `Developer`. */
    role?: string;
  }[];

  /** License name declared by the extension (`license-name`). */
  licences?: string[];

  /** SPDX license expressions of foreign-resource components (CycloneDX
   * spelling, distinct from {@link licences}). */
  licenses?: {
    /** Compound SPDX license, i.e. one using `AND`/`OR`/`WITH`; given instead of a `license` object. */
    expression?: string;

    /** A single SPDX license; given instead of an `expression`. */
    license?: {
      /** SPDX license id, e.g. `MIT`. */
      id: string;
    };
  }[];

  /** Package URL of a foreign-resource component. */
  purl?: string;

  /** External references of a foreign-resource component (e.g. upstream site). */
  externalReferences?: {
    /** Referenced resource; core emits the component's homepage. */
    url: string;

    /** Relationship kind; core emits `website`. Open union. */
    type: "website" | (string & {});
  }[];

  /** Home URL declared by the extension. */
  url?: string;

  /** Localized description (from `descriptionmsg`/`description`). */
  description?: string;

  /** Nested components (e.g. PHP extensions, composer packages). */
  components?: ApiSbomComponent[];
}

/**
 * Software Bill of Materials in CycloneDX 1.6 form (`siprop=sbom`). Requires a
 * named (logged-in, non-temporary) account. `serialNumber` embeds a fresh UUID
 * per request.
 *
 * @since MediaWiki 1.46
 * @see https://cyclonedx.org/docs/1.6/json/
 */
export interface ApiSbom {
  /** JSON schema URL, `http://cyclonedx.org/schema/bom-1.6.schema.json`. */
  $schema?: string;

  /** Always `CycloneDX`. */
  bomFormat?: string;

  /** CycloneDX spec version, e.g. `1.6`. */
  specVersion?: string;

  /** Unique BOM serial, `urn:uuid:` + a fresh UUIDv4 per request. */
  serialNumber?: string;

  /** BOM revision, always `1`. */
  version?: number;

  /** BOM-generation metadata. */
  metadata?: {
    /** When the BOM was generated, in ISO 8601. */
    timestamp?: Timestamp;
  };

  /** Platform (PHP/ICU/database), MediaWiki core and extension components. */
  components?: ApiSbomComponent[];
}

declare module "./index" {
  interface ApiQueryResult {
    /** General site configuration (`meta=siteinfo`, `siprop=general`). */
    general?: ApiSiteGeneral;

    /**
     * Upload-dialog config (`siprop=uploaddialog`), mirroring `$wgUploadDialog`
     * verbatim; an empty configuration serializes as `[]`.
     */
    uploaddialog?: ApiUploadDialog | unknown[];

    /**
     * Domains allowed to send authenticated CORS requests, from
     * `$wgCrossSiteAJAXdomains`; always a JSON array (empty when unconfigured).
     * `siprop=crosssiteajaxdomains`.
     *
     * @since MediaWiki 1.47
     */
    crosssiteajaxdomains?: string[];

    /**
     * Software Bill of Materials in CycloneDX 1.6 form. `siprop=sbom`;
     * requires a named (logged-in, non-temporary) account, so anonymous
     * requests error out.
     *
     * @since MediaWiki 1.46
     */
    sbom?: ApiSbom;

    /**
     * Domains copy-uploads may fetch from (`$wgCopyUploadsDomains`, plus the
     * on-wiki allowlist page since 1.46). `siprop=copyuploaddomains`.
     *
     * @since MediaWiki 1.45
     */
    copyuploaddomains?: string[];

    /**
     * Behavior-switch magic words (the `__NOTOC__` set).
     * `siprop=doubleunderscores`.
     *
     * @since MediaWiki 1.46
     */
    doubleunderscores?: string[];

    /** Namespace definitions (`meta=siteinfo`, `siprop=namespaces`). */
    namespaces?: ApiNamespaces;

    /** Site counters (`siprop=statistics`). */
    statistics?: ApiSiteStatistics;

    /** User groups and their rights (`siprop=usergroups`). */
    usergroups?: ApiUserGroup[];

    /** Protection types and levels (`siprop=restrictions`). */
    restrictions?: ApiSiteRestrictions;

    /** Where the site points for its content-rights statement (`siprop=rightsinfo`). */
    rightsinfo?: ApiRightsInfo;

    /** Localized namespace aliases (`siprop=namespacealiases`). */
    namespacealiases?: ApiNamespaceAlias[];

    /** Localized special-page aliases (`siprop=specialpagealiases`). */
    specialpagealiases?: ApiSpecialPageAlias[];

    /** Uploadable file extensions (`siprop=fileextensions`). */
    fileextensions?: ApiFileExtension[];

    /** Installed extensions and skins with credits (`siprop=extensions`). */
    extensions?: ApiSiteExtension[];

    /** Recognised URL protocols (`siprop=protocols`). */
    protocols?: string[];

    /** Installed skins (`siprop=skins`). */
    skins?: ApiSiteSkin[];

    /** Parser extension tags such as `<gallery>` (`siprop=extensiontags`). */
    extensiontags?: string[];

    /** Parser function names (`siprop=functionhooks`). */
    functionhooks?: string[];

    /** Parser variable ids (`siprop=variables`). */
    variables?: string[];

    /** Magic words and their aliases (`siprop=magicwords`). */
    magicwords?: ApiMagicWord[];

    /** Subscriber list per hook (`siprop=showhooks`). */
    showhooks?: ApiShowHook[];

    /** Database replica lag (`siprop=dbrepllag`). */
    dbrepllag?: ApiDbReplLag[];

    /** Interwiki prefixes and their URL templates (`siprop=interwikimap`). */
    interwikimap?: ApiInterwikiMapEntry[];

    /** Known language codes (`siprop=languages`). */
    languages?: ApiSiteLanguage[];

    /** Variant fallbacks, keyed by language then variant (`siprop=languagevariants`). */
    languagevariants?: Record<string, Record<string, ApiLanguageVariant | undefined> | undefined>;

    /** Composer packages (`siprop=libraries`). */
    libraries?: ApiSoftwareLibrary[];

    /**
     * Bundled client-side libraries (`siprop=clientlibraries`).
     *
     * @since MediaWiki 1.42
     */
    clientlibraries?: ApiSoftwareLibrary[];

    /**
     * Autopromote conditions per group (`siprop=autopromote`).
     *
     * @since MediaWiki 1.42
     */
    autopromote?: ApiAutopromoteConditions;

    /**
     * Autopromote-once hooks and their conditions (`siprop=autopromoteonce`).
     *
     * @since MediaWiki 1.42
     */
    autopromoteonce?: ApiAutopromoteOnce;

    /**
     * Temporary-account creation config (`siprop=autocreatetempuser`).
     *
     * @since MediaWiki 1.41
     */
    autocreatetempuser?: ApiAutoCreateTempUser;

    /** Default user options, keyed by option name (`siprop=defaultoptions`). */
    defaultoptions?: Record<string, string | number | boolean | undefined>;
  }
}
