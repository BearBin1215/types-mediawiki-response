/**
 * Opt-in extension pack: **Translate** (`meta=messagegroups`,
 * `meta=messagegroupstats`, `meta=languagestats`, `meta=messagetranslations`,
 * `list=messagecollection`, `action=translationstats`,
 * `action=translationaids`, `action=ttmserver`, `action=markfortranslation`,
 * `action=translationreview`, `action=groupreview`, `action=aggregategroups`,
 * `action=translationentitysearch`, `action=translatesandbox`,
 * `action=translationstash`, `action=messagegroupsubscription`,
 * `action=searchtranslations`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/translate';
 * ```
 *
 * fv2 notes: `messagegroupstats` / `languagestats` continue with an
 * `mgsoffset` / `lsoffset` cursor (a group/language id, not a number), and
 * `messagetranslations` / `messagecollection` paginate with a numeric `mtoffset`
 * / string `mcoffset`; all are covered by the core `ApiQueryContinue` index
 * signature. The `workflowstates` / `prioritylangs` payloads use `false` (not
 * `null`) as their "not configured" marker.
 * Out of scope here: `action=managemessagegroups` and
 * `action=managegroupsynchronizationcache`, whose success shapes only occur
 * within the group-synchronization (changeset) workflow of file-based groups.
 *
 * @see https://www.mediawiki.org/wiki/Extension:Translate
 */
import type { ApiEnvelope } from "../envelope";

/**
 * One `meta=messagegroups` entry. `mgprop` controls which fields appear. The
 * groups themselves are site-defined (wiki pages, YAML files, aggregate
 * definitions), so ids beyond the dynamic `!recent` / `!additions` ones are
 * open-ended.
 */ export interface ApiTranslateMessageGroup {
  /** Group id, e.g. `page-Example`, `!recent`. `mgprop=id`. */
  id?: string;

  /** Localized group label. `mgprop=label`. */
  label?: string;

  /** Localized group description. `mgprop=description`. */
  description?: string;

  /** PHP class backing the group, e.g. `WikiPageMessageGroup`. `mgprop=class`. */
  class?: string;

  /**
   * Namespace the group's messages live in, e.g. `1198` (the Translations
   * namespace) for page groups; `false` for groups without a namespace (the
   * dynamic `!recent` / `!additions` ones). `mgprop=namespace`.
   */
  namespace?: number | false;

  /** Whether the group currently exists (real `boolean`). `mgprop=exists`. */
  exists?: boolean;

  /**
   * Icon URLs keyed by size. `mgprop=icon`; absent for groups without an icon.
   */
  icon?: Record<string, unknown>;

  /**
   * Translation priority. Beyond the core `default`, values are site-defined
   * (set through the group's priority metadata).
   */
  priority?: "default" | (string & {});

  /**
   * Priority languages of the group, or `false` when unset.
   * `mgprop=prioritylangs`.
   */
  prioritylangs?: string[] | false;

  /**
   * Whether translation to non-priority languages is prevented.
   * `mgprop=priorityforce`.
   */
  priorityforce?: boolean;

  /**
   * Workflow states of the group keyed by state id, or `false` when the group
   * has none. `mgprop=workflowstates`.
   */
  workflowstates?: Record<string, ApiTranslateWorkflowState> | false;

  /** Source language of the group's messages. `mgprop=sourcelanguage`. */
  sourcelanguage?: string;

  /**
   * Whether the current user is subscribed to group updates. `mgprop=subscription`;
   * absent when group subscription is disabled or unavailable to the user.
   */
  subscription?: boolean;

  /**
   * Number of nested groups folded into this entry (`mgformat=tree` with
   * `mgdepth` reached).
   */
  groupcount?: number;

  /** Child groups (`mgformat=tree` above the depth cutoff). */
  groups?: ApiTranslateMessageGroup[];
}

/** One workflow state of a message group (`meta=messagegroups` + `mgprop=workflowstates`). */
export interface ApiTranslateWorkflowState {
  /** Localized state name. */
  name: string;

