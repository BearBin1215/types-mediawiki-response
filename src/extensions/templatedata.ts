/**
 * Opt-in extension pack: **TemplateData** (`action=templatedata`).
 *
 * Not in the default export. Standalone action response — import it directly:
 *
 * ```ts
 * import type { ApiTemplateDataResponse } from 'types-mediawiki-response/ext/templatedata';
 * ```
 *
 * `pages` is a **map keyed by page id** (a negative id for each missing title),
 * not an array. Only pages carrying the `templatedata` page prop are listed;
 * `includeMissingTitles=1` additionally returns titles that do not exist
 * (`missing: true`) and existing pages without a `<templatedata>` block
 * (`notemplatedata: true`), whose `params` hold just the parameter names
 * extracted from the raw wikitext. `maps` is a PHP map, so an empty one arrives
 * as `[]` under `formatversion=2`.
 *
 * The InterfaceText fields (`label`, `description`, `default`, `example`, set
 * labels) arrive as objects keyed by language code; passing `lang` resolves
 * each one to a single string (requested language, then its fallbacks, then
 * the site content language). `inherits` links between parameters are
 * resolved when the blob is saved and never appear in a response. A corrupted
 * block surfaces as the `templatedata-corrupt` error rather than as a page
 * entry.
 *
 * @see https://www.mediawiki.org/wiki/Extension:TemplateData
 */
import type { ApiQueryNormalized } from "../core/query";
import type { ApiRedirect } from "../core/query/redirects";
import type { ApiEnvelope } from "../envelope";

/**
 * Parameter type a template expects, as accepted by the validator (`content`,
 * `line`, `number`, `boolean`, `string`, `date`, `unbalanced-wikitext`,
 * `unknown`, `url`, `wiki-page-name`, `wiki-user-name`, `wiki-file-name`,
 * `wiki-template-name`). Hook handlers may register additional names, so
 * consumers must tolerate values outside this list.
 */
export type TemplateDataType =
  | "boolean"
  | "content"
  | "date"
  | "line"
  | "number"
  | "string"
  | "unbalanced-wikitext"
  | "unknown"
  | "url"
  | "wiki-file-name"
  | "wiki-page-name"
  | "wiki-template-name"
  | "wiki-user-name"
  | (string & {});

/**
 * InterfaceText as served: a map keyed by language code (`{"en": "Nowrap?"}`).
 * A plain string only when the request passes `lang`, which resolves each text
 * to a single language (requested language, then its fallbacks, then the site
 * content language).
 */
export type ApiTemplateDataText = string | Record<string, string>;

/** One parameter description (`params.<name>`). */
export interface ApiTemplateDataParam {
  /** Display label. */
  label?: ApiTemplateDataText | null;

  /** Longer explanation shown to editors. */
  description?: ApiTemplateDataText | null;

  /** The template does not work without it. Defaults to `false`. */
  required?: boolean;

  /** Worth filling in but not mandatory. Defaults to `false`. */
  suggested?: boolean;

  /**
   * Discouraged. Either a boolean or, better, the text explaining what to use
   * instead.
   */
  deprecated?: boolean | string;

  /** Other names this parameter answers to. */
  aliases?: string[];

  /** Expected kind of the value. */
  type?: TemplateDataType;

  /** Value auto-inserted when the parameter is used, e.g. `{{subst:CURRENTYEAR}}`. */
  autovalue?: string | null;

  /** Assumed value when the parameter is absent from a transclusion. */
  default?: ApiTemplateDataText | null;

  /** Commonly used values offered as completion; free text stays allowed. */
  suggestedvalues?: string[];

  /** Example value shown to help editors. */
  example?: ApiTemplateDataText | null;
}

/** A group of parameters presented together (`sets[]`). */
export interface ApiTemplateDataSet {
  /** Set label. Required by the validator. */
  label: ApiTemplateDataText;

  /** Names of the parameters this set groups. Required and non-empty. */
  params: string[];
}

/**
 * A consumer-specific mapping (`maps.<consumer>`). Keys are consumer-defined
 * and not validated; each value references parameters of the template — a
 * parameter name, a list of names, or a list of lists of names.
 */
export type ApiTemplateDataMap = Record<string, string | string[] | string[][]>;

/** The stored TemplateData block of one template. */
export interface ApiTemplateDataRoot {
  /** One-line description of the template. */
  description?: ApiTemplateDataText | null;

  /**
   * Parameter descriptions, keyed by parameter name. Full objects for pages
   * with TemplateData; for `notemplatedata` pages only the names extracted
   * from raw wikitext, each mapping to an empty entry.
   */
  params?: Record<string, ApiTemplateDataParam | unknown[]> | unknown[];

  /**
   * Parameter order for display — a complete permutation of the keys of
   * `params`; the validator rejects a partial or duplicated list.
   */
  paramOrder?: string[];

  /**
   * Parameter groups. An **array** of {@link ApiTemplateDataSet} (the stored
   * shape; a map there is rejected with `templatedata-invalid-type`).
   */
  sets?: ApiTemplateDataSet[];

  /** Consumer-specific maps, keyed by consumer identifier. */
  maps?: Record<string, ApiTemplateDataMap> | unknown[];

  /** Preferred transclusion layout, or a FormatString. */
  format?: "inline" | "block" | (string & {}) | null;
}

/** One entry of `pages`, keyed by page id. */
export interface ApiTemplateDataPage extends ApiTemplateDataRoot {
  /** Page title. */
  title?: string;

  /** `true` for a requested title that does not exist. */
  missing?: true;

  /** `true` when the page exists but carries no `<templatedata>` block. */
  notemplatedata?: true;
}

/**
 * Response of `action=templatedata`, which returns no continuation cursors:
 * every requested page arrives in a single reply.
 */
export interface ApiTemplateDataResponse extends ApiEnvelope {
  /** Title normalizations applied to the request. */
  normalized?: ApiQueryNormalized[];

  /** Redirects followed to reach the requested titles. */
  redirects?: ApiRedirect[];

  /** Entries keyed by page id (negative for missing titles). */
  pages: Record<string, ApiTemplateDataPage>;
}
