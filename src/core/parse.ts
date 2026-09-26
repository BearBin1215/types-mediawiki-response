/**
 * `action=parse` response — parses content and returns the result under a
 * top-level `parse` object (not under `query`).
 *
 * Which sub-objects appear depends on `prop`. The rendered HTML is `parse.text`
 * as a plain string, and category/link entries use named keys (`category`,
 * `title`).
 *
 * @see https://www.mediawiki.org/wiki/API:Parsing_wikitext
 */
import type { Flag, NamespaceIndex } from "../common";
import type { ApiEnvelope } from "../envelope";

/** A category the parsed page would add itself to (`prop=categories`). */
export interface ApiParseCategory {
  /**
   * Sort key text — the piped sortkey or `{{DEFAULTSORT:…}}` value; `''` when
   * the default applies.
   */
  sortkey: string;

  /** Category name, without the `Category:` prefix. */
  category: string;

  /** Whether the category is hidden. `prop=categories`. */
  hidden?: Flag;

  /** Whether the category page is missing. `prop=categories`. */
  missing?: Flag;

  /** A `missing` category that is nonetheless "known" (a redlinked category). A {@link Flag}. */
  known?: Flag;
}

/** A wikilink or template used by the parsed page (`prop=links` / `prop=templates`). */
export interface ApiParseLink {
  /** Namespace index. */
  ns: NamespaceIndex;

  /** Target page title. */
  title: string;

  /** Whether the target page exists; an explicit `false` for redlinks. */
  exists: boolean;
}

/** An interlanguage link (`prop=langlinks`). */
export interface ApiParseLangLink {
  /** Language code. */
  lang: string;

  /** Full URL of the target page. */
  url?: string;

  /**
   * Localized language name, in the request `uselang` language. Present when
   * the target title is valid (`action=parse` has no `llprop` parameter).
   */
  langname?: string;

  /**
   * Native language name. Present when the target title is valid
   * (`action=parse` has no `llprop` parameter).
   */
  autonym?: string;

  /** Target page title. */
  title: string;
}

/** An interwiki link (`prop=iwlinks`). */
export interface ApiParseIWLink {
  /** Interwiki prefix. */
  prefix: string;

  /** Full URL of the target page. */
  url?: string;

  /** Target page title. */
  title: string;
}

/** One redirect resolution (with `redirects=1`, when parsing `page=`/`pageid=`). */
export interface ApiParseRedirect {
  /** Redirect source title. */
  from?: string;

  /** Title the redirect points to. */
  to?: string;
}

/**
 * A table-of-contents entry (`prop=sections`) — the legacy projection of the
 * same outline `prop=tocdata` emits, with lowercase keys here (`fromtitle`,
 * `byteoffset`) against camelCase there (`fromTitle`, `codepointOffset`); see
 * {@link ApiParseTocSection}. `extensionData` appears only when non-empty.
 */
export interface ApiParseSection {
  /** Nesting level in the TOC. */
  toclevel: number;

  /** Heading level, as a string (`"1"` for `= … =`). */
  level: string;

  /** Heading text (HTML). */
  line: string;

  /** Section number in the outline, e.g. `1.1`. */
  number: string;

  /** `edit` parameter value for this section. */
  index: string;

  /**
   * Title the section came from; `false` when it has none — the legacy
   * serialization of a null title, where `prop=tocdata` omits the key instead.
   */
  fromtitle: string | false;

  /**
   * Offset of the heading in the source, in **code points** despite the legacy
   * name; `null` for a heading that is not a "preprocessor section" (e.g. one
   * written as a literal `<h_>` tag).
   */
  byteoffset: number | null;

  /** Anchor name for links. */
  anchor: string;

  /**
   * Anchor used by the section's own edit link.
   *
   * @since MediaWiki 1.40
   */
  linkAnchor?: string;

  /** Extension-supplied data for this section; only when non-empty. */
  extensionData?: Record<string, unknown> | unknown[];
}

/**
 * One `tocdata` section (`prop=tocdata`) — the same outline as
 * {@link ApiParseSection} but camelCased, with an HTML heading level instead of a
 * wikitext `level` and a code-point offset instead of a byte offset.
 */