  /** The requesting user may set this state. */
  canchange?: 1;

  /** Site-defined state configuration, passed through. */
  [key: string]: unknown;
}

/**
 * The four completeness counters shared by `meta=languagestats` and
 * `meta=messagegroupstats` rows. A row appears only once its statistics are
 * available; while they are still being computed the result is a continue
 * instead.
 */
export interface ApiTranslateStatsRow {
  /** Total number of messages. */
  total: number;

  /** Number of translated (non-fuzzy) messages. */
  translated: number;

  /** Number of out-of-date (fuzzy) translations. */
  fuzzy: number;

  /** Number of proofread translations. */
  proofread: number;
}

/**
 * One `meta=languagestats` row: completeness of one message group in the
 * requested language.
 */
export interface ApiLanguageStatsRow extends ApiTranslateStatsRow {
  /** Message group id the row counts. */
  group: string;
}

/**
 * One `meta=messagegroupstats` row: completeness of one language in the
 * requested group.
 */
export interface ApiMessageGroupStatsRow extends ApiTranslateStatsRow {
  /**
   * Language code of the row. Kept for backwards compatibility; newer clients
   * should read {@link ApiMessageGroupStatsRow.language}.
   *
   * @deprecated Superseded by `language`.
   */
  code: string;

  /** Language code of the row. */
  language: string;
}

/**
 * One `meta=messagetranslations` row: one existing translation of a message
 * (the title named in `mttitle`).
 */
export interface ApiMessageTranslation {
  /** Title of the translation subpage, e.g. `Translations:Example/1/de`. */
  title: string;

  /** Language code of the translation. */
  language: string;

  /** Name of the last translator. */
  lasttranslator: string;

  /** The translation text (fuzzy marker stripped). */
  translation: string;

  /** The translation is marked out-of-date (fuzzy); a literal marker. */
  fuzzy?: "fuzzy";
}

/**
 * One `list=messagecollection` row: a message of the group named in `mcgroup`
 * for the language named in `mclanguage`. `mcprop` controls which fields
 * beyond the mandatory ones appear.
 */
export interface ApiMessageCollectionRow {
  /** Message key, e.g. `Example/1`. */
  key: string;

  /** Title of the translation subpage for this message and language. */
  title: string;

  /** Language the collection was requested for (`mclanguage`). */
  targetLanguage: string;

  /** Id of the group the message belongs to. */
  primaryGroup?: string;

  /** Source-language definition. `mcprop=definition`. */
  definition?: string;

  /**
   * Translation in the requested language; `null` when the message is
   * untranslated. `mcprop=translation`.
   */
  translation?: string | null;

  /** Change tags of the translation, `[]` when untagged. `mcprop=tags`. */
  tags?: string[];

  /**
   * Per-message metadata (e.g. `status`, `last-translator-text`,
   * `last-translator-id`, `revision`) keyed by property name; values may be
   * `null` for untranslated messages. `mcprop=properties`.
   */
  properties?: Record<string, string | null>;

  /** Revision of the translated unit. `mcprop=revision`.
   *
   * @deprecated Superseded by `properties.revision`; removed in MediaWiki 1.44.
   */
  revision?: number | string;
}

/**
 * The `query.metadata` block `list=messagecollection` writes alongside its
 * rows, describing the requested slice of the collection.
 */
export interface ApiMessageCollectionMetadata {
  /**
   * Review workflow state of the group for the requested language; `null` when
   * the group has no workflow states configured.
   */
  state: string | null;

  /** Number of messages matching the requested filters. */
  resultsize: number;

  /** Rows after this slice, i.e. `resultsize` minus the rows returned. */
  remaining: number;
}

/**
 * Payload of one translation aid of `action=translationaids`, keyed by aid
 * type (the registry is hook-extensible, so the set is open). An aid that
 * cannot run reports {@link ApiTranslationAid.error} instead of its data.
 */
