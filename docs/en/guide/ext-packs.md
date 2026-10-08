---
description: "Add extension response types per wiki with opt-in packs — one type-only import activates a pack; extension actions are imported by name."
---

# Opt-in extension packs

Core [`ApiPage`](/api/core/ApiPage) / [`ApiQueryResult`](/api/core/ApiQueryResult) cover MediaWiki core fields only; the field types extensions introduce are split into opt-in packs by extension (subpath `types-mediawiki-response/ext/<name>`). Activate the packs matching your wiki's installed extensions.

There are two consumption scenarios, and they work differently:

- **Fields of an installed extension's query modules**: a `list=` / `prop=` / `meta=` key showing up in a response. Activated once per project with a type-only import; afterwards the fields simply appear on `ApiPage` / `ApiQueryResult` everywhere.
- **Extension actions** (`action=shortenurl`, `action=thank`, …): a standalone response type imported by name where you need it, like any core action response.

## Scenario 1: fields from installed extensions

Each pack ships its own `declare module` augmentation — the keys and landing spots live in the package, so your project never freezes a snippet that drifts when the pack gains fields. Activating a pack is a single type-only import of anything from it:

```ts
// mw-response.d.ts — declared once per repository, in any file covered by your tsconfig
import type {} from "types-mediawiki-response/ext/flaggedrevs";
import type {} from "types-mediawiki-response/ext/globalusage";
// ApiPage.flagged / ApiPage.globalusage now exist in EVERY file of the project
```

A dedicated type file (e.g. `mw-response.d.ts`, kept inside your tsconfig `include`) is the recommended home: list every extension your wiki actually runs there. The augmentation applies to the whole project the tsconfig covers, so business code never repeats a declaration and can use `page.flagged` / `query.notifications` directly. Alternatively, simply importing the field-group type you need (e.g. [`ApiPageFlagged`](/api/extensions/flaggedrevs/ApiPageFlagged)) anywhere also activates the pack.

## Scenario 2: calling an extension action

Extension actions export a standalone response type named after the action — nothing merges into `ApiPage` / `ApiQueryResult`. Import it by name from the pack and use it like a core action response:

```ts
import type { ApiThankResponse } from "types-mediawiki-response/ext/thanks";

const res: ApiThankResponse = await api.post({
  action: "thank",
  rev: 12345,
});
res.result?.recipient;
```

Two things come with that one import:

- The pack's query fields (if the extension also has query modules — e.g. `discussiontools` contributes both `action=discussiontools…` responses and `prop=threaditemshtml`) are activated at the same time.
- You do not need the pack in `mw-response.d.ts` just to call its action; add it there only if you also consume its query fields.

## Packs that augment query types

Activate these (scenario 1) if your wiki has the extension; the listed modules' fields appear on `ApiPage` / `ApiQueryResult`:

