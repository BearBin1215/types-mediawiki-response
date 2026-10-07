/**
 * Type-level assertions for the Translate ext pack (read side), checked
 * against real 1.43 responses captured on a seeded page-translation group.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiLanguageStatsRow,
  ApiMarkForTranslationResponse,
  ApiMessageCollectionMetadata,
  ApiMessageCollectionRow,
  ApiMessageGroupStatsRow,
  ApiMessageTranslation,
  ApiTranslationAid,
  ApiTranslationAidsResponse,
  ApiTranslationStatsResponse,
  ApiTranslateMessageGroup,
  ApiTtmServerResponse,
} from "../../src/extensions/translate";
import type { ExtraKeys } from "../typeutil";
import languagestats from "../fixtures/extensions/languagestats.json";
import markfortranslation from "../fixtures/extensions/markfortranslation.json";
import messagecollection from "../fixtures/extensions/messagecollection.json";
import messagegroupstats from "../fixtures/extensions/messagegroupstats.json";
import messagegroups from "../fixtures/extensions/messagegroups.json";
import messagetranslations from "../fixtures/extensions/messagetranslations.json";
import ttmserver from "../fixtures/extensions/ttmserver.json";
import translationaids from "../fixtures/extensions/translationaids.json";
import translationstats from "../fixtures/extensions/translationstats.json";

// --- meta=messagegroups ------------------------------------------------------

export const messageGroupSample = {
  id: "page-Fixture translatable page",
  label: "Fixture translatable page",
  description:
    "Translation of the wiki page [[:Fixture translatable page|Fixture translatable page]] from English (en).",
  class: "WikiPageMessageGroup",
  namespace: 1198,
  exists: true,
  priority: "default",
  prioritylangs: false,
  priorityforce: false,
  workflowstates: false,
  sourcelanguage: "en",
} satisfies ApiTranslateMessageGroup;

expectTypeOf<ApiTranslateMessageGroup>().toHaveProperty("priority").toExtend<string | undefined>();
expectTypeOf<ApiTranslateMessageGroup>()
  .toHaveProperty("prioritylangs")
  .toEqualTypeOf<string[] | false | undefined>();
expectTypeOf<ApiTranslateMessageGroup>()
  .toHaveProperty("workflowstates")
  .toExtend<Record<string, { name: string } & Record<string, unknown>> | false | undefined>();

expectTypeOf<
  ExtraKeys<(typeof messagegroups.query.messagegroups)[number], keyof ApiTranslateMessageGroup>
>().toEqualTypeOf<never>();

// --- stats rows (meta=languagestats / meta=messagegroupstats) -----------------

export const languageStatsSample = {
  total: 3,
  translated: 2,
  fuzzy: 0,
  proofread: 0,
  group: "page-Fixture translatable page",
} satisfies ApiLanguageStatsRow;

export const messageGroupStatsSample = {
  total: 3,
  translated: 0,
  fuzzy: 0,
  proofread: 0,
  code: "aa",
  language: "aa",
} satisfies ApiMessageGroupStatsRow;

expectTypeOf<ApiLanguageStatsRow>().toHaveProperty("group").toEqualTypeOf<string>();
expectTypeOf<ApiMessageGroupStatsRow>().toHaveProperty("code").toEqualTypeOf<string>();
expectTypeOf<ApiLanguageStatsRow["total"]>().toEqualTypeOf<number>();

expectTypeOf<
  ExtraKeys<(typeof languagestats.query.languagestats)[number], keyof ApiLanguageStatsRow>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof messagegroupstats.query.messagegroupstats)[number],
    keyof ApiMessageGroupStatsRow
  >
>().toEqualTypeOf<never>();

// --- meta=messagetranslations -------------------------------------------------

export const translationSample = {
  title: "Translations:Fixture translatable page/1/de",
  language: "de",
  lasttranslator: "Capadmin",
  translation: "Willkommen auf der Fixture-Seite.",
} satisfies ApiMessageTranslation;

export const fuzzyTranslationSample = {
  title: "Translations:Fixture translatable page/1/es",
  language: "es",
  lasttranslator: "Capadmin",
  fuzzy: "fuzzy",
  translation: "Bienvenido a la página fixture.",
} satisfies ApiMessageTranslation;

expectTypeOf<ApiMessageTranslation>().toHaveProperty("fuzzy").toEqualTypeOf<"fuzzy" | undefined>();
expectTypeOf<
  ExtraKeys<
    (typeof messagetranslations.query.messagetranslations)[number],
    keyof ApiMessageTranslation
  >
>().toEqualTypeOf<never>();

// --- list=messagecollection ---------------------------------------------------

// A translated row: `properties` values are strings.
export const collectionTranslatedSample = {
  key: "Fixture_translatable_page/1",
  definition: "Welcome to the fixture page.",
  translation: "Willkommen auf der Fixture-Seite.",
  tags: [],
  properties: {
    revision: "949",
    status: "translated",
    "last-translator-text": "Capadmin",
    "last-translator-id": "3",
  },
  title: "Translations:Fixture translatable page/1/de",
  targetLanguage: "de",
  primaryGroup: "page-Fixture translatable page",
} satisfies ApiMessageCollectionRow;

// An untranslated row: `translation` and `properties` members are `null`.
export const collectionUntranslatedSample = {
  key: "Fixture_translatable_page/Page_display_title",
  definition: "Fixture translatable page",
  translation: null,
  tags: [],
  properties: { status: "untranslated", "last-translator-text": null, "last-translator-id": null },
  title: "Translations:Fixture translatable page/Page display title/de",
  targetLanguage: "de",
  primaryGroup: "page-Fixture translatable page",
} satisfies ApiMessageCollectionRow;

expectTypeOf<ApiMessageCollectionRow>()
  .toHaveProperty("translation")
  .toEqualTypeOf<string | null | undefined>();
expectTypeOf<ApiMessageCollectionRow>()
  .toHaveProperty("properties")
  .toEqualTypeOf<Record<string, string | null> | undefined>();

// The metadata block is written unconditionally; `state` is an explicit `null`
// for groups without workflow states.
expectTypeOf<ApiMessageCollectionMetadata>().toHaveProperty("state").toEqualTypeOf<string | null>();
expectTypeOf<ApiMessageCollectionMetadata>().toHaveProperty("resultsize").toEqualTypeOf<number>();
expectTypeOf<ApiMessageCollectionMetadata>().toHaveProperty("remaining").toEqualTypeOf<number>();

expectTypeOf<
  ExtraKeys<
    (typeof messagecollection.query.messagecollection)[number],
    keyof ApiMessageCollectionRow
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    NonNullable<typeof messagecollection.query.metadata>,
    keyof ApiMessageCollectionMetadata
  >
>().toEqualTypeOf<never>();

// --- actions ------------------------------------------------------------------

export const translationStatsSample = {
  translationstats: {
    labels: ["Fixture translatable page @ Deutsch (de)"],
    data: { "2026-09-07": [0] },
  },
} satisfies ApiTranslationStatsResponse;

export const translationAidsSample = {
  helpers: {
    definition: { value: "Welcome to the fixture page.", language: "en" },
    translation: { language: "de", fuzzy: false, value: "Willkommen auf der Fixture-Seite." },
    documentation: { error: "Message documentation is disabled" },
    inotherlanguages: [],
  },
  times: { query_aggregator: 0.003, definition: 0 },
} satisfies ApiTranslationAidsResponse;

export const ttmServerSample = {
  ttmserver: [
    {
      source: "Welcome to the fixture page.",
      target: "Willkommen auf der Fixture-Seite.",
      context: "Translations:Fixture translatable page/1",
      location: "http://index.php/Translations:Fixture_translatable_page/1/de",
      quality: 0.9666666666666667,
    },
  ],
} satisfies ApiTtmServerResponse;

export const markForTranslationSample = {
  markfortranslation: { result: "Success", firstmark: true, unitcount: 3 },
} satisfies ApiMarkForTranslationResponse;

expectTypeOf<
  ApiMarkForTranslationResponse["markfortranslation"]["result"]
>().toEqualTypeOf<"Success">();
expectTypeOf<(typeof translationstats)["translationstats"]["labels"]>().toExtend<string[]>();
expectTypeOf<(typeof ttmserver)["ttmserver"][number]["quality"]>().toEqualTypeOf<number>();
expectTypeOf<
  (typeof markfortranslation)["markfortranslation"]["unitcount"]
>().toEqualTypeOf<number>();

expectTypeOf<
  ExtraKeys<NonNullable<(typeof translationaids)["helpers"]>["definition"], keyof ApiTranslationAid>
>().toEqualTypeOf<never>();

// --- write actions & searchtranslations ---------------------------------------

import type {
  ApiAggregateGroupsResponse,
  ApiGroupReviewResponse,
  ApiMessageGroupSubscriptionResponse,
  ApiSearchTranslationsDocument,
  ApiSearchTranslationsResponse,
  ApiStashedTranslation,
  ApiTranslateSandboxActionResponse,
  ApiTranslateSandboxCreateResponse,
  ApiTranslationEntitySearchResponse,
  ApiTranslationReviewResponse,
  ApiTranslationStashResponse,
} from "../../src/extensions/translate";
import aggregategroupsAdd from "../fixtures/extensions/aggregategroups-add.json";
import aggregategroupsAssociate from "../fixtures/extensions/aggregategroups-associate.json";
import groupreviewFixture from "../fixtures/extensions/groupreview.json";
import messagegroupsubscription from "../fixtures/extensions/messagegroupsubscription-subscribe.json";
import searchtranslationsFixture from "../fixtures/extensions/searchtranslations.json";
import translatesandboxCreate from "../fixtures/extensions/translatesandbox-create.json";
import translatesandboxPromote from "../fixtures/extensions/translatesandbox-promote.json";
import translationentitysearch from "../fixtures/extensions/translationentitysearch.json";
import translationreviewFixture from "../fixtures/extensions/translationreview.json";
import translationstashAdd from "../fixtures/extensions/translationstash-add.json";
import translationstashQuery from "../fixtures/extensions/translationstash-query.json";

export const translationReviewSample = {
  translationreview: {
    review: {
      title: "Translations:Fixture translatable page/2/fr",
      pageid: 616,
      revision: 960,
    },
  },
} satisfies ApiTranslationReviewResponse;

export const groupReviewSample = {
  groupreview: {
    review: {
      group: "page-Fixture translatable page",
      language: "de",
      state: "ready",
    },
  },
} satisfies ApiGroupReviewResponse;

// `do=add` returns the created group id plus the aggregate-able groups (a map
// of id → label); `do=associate` adds `groupUrl`; `do=remove` only the marker.
export const aggregateGroupsAddSample = {
  aggregategroups: {
    groups: { "page-Fixture translatable page": "Fixture translatable page" },
    aggregategroupId: "agg-Fixture_aggregate_group",
    result: "ok",
  },
} satisfies ApiAggregateGroupsResponse;

export const aggregateGroupsAssociateSample = {
  aggregategroups: {
    groupUrl: "http://localhost:8080/index.php/Fixture_translatable_page",
    result: "ok",
  },
} satisfies ApiAggregateGroupsResponse;

export const aggregateGroupsRemoveSample = {
  aggregategroups: { result: "ok" },
} satisfies ApiAggregateGroupsResponse;

export const entitySearchSample = {
  translationentitysearch: {
    groups: [{ label: "Fixture translatable page", group: "page-Fixture translatable page" }],
    messages: [{ pattern: "Translations:Fixture*", count: 3 }],
  },
} satisfies ApiTranslationEntitySearchResponse;

export const sandboxCreateSample = {
  translatesandbox: { user: { name: "Sbx1791392210340", id: 28 } },
} satisfies ApiTranslateSandboxCreateResponse;

// `do=promote` / `do=delete` / `do=remind` return no payload.
export const sandboxPromoteSample = {} satisfies ApiTranslateSandboxActionResponse;

export const stashAddSample = {
  translationstash: { result: "ok" },
} satisfies ApiTranslationStashResponse;

export const stashQuerySample = {
  translationstash: {
    translations: [
      {
        title: "Translations:Fixture translatable page/2/nl",
        definition: "This is the second unit.",
        translation: "Dit is de tweede eenheid.",
        comparison: null,
        metadata: [],
      },
    ],
    result: "ok",
  },
} satisfies ApiTranslationStashResponse;

export const subscriptionSample = {
  messagegroupsubscription: {
    success: 1,
    group: { id: "page-Fixture translatable page", label: "Fixture translatable page" },
  },
} satisfies ApiMessageGroupSubscriptionResponse;

export const searchTranslationsSample = {
  search: {
    metadata: { total: 1 },
    translations: [
      {
        wiki: "mwfixture",
        uri: "http://localhost:8080/index.php/Translations:Fixture_translatable_page/1/de",
        localid: "Fixture translatable page",
        language: "de",
        group: ["page-Fixture translatable page"],
        content: "Willkommen auf der Fixture-Seite.",
      },
    ],
  },
} satisfies ApiSearchTranslationsResponse;

expectTypeOf<ApiAggregateGroupsResponse["aggregategroups"]["result"]>().toEqualTypeOf<"ok">();
expectTypeOf<ApiSearchTranslationsDocument>().toHaveProperty("group").toEqualTypeOf<string[]>();
expectTypeOf<ApiStashedTranslation>().toHaveProperty("comparison").toEqualTypeOf<string | null>();
expectTypeOf<
  ApiMessageGroupSubscriptionResponse["messagegroupsubscription"]["success"]
>().toEqualTypeOf<1>();

expectTypeOf<(typeof aggregategroupsAssociate)["aggregategroups"]["groupUrl"]>().toExtend<string>();
expectTypeOf<
  ExtraKeys<
    (typeof aggregategroupsAdd)["aggregategroups"],
    keyof ApiAggregateGroupsResponse["aggregategroups"]
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof translationentitysearch)["translationentitysearch"],
    keyof ApiTranslationEntitySearchResponse["translationentitysearch"]
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof translationstashQuery)["translationstash"]["translations"][number],
    keyof ApiStashedTranslation
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof searchtranslationsFixture)["search"],
    keyof ApiSearchTranslationsResponse["search"]
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof searchtranslationsFixture)["search"]["translations"][number],
    keyof ApiSearchTranslationsDocument
  >
>().toEqualTypeOf<never>();
expectTypeOf<(typeof translationstashAdd)["translationstash"]["result"]>().toEqualTypeOf<string>();
expectTypeOf<(typeof groupreviewFixture)["groupreview"]["review"]["state"]>().toExtend<string>();
expectTypeOf<
  (typeof translationreviewFixture)["translationreview"]["review"]["pageid"]
>().toEqualTypeOf<number>();
expectTypeOf<
  (typeof messagegroupsubscription)["messagegroupsubscription"]["group"]["id"]
>().toEqualTypeOf<string>();
expectTypeOf<
  ExtraKeys<
    (typeof translatesandboxCreate)["translatesandbox"]["user"],
    keyof ApiTranslateSandboxCreateResponse["translatesandbox"]["user"]
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  typeof translatesandboxPromote extends ApiTranslateSandboxActionResponse ? true : false
>().toEqualTypeOf<true>();