export interface ApiTranslationAid {
  /** Language of {@link ApiTranslationAid.value}, when language-bound. */
  language?: string;

  /** The aid's payload, when it is a text value. */
  value?: string | null;

  /** Whether the translation is marked out-of-date (fuzzy). */
  fuzzy?: boolean;

  /** Rendered reason why this aid is unavailable. */
  error?: string;

  [key: string]: unknown;
}

/**
 * The `helpers` map of `action=translationaids`. Members are the aid types of
 * the {@link https://www.mediawiki.org/wiki/Manual:Hooks/TranslationAids |
 * TranslationAids registry} — the built-in ones are declared here for
 * autocomplete, the index signature keeps hook-registered aids usable.
 */
export interface ApiTranslationAidsPayload {
  /** Source-language definition of the message. */
  definition?: ApiTranslationAid;

  /** The current translation in the target language. */
  translation?: ApiTranslationAid;

  /** `{{Documentation}}` subpage content; `error` when docs are disabled. */
  documentation?: ApiTranslationAid;

  /** Existing translations in other languages; a list. */
  inotherlanguages?: unknown[];

  /** Diff of the definition since the translation was made. */
  definitiondiff?: ApiTranslationAid;

  /** Edit summaries of the definition page. */
  editsummaries?: ApiTranslationAid;

  /** Gettext metadata for gettext-defined messages. */
  gettext?: ApiTranslationAid;

  /** Insertable wikitext snippets (customizable via hooks). */
  insertables?: ApiTranslationAid;

  /** Machine-translation suggestions, when a service is configured. */
  mt?: ApiTranslationAid;

  /** Human translation support (e.g. TTMServer suggestions). */
  support?: ApiTranslationAid;

  [key: string]: ApiTranslationAid | unknown[] | undefined;
}

/** Response of `action=translationaids` (root-level `helpers` and `times`). */
export interface ApiTranslationAidsResponse extends ApiEnvelope {
  /** Requested aids keyed by aid type. */
  helpers?: ApiTranslationAidsPayload;

  /** Wall-clock seconds spent per aid (plus `query_aggregator`). */
  times?: Record<string, number>;
}

/** Response of `action=translationstats`: graph data for the requested series. */
export interface ApiTranslationStatsResponse extends ApiEnvelope {
  translationstats: {
    /** One label per series, e.g. `Example @ Deutsch (de)`. */
    labels: string[];

    /** Per-day (per scale unit) values, one entry per series. */
    data: Record<string, number[]>;
  };
}

/**
 * One suggestion of `action=ttmserver`: a translation-memory hit for the
 * requested text. The fields are supplied by the configured translation-memory
 * service; a unit from the local memory carries the fields below.
 */
export interface ApiTtmServerSuggestion {
  /** Source text of the stored translation unit. */
  source: string;

  /** Translation text of the stored unit. */
  target: string;

  /** Message key of the stored unit, e.g. `Translations:Example/1`. */
  context: string;

  /** Canonical URL of the translation page the unit came from. */
  location: string;

  /** Match quality as a ratio between 0 and 1 (1 is a perfect match). */
  quality: number;
}

/** Response of `action=ttmserver`. */
export interface ApiTtmServerResponse extends ApiEnvelope {
  /** Suggestions, best match first; `[]` when the memory has no hit. */
  ttmserver: ApiTtmServerSuggestion[];
}

/**
 * Result of `action=markfortranslation` (pagetranslation-token POST,
 * `pagetranslation` right): a wiki page was marked for translation, creating
 * its translation units and the `page-<title>` message group.
 */
export interface ApiMarkForTranslationResult {
  /** Fixed `Success` marker; failures are standard top-level errors. */
  result: "Success";

  /** Whether this was the first time the page was marked. */
  firstmark: boolean;

  /** Number of translation units created (including the page title). */
  unitcount: number;
}

/** Response of `action=markfortranslation`. */
export interface ApiMarkForTranslationResponse extends ApiEnvelope {
  /** Result of `action=markfortranslation`. */
  markfortranslation: ApiMarkForTranslationResult;
}

