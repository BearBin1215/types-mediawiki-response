/**
 * `action=expandtemplates` response — expands wikitext (resolving templates and
 * variables) without a full page parse, returned under a top-level
 * `expandtemplates` object. Useful to preview template output or collect the
 * page properties a snippet would set.
 *
 * Under `formatversion=2` `volatile` is a real boolean. `properties` carries
 * settings parsed from magic words (e.g. `defaultsort` from `{{DEFAULTSORT}}`).
 *
 * @see https://www.mediawiki.org/wiki/API:Parsing_wikitext#expandtemplates
 */
import type { ApiEnvelope } from "../envelope";

/** Page settings surfaced by `prop=properties`. Open key set. */
export interface ApiExpandTemplatesProperties {
  /** Sort key set by `{{DEFAULTSORT}}`. */
  defaultsort?: string;

  /** Display title set by `{{DISPLAYTITLE}}`. */
  displaytitle?: string;

  /** Other page properties set by parser functions or hooks. */
  [key: string]: unknown;
}

/** One category the output would add. */
export interface ApiExpandTemplatesCategory {
  /** Category name. */
  category: string;

  /** Sort key; empty string when the default sort key applies. */
  sortkey: string;
}

/** The `expandtemplates` object of a successful response. */
export interface ApiExpandTemplatesResult {
  /** The expanded wikitext. `prop=wikitext`. */
  wikitext?: string;

  /** XML parse tree of the input wikitext. `prop=parsetree`. */
  parsetree?: string;

  /** Whether the result varies per-user / request. `prop=volatile`; a real `boolean`. */
  volatile?: boolean;

  /** Cache TTL in seconds; `prop=ttl`, present only when the frame carries one. */
  ttl?: number;

  /** Page settings parsed from the output. `prop=properties`. */
  properties?: ApiExpandTemplatesProperties;

  /** Categories the output would add. `prop=categories`; absent when the output adds none. */
  categories?: ApiExpandTemplatesCategory[];

  /** ResourceLoader modules the output depends on. `prop=modules`. */
  modules?: string[];

  /** Always empty; deprecated. Emitted with `prop=modules`. */
  modulescripts?: never[];

  /** ResourceLoader module styles the output depends on. `prop=modules`. */
  modulestyles?: string[];

  /** Parser-magic JS config variables. `prop=jsconfigvars`. */
  jsconfigvars?: unknown;

  /** The JS config variables serialized as a JSON string. `prop=encodedjsconfigvars`. */
  encodedjsconfigvars?: string;
}

/** Response of `action=expandtemplates`. */
export interface ApiExpandTemplatesResponse extends ApiEnvelope {
  /** Result of `action=expandtemplates`. */
  expandtemplates: ApiExpandTemplatesResult;

  /**
   * XML parse tree of the input wikitext, emitted at the root level (outside
   * {@link expandtemplates}) by the legacy `generatexml` parameter; with
   * `prop=parsetree` the same tree is reported inside
   * {@link ApiExpandTemplatesResult.parsetree} instead.
   *
   * @deprecated since MediaWiki 1.25 (`generatexml`); use `prop=parsetree`.
   */
  parsetree?: string;
}
