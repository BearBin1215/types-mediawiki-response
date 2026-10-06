---
description: "API reference overview: what the package covers, how the Core and extension-pack references are organized, and where each opt-in pack lands."
---

# API reference

The field-level pages are generated from the declarations, so they always match what ships; each field's semantics, deprecations and parameter constraints live in its JSDoc, both here and on hover in your IDE.

Concepts — the response envelope and error handling, paging through `query` results, narrowing `query.pages` with `QueryPage`, reading log event details, activating extension packs — are covered in the [guide](/guide/getting-started.html). This tree is the field-level reference.

## Core

Everything MediaWiki **core** can return: the response envelope ([ApiEnvelope](core/ApiEnvelope.md), [ApiResponseWith](core/ApiResponseWith.md)), shared atoms ([Flag](core/Flag.md), [Timestamp](core/Timestamp.md) …), one response type per `action=` ([ApiQueryResponse](core/ApiQueryResponse.md), [ApiEditResponse](core/ApiEditResponse.md) …), and the `action=query` framework — [ApiPage](core/ApiPage.md), [ApiQueryResult](core/ApiQueryResult.md), the [QueryPage](core/QueryPage.md) projection, per-module continue tokens ([ApiQueryContinue](core/ApiQueryContinue.md)) and the per-action structured log details of [ApiLogEventParams](core/ApiLogEventParams.md).

Each single-module `action=` maps to one response type:

| `action=`                         | Response type                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| `action=acquiretempusername`      | [ApiAcquireTempUserNameResponse](core/ApiAcquireTempUserNameResponse.md)           |
| `action=block`                    | [ApiBlockResponse](core/ApiBlockResponse.md)                                       |
| `action=changeauthenticationdata` | [ApiChangeAuthenticationDataResponse](core/ApiChangeAuthenticationDataResponse.md) |
| `action=changecontentmodel`       | [ApiChangeContentModelResponse](core/ApiChangeContentModelResponse.md)             |
| `action=checktoken`               | [ApiCheckTokenResponse](core/ApiCheckTokenResponse.md)                             |
| `action=clearhasmsg`              | [ApiClearHasMsgResponse](core/ApiClearHasMsgResponse.md)                           |
| `action=clientlogin`              | [ApiClientLoginResponse](core/ApiClientLoginResponse.md)                           |
| `action=compare`                  | [ApiCompareResponse](core/ApiCompareResponse.md)                                   |
| `action=createaccount`            | [ApiCreateAccountResponse](core/ApiCreateAccountResponse.md)                       |
| `action=delete`                   | [ApiDeleteResponse](core/ApiDeleteResponse.md)                                     |
| `action=edit`                     | [ApiEditResponse](core/ApiEditResponse.md)                                         |
| `action=emailuser`                | [ApiEmailUserResponse](core/ApiEmailUserResponse.md)                               |
| `action=expandtemplates`          | [ApiExpandTemplatesResponse](core/ApiExpandTemplatesResponse.md)                   |
| `action=filerevert`               | [ApiFileRevertResponse](core/ApiFileRevertResponse.md)                             |
| `action=imagerotate`              | [ApiImageRotateResponse](core/ApiImageRotateResponse.md)                           |
| `action=import`                   | [ApiImportResponse](core/ApiImportResponse.md)                                     |
| `action=languagesearch`           | [ApiLanguageSearchResponse](core/ApiLanguageSearchResponse.md)                     |
| `action=login`                    | [ApiLoginResponse](core/ApiLoginResponse.md)                                       |
| `action=logout`                   | [ApiLogoutResponse](core/ApiLogoutResponse.md)                                     |
| `action=managetags`               | [ApiManageTagsResponse](core/ApiManageTagsResponse.md)                             |
| `action=mergehistory`             | [ApiMergeHistoryResponse](core/ApiMergeHistoryResponse.md)                         |
| `action=move`                     | [ApiMoveResponse](core/ApiMoveResponse.md)                                         |
| `action=options`                  | [ApiOptionsResponse](core/ApiOptionsResponse.md)                                   |
| `action=parse`                    | [ApiParseResponse](core/ApiParseResponse.md)                                       |
| `action=patrol`                   | [ApiPatrolResponse](core/ApiPatrolResponse.md)                                     |
| `action=protect`                  | [ApiProtectResponse](core/ApiProtectResponse.md)                                   |
| `action=purge`                    | [ApiPurgeResponse](core/ApiPurgeResponse.md)                                       |
| `action=query`                    | [ApiQueryResponse](core/ApiQueryResponse.md)                                       |
| `action=removeauthenticationdata` | [ApiRemoveAuthenticationDataResponse](core/ApiRemoveAuthenticationDataResponse.md) |
| `action=resetpassword`            | [ApiResetPasswordResponse](core/ApiResetPasswordResponse.md)                       |
| `action=revisiondelete`           | [ApiRevisionDeleteResponse](core/ApiRevisionDeleteResponse.md)                     |
| `action=rollback`                 | [ApiRollbackResponse](core/ApiRollbackResponse.md)                                 |
| `action=setnotificationtimestamp` | [ApiSetNotificationTimestampResponse](core/ApiSetNotificationTimestampResponse.md) |
| `action=setpagelanguage`          | [ApiSetPageLanguageResponse](core/ApiSetPageLanguageResponse.md)                   |
| `action=stashedit`                | [ApiStashEditResponse](core/ApiStashEditResponse.md)                               |
| `action=tag`                      | [ApiTagResponse](core/ApiTagResponse.md)                                           |
| `action=unblock`                  | [ApiUnblockResponse](core/ApiUnblockResponse.md)                                   |
| `action=undelete`                 | [ApiUndeleteResponse](core/ApiUndeleteResponse.md)                                 |
| `action=upload`                   | [ApiUploadResponse](core/ApiUploadResponse.md)                                     |
| `action=userrights`               | [ApiUserrightsResponse](core/ApiUserrightsResponse.md)                             |
| `action=validatepassword`         | [ApiValidatePasswordResponse](core/ApiValidatePasswordResponse.md)                 |
| `action=watch`                    | [ApiWatchResponse](core/ApiWatchResponse.md)                                       |