| Subpath             | Extension                                                                       | Query modules                                                                   |
| ------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `abusefilters`      | [AbuseFilter](https://www.mediawiki.org/wiki/Extension:AbuseFilter)             | `list=abusefilters`, `list=abuselog`                                            |
| `babel`             | [Babel](https://www.mediawiki.org/wiki/Extension:Babel)                         | `meta=babel`                                                                    |
| `betafeatures`      | [BetaFeatures](https://www.mediawiki.org/wiki/Extension:BetaFeatures)           | `list=betafeatures`                                                             |
| `centralauth`       | [CentralAuth](https://www.mediawiki.org/wiki/Extension:CentralAuth)             | `list=globalallusers`, `list=globalgroups`, `list=globalusers`, `list=wikisets` |
| `checkuser`         | [CheckUser](https://www.mediawiki.org/wiki/Extension:CheckUser)                 | `list=checkuser`, `list=checkuserlog`, `meta=checkuserformattedblockinfo`       |
| `description`       | [Wikibase Client](https://www.mediawiki.org/wiki/Extension:Wikibase_Client)     | `prop=description`                                                              |
| `echo`              | [Echo](https://www.mediawiki.org/wiki/Extension:Echo)                           | `meta=notifications`, …                                                         |
| `extracts`          | [TextExtracts](https://www.mediawiki.org/wiki/Extension:TextExtracts)           | `prop=extracts`                                                                 |
| `flaggedrevs`       | [FlaggedRevs](https://www.mediawiki.org/wiki/Extension:FlaggedRevs)             | `prop=flagged`, `list=unreviewedpages`, …                                       |
| `gadgets`           | [Gadgets](https://www.mediawiki.org/wiki/Extension:Gadgets)                     | `list=gadgets`                                                                  |
| `globalblocks`      | [GlobalBlocking](https://www.mediawiki.org/wiki/Extension:GlobalBlocking)       | `list=globalblocks`                                                             |
| `globalpreferences` | [GlobalPreferences](https://www.mediawiki.org/wiki/Extension:GlobalPreferences) | `meta=globalpreferences`                                                        |
| `globalusage`       | [GlobalUsage](https://www.mediawiki.org/wiki/Extension:GlobalUsage)             | `prop=globalusage`                                                              |
| `globaluserinfo`    | [CentralAuth](https://www.mediawiki.org/wiki/Extension:CentralAuth)             | `meta=globaluserinfo`                                                           |
| `linter`            | [Linter](https://www.mediawiki.org/wiki/Extension:Linter)                       | `list=linterrors`, `meta=linterstats`                                           |
| `massmessage`       | [MassMessage](https://www.mediawiki.org/wiki/Extension:MassMessage)             | `prop=mmcontent`                                                                |
| `oathauth`          | [OATHAuth](https://www.mediawiki.org/wiki/Extension:OATHAuth)                   | `meta=oath` (removed in OATHAuth 1.46)                                          |
| `pageimages`        | [PageImages](https://www.mediawiki.org/wiki/Extension:PageImages)               | `prop=pageimages`                                                               |
| `pageviews`         | [PageViewInfo](https://www.mediawiki.org/wiki/Extension:PageViewInfo)           | `prop=pageviews`, `list=mostviewed`, `meta=siteviews`                           |
| `wikibase`          | [Wikibase](https://www.mediawiki.org/wiki/Extension:Wikibase)                   | `meta=wikibase`, `prop=pageterms`, `list=wblistentityusage`                     |

## Packs that add new actions

These export standalone response types (scenario 2) — import the one for the action you call:

| Subpath             | Response types                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `abusefilters`      | `ApiAbuseFilterCheckSyntaxResponse`, `ApiAbuseFilterEvalExpressionResponse`, `ApiAbuseFilterCheckMatchResponse`, `ApiAbuseFilterUnblockAutopromoteResponse`, `ApiAbuseLogPrivateDetailsResponse`                                                                                                                                                                                                                                    |
| `categorytree`      | `ApiCategoryTreeResponse`                                                                                                                                                                                                                                                                                                                                                                                                           |
| `centralauth`       | `ApiCentralAuthTokenResponse`, `ApiGlobalUserRightsResponse`, `ApiSetGlobalAccountStatusResponse`, `ApiDeleteGlobalAccountResponse`, `ApiCreateLocalAccountResponse`                                                                                                                                                                                                                                                                |
| `discussiontools`   | `ApiDiscussionToolsEditResponse`, `ApiDiscussionToolsPageInfoResponse`, `ApiDiscussionToolsFindCommentResponse`, `ApiDiscussionToolsGetSubscriptionsResponse`, `ApiDiscussionToolsSubscribeResponse`, `ApiDiscussionToolsThankResponse`, `ApiDiscussionToolsCompareResponse`, `ApiDiscussionToolsPreviewResponse`                                                                                                                   |
| `echo`              | `ApiEchoMuteResponse`, `ApiEchoCreateEventResponse`                                                                                                                                                                                                                                                                                                                                                                                 |
| `flaggedrevs`       | `ApiReviewResponse`, `ApiStabilizeResponse`, `ApiFlagConfigResponse`                                                                                                                                                                                                                                                                                                                                                                |
| `globalpreferences` | `ApiGlobalPreferencesResponse`, `ApiGlobalPreferenceOverridesResponse`                                                                                                                                                                                                                                                                                                                                                              |
| `massmessage`       | `ApiMassMessageResponse`, `ApiEditMassMessageListResponse`                                                                                                                                                                                                                                                                                                                                                                          |
| `oathauth`          | `ApiOATHValidateResponse` (removed in OATHAuth 1.46)                                                                                                                                                                                                                                                                                                                                                                                |
| `sitematrix`        | `ApiSiteMatrixResponse`                                                                                                                                                                                                                                                                                                                                                                                                             |
| `spamblacklist`     | `ApiSpamBlacklistResponse`                                                                                                                                                                                                                                                                                                                                                                                                          |
| `templatedata`      | `ApiTemplateDataResponse`                                                                                                                                                                                                                                                                                                                                                                                                           |
| `thanks`            | `ApiThankResponse`                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `timedmediahandler` | `ApiTranscodeResetResponse`                                                                                                                                                                                                                                                                                                                                                                                                         |
| `titleblacklist`    | `ApiTitleBlacklistResponse`                                                                                                                                                                                                                                                                                                                                                                                                         |
| `translate`         | `ApiAggregateGroupsResponse`, `ApiGroupReviewResponse`, `ApiMarkForTranslationResponse`, `ApiMessageGroupSubscriptionResponse`, `ApiSearchTranslationsResponse`, `ApiTranslateSandboxActionResponse`, `ApiTranslateSandboxCreateResponse`, `ApiTranslationAidsResponse`, `ApiTranslationEntitySearchResponse`, `ApiTranslationReviewResponse`, `ApiTranslationStashResponse`, `ApiTranslationStatsResponse`, `ApiTtmServerResponse` |
| `uls`               | `ApiUlsLocalizationResponse`, `ApiUlsSetLanguageResponse`                                                                                                                                                                                                                                                                                                                                                                           |
| `urlshortener`      | `ApiShortenUrlResponse`                                                                                                                                                                                                                                                                                                                                                                                                             |
| `visualeditor`      | `ApiVisualEditorResponse`, `ApiVisualEditorEditResponse`, `ApiVisualEditorTemplatesUsedResponse`, `ApiEditCheckReferenceUrlResponse`                                                                                                                                                                                                                                                                                                |
| `wikilove`          | `ApiWikiLoveResponse`                                                                                                                                                                                                                                                                                                                                                                                                               |

Packs appearing in both tables (e.g. `abusefilters`, `discussiontools`, `flaggedrevs`) serve both scenarios — activate them once and import their action types by name as needed.

## Adding types the package does not cover

The same seam is general: fields reach a response from sources this package does not cover — an extension it has no pack for, or a site fork that adds fields to core module results. Declare the shape yourself and merge it at the matching landing spot with a hand-written module augmentation; like the built-in packs, the merge applies to the whole project.

- Page-level `prop=` fields merge into `ApiPage`; other query results merge into `ApiQueryResult`.
- Row interfaces — the per-entry objects inside a list result (`ApiUser` for `list=users`, `ApiRecentChange` for `list=recentchanges`, …) — are augmented directly when the site adds per-entry fields.
- Log details merge into [ApiLogEventParams](/api/core/ApiLogEventParams) — site-custom log actions, and legacy key forms still in old rows, both land here.
- Known values of an open union (a site-registered content model, for example) are promoted through the union's augmentation interface, such as `ContentModelExtension` — see [Field conventions](/guide/conventions.html) for the open/closed distinction and a worked example.
- Action responses are standalone envelopes with nothing to merge into; a new action from an uncovered source is just a plain interface you define and import.

```ts
// types/mw-response.d.ts — for the (uncovered) Foo extension's `prop=foo`
import type { Flag } from "types-mediawiki-response";

/** Field group contributed by `prop=foo`. */
export interface ApiPageFoo {
  /** Some status flag. */
  fooflag?: Flag;

  /** Some URL. */
  foourl?: string;
}

declare module "types-mediawiki-response" {
  interface ApiPage {
    foo?: ApiPageFoo;
  }
}
```

Keep the file inside your tsconfig `include`; like the built-in packs, the merge applies to the whole project.

Site-custom fields on a list entry go to the row interface itself:

```ts
// types/mw-response.d.ts — a site fork adds per-user fields to `list=users`
import type {} from "types-mediawiki-response"; // anchors the module for augmentation

declare module "types-mediawiki-response" {
  interface ApiUser {
    /** Site-custom display name; `null` when unset. */
    displayname?: string | null;
  }
}
```

A new action needs no augmentation: declare a `Response extends ApiEnvelope` interface in your own code and import it where you call the action:

```ts
import type { ApiEnvelope } from "types-mediawiki-response";

/** Response of `action=bar` from the uncovered Bar extension. */
export interface ApiBarResponse extends ApiEnvelope {
  /** Result of the action. */
  result?: {
    /** Some count. */
    count: number;
  };
}
```