export interface ApiParseTocSection {
  /** Nesting level in the TOC. */
  tocLevel?: number;

  /** HTML heading level, as a number (1 for `<h1>`, 2 for `<h2>`, …). */
  hLevel?: number;

  /** Heading text (HTML). */
  line?: string;

  /** Section number in the outline, e.g. `1.1`. */
  number?: string;

  /** `edit` parameter value for this section. */
  index?: string;

  /** Title the section came from. */
  fromTitle?: string;

  /** Offset of the heading in code points, not bytes. */
  codepointOffset?: number;

  /** Anchor name for links. */
  anchor?: string;

  /** Anchor used by the section's own edit link (leading `#` included). */
  linkAnchor?: string;

  /** Extension-supplied data for this section; `[]` when empty. */
  extensionData?: Record<string, unknown> | unknown[];
}

/** The `tocdata` object (`prop=tocdata`). */
export interface ApiParseTocData {
  /** The outline, in camelCase keys. */
  sections: ApiParseTocSection[];

  /** Extension-supplied TOC data, keyed by extension; `[]` when empty. */
  extensionData: Record<string, unknown> | unknown[];
}

/**
 * One row of `limitreportdata` (`prop=limitreportdata`). fv2 keeps the PHP
 * array's numeric keys, so the measurement(s) sit under `"0"`/`"1"`.
 */
export interface ApiParseLimitReportEntry {
  /** Report key, e.g. `limitreport-cputime` or `cachereport-ttl`. */
  name?: string;

  /**
   * `"0"` is the measured value; `"1"` is the configured limit for used/limit
   * pairs. Values are strings, numbers, or booleans depending on the row.
   */
  [value: string]: string | number | boolean | undefined;
}

/**
 * One raw `<head>` element (`prop=headitems`).
 *
 * @deprecated since MediaWiki 1.28; see {@link ApiParse.headitems}.
 */
export interface ApiParseHeadItem {
  /** Element name the item was collected under (often a numeric key). */
  tag: string;

  /** Markup of the head item. */
  content: string;
}

/**
 * The `parse` object of a successful `action=parse` response. `title` and
 * `pageid` are written before any `prop` value is considered; with `onlypst=1`
 * the module returns a different, metadata-free shape instead — see
 * {@link ApiParseOnlyPstResponse}.
 */
export interface ApiParse {
  /** Page title the content was parsed as. */
  title: string;

  /**
   * Page id of the context title — the parsed page, or the `title` parameter
   * (default `API`) when parsing text. `0` only when that title does not exist.
   */
  pageid: number;

  /** The revision's text was deleted. A {@link Flag}. */
  textdeleted?: Flag;

  /** The revision's text was suppressed. A {@link Flag}. */
  textsuppressed?: Flag;

  /**
   * Revision id the content was parsed from. Emitted whenever `oldid` was
   * given, or when parsing a page with `prop=revid`.
   */
  revid?: number;

  /** Redirect resolutions (with `redirects=1`). */
  redirects?: ApiParseRedirect[];

  /**
   * Rendered HTML output (`formatversion=2`: a plain string). `prop=text`.
   * With `onlypst=1`, the pre-save-transformed wikitext instead.
   */
  text?: string;

  /** Source wikitext. `prop=wikitext`. */
  wikitext?: string;

  /** Pre-save-transformed wikitext (`prop=wikitext` + `pst=1`). */
  psttext?: string;

  /** Parsed edit summary (`summary=` given, or `sectiontitle=` with `section=new`). */
  parsedsummary?: string;

  /** HTML for the display title. `prop=displaytitle`. */
  displaytitle?: string;

  /** Categories the page would be added to. `prop=categories`. */
  categories?: ApiParseCategory[];

  /** Pages linked from the content. `prop=links`. */
  links?: ApiParseLink[];

  /** Pages transcluded by the content. `prop=templates`. */
  templates?: ApiParseLink[];

  /** File names used by the content. `prop=images`. */
  images?: string[];

  /** External URLs linked by the content. `prop=externallinks`. */
  externallinks?: string[];