Browse the [full Core reference](core/overview.md).

## Extension packs

Extension responses are opt-in: each pack lives at the subpath `types-mediawiki-response/ext/<name>` and is activated by a single type-only import — see [Opt-in extension packs](/guide/ext-packs.html). Packs for query sub-modules merge their fields into the shared `ApiPage` / `ApiQueryResult`; packs for extension actions export standalone response types to `import type` directly.

| Pack                                                      | Extension            | Covers                                                                                 |
| --------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------- |
| [abusefilters](extensions/abusefilters/overview.md)       | AbuseFilter          | `list=abusefilters` / `list=abuselog`, `action=abusefilter*` checks                    |
| [babel](extensions/babel/overview.md)                     | Babel                | `meta=babel`                                                                           |
| [categorytree](extensions/categorytree/overview.md)       | CategoryTree         | `action=categorytree` (standalone)                                                     |
| [description](extensions/description/overview.md)         | Wikibase Client      | `prop=description`                                                                     |
| [discussiontools](extensions/discussiontools/overview.md) | DiscussionTools      | `action=discussiontools*` (pageinfo, findcomment, subscriptions, …)                    |
| [echo](extensions/echo/overview.md)                       | Echo / Notifications | `meta=notifications` and related `meta=` / `action=echomute`, `action=echocreateevent` |
| [extracts](extensions/extracts/overview.md)               | TextExtracts         | `prop=extracts`                                                                        |
| [flaggedrevs](extensions/flaggedrevs/overview.md)         | FlaggedRevs          | `prop=flagged`, `list=unreviewedpages` …, `action=review` / `action=stabilize`         |
| [gadgets](extensions/gadgets/overview.md)                 | Gadgets              | `list=gadgets`, `list=gadgetcategories`                                                |
| [globalblocks](extensions/globalblocks/overview.md)       | GlobalBlocking       | `list=globalblocks`                                                                    |
| [globalusage](extensions/globalusage/overview.md)         | GlobalUsage          | `prop=globalusage`                                                                     |
| [globaluserinfo](extensions/globaluserinfo/overview.md)   | CentralAuth          | `meta=globaluserinfo`                                                                  |
| [linter](extensions/linter/overview.md)                   | Linter               | `list=linterrors`, `meta=linterstats`                                                  |
| [pageimages](extensions/pageimages/overview.md)           | PageImages           | `prop=pageimages`                                                                      |
| [pageviews](extensions/pageviews/overview.md)             | PageViewInfo         | `prop=pageviews`, `list=mostviewed`, `meta=siteviews`                                  |
| [scribunto](extensions/scribunto/overview.md)             | Scribunto            | `action=scribunto-console` (standalone)                                                |
| [spamblacklist](extensions/spamblacklist/overview.md)     | SpamBlacklist        | `action=spamblacklist` (standalone)                                                    |
| [templatedata](extensions/templatedata/overview.md)       | TemplateData         | `action=templatedata` (standalone)                                                     |
| [thanks](extensions/thanks/overview.md)                   | Thanks               | `action=thank` (standalone)                                                            |
| [titleblacklist](extensions/titleblacklist/overview.md)   | TitleBlacklist       | `action=titleblacklist` (standalone)                                                   |
| [visualeditor](extensions/visualeditor/overview.md)       | VisualEditor         | `action=visualeditor`, `action=visualeditoredit` … (standalone)                        |
| [wikibase](extensions/wikibase/overview.md)               | Wikibase             | `meta=wikibase`, `prop=pageterms`, `list=wblistentityusage`                            |
