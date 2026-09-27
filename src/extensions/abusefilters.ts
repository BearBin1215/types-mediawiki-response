/**
 * Opt-in extension pack: **AbuseFilter** (`list=abusefilters`, `list=abuselog`,
 * `action=abusefilterchecksyntax`, `action=abusefilterevalexpression`,
 * `action=abusefiltercheckmatch`, `action=abusefilterunblockautopromote`,
 * `action=abuselogprivatedetails`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/abusefilters';
 * ```
 *
 * The `action=` responses are standalone — import them by name.
 *
 * fv2 notes: `hits` is withheld (surfaced as `hitsredacted: true` on newer
 * builds) for viewers without `abusefilter-log-detail`; `abfprop=flags` expands
 * the booleans. Continuation uses `abfstartid`/`aflstart` (covered by the core
 * `ApiQueryContinue` index signature). `abuselog` visibility is permission
 * sensitive: `filter_id`/`revid` come back as `""` rather than being omitted when
 * the viewer may not see the details, and `details`/`filter`/`wiki` appear only
 * with the matching `aflprop`.
 *
 * @see https://www.mediawiki.org/wiki/Extension:AbuseFilter/Raw_format_of_filters
 * @see https://www.mediawiki.org/wiki/Extension:AbuseFilter/API
 */
import type { Flag, NamespaceIndex, Timestamp } from "../common";
import type { ApiEnvelope } from "../envelope";

/** One abuse filter definition. */
export interface ApiAbuseFilter {
  /** Filter id. */
  id?: number;

  /** Human-readable filter description. `abfprop=description`. */
  description?: string;

  /** The filter's regex/rule string. `abfprop=pattern` (withheld for private/protected filters). */
  pattern?: string;

  /**
   * The actions the filter performs. `abfprop=actions`.
   * * Up to MediaWiki 1.46: the raw `af_actions` column, a comma-joined
   *   string such as `"disallow,tag"`.
   * * 1.47 onward: the same value split into a `string[]`.
   */
  actions?: string | string[];

  /** The filter's comments. `abfprop=comments` (withheld for private/protected filters). */
  comments?: string;

  /** Number of matches (only when the viewer may see it). `abfprop=hits`. */
  hits?: number;

  /**
   * `true` when `hits` was withheld from this viewer. A {@link Flag}. Before
   * 1.47, a withheld {@link hits} was simply omitted.
   *
   * @since MediaWiki 1.47
   */
  hitsredacted?: Flag;

  /**
   * `true` when `pattern` was withheld from this viewer. A {@link Flag}.
   * Before 1.47, a withheld {@link pattern} was simply omitted.
   *
   * @since MediaWiki 1.47
   */
  patternredacted?: Flag;

  /**
   * `true` when `comments` was withheld from this viewer. A {@link Flag}.
   * Before 1.47, a withheld {@link comments} was simply omitted.
   *
   * @since MediaWiki 1.47
   */
  commentsredacted?: Flag;

  /** Last editor of the filter. `abfprop=lasteditor`. */
  lasteditor?: string;

  /** Last edit timestamp. `abfprop=lastedittime`. */
  lastedittime?: Timestamp;

  /**
   * Whether the filter is enabled. `abfprop=status`.
   * * 1.43: present as an **empty string** when the flag applies, and absent otherwise.
   * * Newer builds (`abfprop=flags`): real booleans.
   */
  enabled?: "" | boolean;

  /** Whether the filter is soft-deleted. `abfprop=status`; same `""` (1.43) vs real boolean (newer `abfprop=flags`) behaviour as {@link enabled}. */
  deleted?: "" | boolean;

  /** Whether the filter is private (hidden from the viewer). `abfprop=private`; same `""` (1.43) vs real boolean (newer `abfprop=flags`) behaviour as {@link enabled}. */
  private?: "" | boolean;

  /**
   * Whether the filter's protected variables are hidden. Same `""` (1.43) vs
   * real boolean (newer `abfprop=flags`) behaviour as {@link enabled}.
   *
   * @since MediaWiki 1.43
   */
  protected?: "" | boolean;

  /**
   * Whether the filter is suppressed (oversight). A real `boolean` under
   * `abfprop=flags`; the per-flag `abfprop=suppressed` alias is itself
   * deprecated since 1.47.
   *
   * @since MediaWiki 1.47
   */
  suppressed?: boolean;
}

/** One abuse-log entry (`list=abuselog`). */
export interface ApiAbuseLogEntry {
  /** Log record id (`afl_id`). `aflprop=ids`. */
  id?: number;