/**
 * Result of `action=translationreview` (CSRF-token POST,
 * `translate-messagereview` right): one translation revision was marked as
 * reviewed. Reviewing one's own translation, fuzzy translations and already
 * reviewed revisions are errors / warnings.
 */
export interface ApiTranslationReviewResponse extends ApiEnvelope {
  translationreview: {
    /** Result of `action=translationreview`. */
    review: {
      /** Title of the reviewed translation, e.g. `Translations:Page/1/de`. */
      title: string;

      /** Page id of the translation subpage. */
      pageid: number;

      /** Reviewed revision id. */
      revision: number;
    };
  };
}

/**
 * Response of `action=groupreview` (CSRF-token POST, `translate-groupreview`
 * right): the workflow state of one message group for one language was set.
 * Requires `$wgTranslateWorkflowStates` on the wiki; the state names are
 * site-configured.
 */
export interface ApiGroupReviewResponse extends ApiEnvelope {
  groupreview: {
    /** Result of `action=groupreview`. */
    review: {
      /** Message group id the state was set for. */
      group: string;

      /** Language code the state was set for. */
      language: string;

      /** The new workflow state, as configured on the wiki. */
      state: string;
    };
  };
}

/**
 * Result of `action=aggregategroups` (CSRF-token POST, `translate-manage`
 * right). The fields depend on the requested `do`: creating returns the new
 * group id and the aggregate-able groups, associating returns the target page
 * URL, dissociating and removing return only the marker.
 */
export interface ApiAggregateGroupsResult {
  /** Fixed `ok` marker; failures are standard top-level errors. */
  result: "ok";

  /**
   * Groups that can be added to the new aggregate group, keyed by group id
   * with their labels as values. Returned by `do=add`.
   */
  groups?: Record<string, string>;

  /** Id of the created aggregate group. Returned by `do=add`. */
  aggregategroupId?: string;

  /** Full URL of the associated group's translation page. `do=associate`. */
  groupUrl?: string;
}

/** Response of `action=aggregategroups`. */
export interface ApiAggregateGroupsResponse extends ApiEnvelope {
  /** Result of `action=aggregategroups`. */
  aggregategroups: ApiAggregateGroupsResult;
}

/**
 * Result of `action=translationentitysearch`: message group and message key
 * prefixes matching the query. Keys are absent when the entity type was not
 * requested or nothing matched.
 */
export interface ApiTranslationEntitySearchResult {
  /** Matching message groups, best match first. */
  groups?: ApiTranslationEntitySearchGroup[];

  /**
   * Matching message key prefixes; several messages under one prefix are
   * collapsed into a `*` wildcard pattern with a match count.
   */
  messages?: ApiTranslationEntitySearchMessage[];
}

/** One message group match of `action=translationentitysearch`. */
export interface ApiTranslationEntitySearchGroup {
  /** Localized group label. */
  label: string;

  /** Message group id. */
  group: string;
}

/** One message prefix match of `action=translationentitysearch`. */
export interface ApiTranslationEntitySearchMessage {
  /** Message key prefix; `*` marks a wildcard. */
  pattern: string;

  /** Number of messages matching the pattern. */
  count: number;
}

/** Response of `action=translationentitysearch`. */
export interface ApiTranslationEntitySearchResponse extends ApiEnvelope {
  /** Result of `action=translationentitysearch`. */
  translationentitysearch: ApiTranslationEntitySearchResult;
}

/**
 * Response of `action=translatesandbox` with `do=create` (registers a sandboxed
 * translator; requires `$wgTranslateUseSandbox`). The `delete` / `promote` /
 * `remind` variants return no payload — an empty {@link ApiEnvelope}.
 */
export interface ApiTranslateSandboxCreateResponse extends ApiEnvelope {
  translatesandbox: {
    /** The registered sandbox user. */
    user: {
      /** User name of the sandbox user. */
      name: string;

      /** User id of the sandbox user. */
      id: number;
    };
  };
}