  /** Interlanguage links. `prop=langlinks`. */
  langlinks?: ApiParseLangLink[];

  /** Interwiki links. `prop=iwlinks`. */
  iwlinks?: ApiParseIWLink[];

  /** Section outline. `prop=sections`. */
  sections?: ApiParseSection[];

  /** HTML for the categories, keyed like {@link categories}. `prop=categorieshtml`. */
  categorieshtml?: string;

  /** Page subtitle. `prop=subtitle`. */
  subtitle?: string;

  /** HTML page-indicator hooks. `prop=indicators`. */
  indicators?: Record<string, string>;

  /** Parser warnings for the input. `prop=parsewarnings`. */
  parsewarnings?: string[];

  /**
   * Extension-registered display properties (values are numbers, strings, or
   * arrays). `prop=properties`; the set is open-ended.
   */
  properties?: Record<string, unknown>;

  /** ResourceLoader modules required by the output. `prop=modules` (also emits
   *  {@link modulescripts} and {@link modulestyles}); must be paired with
   *  `jsconfigvars`/`encodedjsconfigvars` or the API warns. */
  modules?: string[];

  /**
   * The script-bearing subset of {@link modules}.
   *
   * @deprecated since MediaWiki 1.32 — always empty; read {@link modules} instead.
   */
  modulescripts?: never[];

  /**
   * The style-bearing subset of {@link modules}. `prop=modules` — a plain
   * module-name list.
   */
  modulestyles?: string[];

  /**
   * `window.mw.config` values needed by {@link modules}, keyed by variable name.
   * `prop=jsconfigvars`.
   */
  jsconfigvars?: Record<string, unknown>;

  /**
   * {@link jsconfigvars} as a JSON string, ready to inline. `prop=encodedjsconfigvars`.
   */
  encodedjsconfigvars?: string;

  /**
   * Table of contents with camelCased entries. `prop=tocdata`.
   *
   * @since MediaWiki 1.43
   */
  tocdata?: ApiParseTocData;

  /** Whether the output should show a TOC. `prop=tocdata` or `prop=sections`; a real `boolean`. */
  showtoc?: boolean;

  /** HTML list of parser warnings. `prop=parsewarningshtml`. */
  parsewarningshtml?: string[];

  /**
   * Parser profiling rows. `prop=limitreportdata` — emitted regardless of
   * `disablelimitreport` (that only strips the table from the rendered text).
   */
  limitreportdata?: ApiParseLimitReportEntry[];

  /**
   * Parser profiling rendered as a preview HTML table. `prop=limitreporthtml`.
   * Its numbers change on every request.
   */
  limitreporthtml?: string;

  /**
   * Raw `<head>` elements, one `{tag, content}` entry each. `prop=headitems`.
   *
   * @deprecated since MediaWiki 1.28 — use {@link headhtml} to build a document, or
   * {@link modules} + `jsconfigvars` to update one client-side.
   */
  headitems?: ApiParseHeadItem[];

  /**
   * The preprocessor result as an XML tree. `prop=parsetree`; requires a wikitext
   * content model (otherwise the call fails with the `notwikitext` error code).
   * Not flagged deprecated by 1.43, unlike the `generatexml` parameter that also
   * produces it.
   */
  parsetree?: string;

  /** Full HTML document head. `prop=headhtml`. */
  headhtml?: string;
}

/** Response of `action=parse`. */
export interface ApiParseResponse extends ApiEnvelope {
  /** Result of `action=parse`. */
  parse: ApiParse;
}

/**
 * Response of `action=parse&onlypst=1`: the module builds the payload before it
 * resolves a title, so only the pre-save-transformed text comes back — no
 * `title`/`pageid` and none of the `prop` sub-objects of {@link ApiParse}.
 */
export interface ApiParseOnlyPstResponse extends ApiEnvelope {
  /** Result of `action=parse&onlypst=1`. */
  parse: {
    /** Pre-save-transformed wikitext. */
    text: string;

    /** Source wikitext (`prop=wikitext`). */
    wikitext?: string;

    /** Parsed edit summary (`summary=`, or `sectiontitle=` with `section=new`). */
    parsedsummary?: string;
  };
}