  /**
   * Filter that matched: the filter id as a string, prefixed `global-` for
   * central filters (e.g. `global-42`). `aflprop=ids`; an **empty string**
   * when the viewer may not see the details.
   */
  filter_id?: string;

  /** Public description of the filter. `aflprop=filter`. */
  filter?: string;

  /** Actor name. `aflprop=user`. */
  user?: string;

  /** Namespace of the affected page. `aflprop=title`. */
  ns?: NamespaceIndex;

  /** Title of the affected page. `aflprop=title`. */
  title?: string;

  /** Action that was filtered, e.g. `edit`, `create`. `aflprop=action`. */
  action?: string;

  /**
   * Consequences applied, e.g. `disallow`. `aflprop=result`; a comma-joined
   * string on 1.43, as stored in `afl_actions`.
   */
  result?: string;

  /** Revision the log entry points at. `aflprop=revid`; `""` when withheld. */
  revid?: number | "";

  /** When the entry was recorded. `aflprop=timestamp`. */
  timestamp?: Timestamp;

  /** Whether the entry is revdel'd. `aflprop=hidden`; a real `boolean`. */
  hidden?: boolean;

  /**
   * Filter variables in effect. `aflprop=details`; a map keyed by variable name.
   * Values are strings, numbers or booleans, but may also be arrays or `null`;
   * withheld variables arrive as empty strings. An empty map arrives as `[]`.
   */
  details?: Record<string, unknown> | unknown[];

  /** Source wiki id. `aflprop=wiki`, and only on a central filter wiki. */
  wiki?: string;
}

/** Status of a syntax check (`action=abusefilterchecksyntax`). */
export type AbuseFilterSyntaxStatus = "ok" | "error" | (string & {});

/** Response of `action=abusefilterchecksyntax`. */
export interface ApiAbuseFilterCheckSyntaxResponse extends ApiEnvelope {
  /** Result of `action=abusefilterchecksyntax`. */
  abusefilterchecksyntax: {
    /** Check outcome; `ok` when the pattern parses. */
    status?: AbuseFilterSyntaxStatus;

    /** Localized message text describing the problem. */
    message?: string;

    /** Character offset of the problem within the pattern. */
    character?: number;

    /**
     * Parser warnings (e.g. an empty-match regex); present only when there is
     * at least one, each with its own message and character offset.
     */
    warnings?: {
      /** Rendered text of the warning. */
      message?: string;

      /** Offset in the filter the warning applies to. */
      character?: number;
    }[];
  };
}

/** Response of `action=abusefilterevalexpression`. */
export interface ApiAbuseFilterEvalExpressionResponse extends ApiEnvelope {
  /** Result of `action=abusefilterevalexpression`. */
  abusefilterevalexpression: {
    /**
     * Evaluated value. A boolean, number, string or (with `prettyprint`) a
     * formatted representation, and a structured value for some expressions.
     */
    result?: unknown;
  };
}

/** Response of `action=abusefiltercheckmatch`. */
export interface ApiAbuseFilterCheckMatchResponse extends ApiEnvelope {
  /** Result of `action=abusefiltercheckmatch`. */
  abusefiltercheckmatch: {
    /** Whether the pattern matches the supplied variables. A real `boolean`. */
    result?: boolean;
  };
}

/** Response of `action=abusefilterunblockautopromote`. */
export interface ApiAbuseFilterUnblockAutopromoteResponse extends ApiEnvelope {
  /** Result of `action=abusefilterunblockautopromote`. */
  abusefilterunblockautopromote: {
    /** Canonical name of the user whose autopromote block was lifted. */
    user?: string;
  };
}

/** Response of `action=abuselogprivatedetails` (needs `abusefilter-privatedetails`). */
export interface ApiAbuseLogPrivateDetailsResponse extends ApiEnvelope {
  /** Result of `action=abuselogprivatedetails`. */
  abuselogprivatedetails: {
    /** Log record the details belong to. */
    "log-id"?: number;

    /** Actor of that log entry. */
    user?: string;

    /** Filter that matched. */
    "filter-id"?: number;

    /** Public filter description. */
    "filter-description"?: string;

    /** Real IP behind the entry; `null` when the log stored none. */
    "ip-address"?: string | null;
  };
}

declare module "types-mediawiki-response" {
  interface ApiQueryResult {
    /** Filters defined on the wiki (`list=abusefilters`). */
    abusefilters?: ApiAbuseFilter[];

    /** Events caught by one of the abuse filters (`list=abuselog`). */
    abuselog?: ApiAbuseLogEntry[];
  }
}