/**
 * Response of `action=translatesandbox` with `do=delete` / `do=promote` /
 * `do=remind`: the users were processed, no payload keys are returned.
 */
export interface ApiTranslateSandboxActionResponse extends ApiEnvelope {}

/** One stashed translation of `action=translationstash` `subaction=query`. */
export interface ApiStashedTranslation {
  /** Title the stashed translation belongs to, e.g. `Translations:Page/2/nl`. */
  title: string;

  /** Source-language definition; `""` when the message handle is unknown. */
  definition: string;

  /** The stashed translation text. */
  translation: string;

  /** Current translation in the target language, `null` when untranslated. */
  comparison: string | null;

  /** Arbitrary metadata passed when stashing (an empty map decodes to `[]`). */
  metadata: unknown;
}

/**
 * Response of `action=translationstash` (CSRF-token POST): `subaction=add`
 * returns only the marker, `subaction=query` additionally lists the stashed
 * translations of the requesting (sandbox) user.
 */
export interface ApiTranslationStashResponse extends ApiEnvelope {
  translationstash: {
    /** Stashed translations, oldest first. Only with `subaction=query`. */
    translations?: ApiStashedTranslation[];

    /** Fixed `ok` marker; failures are standard top-level errors. */
    result: "ok";
  };
}

/**
 * Response of `action=messagegroupsubscription` (CSRF-token POST): the
 * requesting user's subscription to the group was changed. Requires
 * `$wgTranslateEnableMessageGroupSubscription`.
 */
export interface ApiMessageGroupSubscriptionResponse extends ApiEnvelope {
  messagegroupsubscription: {
    /** Fixed `1` success marker; failures are standard top-level errors. */
    success: 1;

    /** The group whose subscription changed. */
    group: {
      /** Message group id. */
      id: string;

      /** Localized group label. */
      label: string;
    };
  };
}

/**
 * One `action=searchtranslations` match: a document of the translation memory.
 * The fields are fixed by the search index; the result may replace `content`
 * with a highlighted snippet.
 */
export interface ApiSearchTranslationsDocument {
  /** Wiki id the indexed translation belongs to. */
  wiki: string;

  /** Canonical URL of the translation page. */
  uri: string;

  /** Base title of the translation unit, e.g. `Example`. */
  localid: string;

  /** Language code of the indexed translation. */
  language: string;

  /** Message group ids the unit belongs to. */
  group: string[];

  /** The indexed text (translation or definition), possibly highlighted. */
  content: string;
}

/**
 * Response of `action=searchtranslations`: full-text search over the
 * translation memories. Only wikis backed by a searchable translation-memory
 * service return hits; the response carries them with a metadata block under
 * the root `search` key.
 */
export interface ApiSearchTranslationsResponse extends ApiEnvelope {
  search: {
    /** Hit metadata. */
    metadata: {
      /** Total number of hits. */
      total: number;
    };

    /** Hits, best match first; `[]` when nothing matched. */
    translations: ApiSearchTranslationsDocument[];
  };
}

declare module "types-mediawiki-response" {
  interface ApiQueryResult {
    /** Message groups of this wiki (`meta=messagegroups`). */
    messagegroups?: ApiTranslateMessageGroup[];

    /** Per-language completeness of one group (`meta=messagegroupstats`). */
    messagegroupstats?: ApiMessageGroupStatsRow[];

    /** Per-group completeness of one language (`meta=languagestats`). */
    languagestats?: ApiLanguageStatsRow[];

    /** Existing translations of one message (`meta=messagetranslations`). */
    messagetranslations?: ApiMessageTranslation[];

    /**
     * Workflow/report metadata of the message collection slice
     * (`list=messagecollection`).
     */
    metadata?: ApiMessageCollectionMetadata;

    /** Messages of one group and language (`list=messagecollection`). */
    messagecollection?: ApiMessageCollectionRow[];
  }
}
