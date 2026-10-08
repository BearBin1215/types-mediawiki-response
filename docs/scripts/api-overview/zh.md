---
description: "API 参考总览：本包的覆盖范围、Core 与扩展包参考的组织方式，以及各按需启用包的落点。"
---

# API 参考

字段级页面由类型声明生成，与发布内容始终一致；每个字段的语义、弃用情况与参数约束都在 JSDoc 里，此处可查，IDE 悬停同样可见。

响应信封与错误处理、query 结果翻页、用 `QueryPage` 收窄 `query.pages`、读日志明细、字段类型与线格式的对应关系、激活扩展包这些概念见[指南](/guide/getting-started.html)；本树是字段级参考。

:::info
API 参考由 [typedoc](https://typedoc.org/) 从类型声明自动生成，暂无中文翻译。
:::

## Core

MediaWiki **核心**能返回的一切：响应信封（[ApiEnvelope](core/ApiEnvelope.md)、[ApiResponseWith](core/ApiResponseWith.md)）、共享原子类型（[Flag](core/Flag.md)、[Timestamp](core/Timestamp.md) 等）、每个 `action=` 一个响应类型（[ApiQueryResponse](core/ApiQueryResponse.md)、[ApiEditResponse](core/ApiEditResponse.md) 等），以及 `action=query` 框架——[ApiPage](core/ApiPage.md)、[ApiQueryResult](core/ApiQueryResult.md)、[QueryPage](core/QueryPage.md) 投影、各模块的续传令牌（[ApiQueryContinue](core/ApiQueryContinue.md)），以及按 log action 建模的日志明细 [ApiLogEventParams](core/ApiLogEventParams.md)。

单模块 `action=` 各对应一个响应类型：

| `action=`                         | 响应类型                                                                           |
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

完整 Core 参考见 [Core 总览](core/overview.md)。

## 扩展包

扩展响应按需启用：每个包位于子路径 `types-mediawiki-response/ext/<name>`，一条 type-only import 即可激活——见[按需启用扩展包](/guide/ext-packs.html)。query 子模块的包把字段并入共享的 `ApiPage` / `ApiQueryResult`；扩展 action 的包导出独立响应类型，`import type` 直接使用。

| 包                                                        | 扩展                 | 覆盖                                                                             |
| --------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------- |
| [abusefilters](extensions/abusefilters/overview.md)       | AbuseFilter          | `list=abusefilters` / `list=abuselog`，`action=abusefilter*` 系列检查            |
| [babel](extensions/babel/overview.md)                     | Babel                | `meta=babel`                                                                     |
| [categorytree](extensions/categorytree/overview.md)       | CategoryTree         | `action=categorytree`（独立类型）                                                |
| [description](extensions/description/overview.md)         | Wikibase Client      | `prop=description`                                                               |
| [discussiontools](extensions/discussiontools/overview.md) | DiscussionTools      | `action=discussiontools*`（pageinfo、findcomment、subscriptions 等）             |
| [echo](extensions/echo/overview.md)                       | Echo / Notifications | `meta=notifications` 及相关 `meta=`、`action=echomute`、`action=echocreateevent` |
| [extracts](extensions/extracts/overview.md)               | TextExtracts         | `prop=extracts`                                                                  |
| [flaggedrevs](extensions/flaggedrevs/overview.md)         | FlaggedRevs          | `prop=flagged`、`list=unreviewedpages` 等、`action=review` / `action=stabilize`  |
| [gadgets](extensions/gadgets/overview.md)                 | Gadgets              | `list=gadgets`、`list=gadgetcategories`                                          |
| [globalblocks](extensions/globalblocks/overview.md)       | GlobalBlocking       | `list=globalblocks`                                                              |
| [globalusage](extensions/globalusage/overview.md)         | GlobalUsage          | `prop=globalusage`                                                               |
| [globaluserinfo](extensions/globaluserinfo/overview.md)   | CentralAuth          | `meta=globaluserinfo`                                                            |
| [linter](extensions/linter/overview.md)                   | Linter               | `list=linterrors`、`meta=linterstats`                                            |
| [pageimages](extensions/pageimages/overview.md)           | PageImages           | `prop=pageimages`                                                                |
| [pageviews](extensions/pageviews/overview.md)             | PageViewInfo         | `prop=pageviews`、`list=mostviewed`、`meta=siteviews`                            |
| [scribunto](extensions/scribunto/overview.md)             | Scribunto            | `action=scribunto-console`（独立类型）                                           |
| [spamblacklist](extensions/spamblacklist/overview.md)     | SpamBlacklist        | `action=spamblacklist`（独立类型）                                               |
| [templatedata](extensions/templatedata/overview.md)       | TemplateData         | `action=templatedata`（独立类型）                                                |
| [thanks](extensions/thanks/overview.md)                   | Thanks               | `action=thank`（独立类型）                                                       |
| [titleblacklist](extensions/titleblacklist/overview.md)   | TitleBlacklist       | `action=titleblacklist`（独立类型）                                              |
| [visualeditor](extensions/visualeditor/overview.md)       | VisualEditor         | `action=visualeditor`、`action=visualeditoredit` 等（独立类型）                  |
| [wikibase](extensions/wikibase/overview.md)               | Wikibase             | `meta=wikibase`、`prop=pageterms`、`list=wblistentityusage`                      |
