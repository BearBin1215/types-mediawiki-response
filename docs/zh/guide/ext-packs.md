---
description: "按站点实际安装的扩展，用按需启用的包加一条 type-only import 激活扩展响应字段；扩展 action 则按名导入响应类型。"
---

# 按需启用扩展包

核心的 [`ApiPage`](/api/core/ApiPage) / [`ApiQueryResult`](/api/core/ApiQueryResult) 只覆盖 MediaWiki 核心的字段，扩展引入的字段类型按扩展拆成按需启用的包（子路径 `types-mediawiki-response/ext/<name>`），对照站点实际安装的扩展激活即可。

使用上分两种场景，机制不同：

- **已装扩展的 query 模块字段**（响应里多出来的某个 `list=` / `prop=` / `meta=` 键）：每个项目激活一次，之后这些字段直接出现在所有文件的 `ApiPage` / `ApiQueryResult` 上。
- **扩展的 action**（`action=shortenurl`、`action=thank` 等）：像核心 action 一样，在需要的地方按名导入独立的响应类型。

## 场景一：已装扩展的 query 字段

每个包自带 `declare module` 增广——键名与落点收在包内，消费方项目里不会冻结一段日后会漂移的片段。激活一个包只需从它 type-only 导入任意内容：

```ts
// mw-response.d.ts —— 每个仓库声明一次，放在任意被 tsconfig include 的文件里
import type {} from "types-mediawiki-response/ext/flaggedrevs";
import type {} from "types-mediawiki-response/ext/globalusage";
// ApiPage.flagged / ApiPage.globalusage 在项目的每个文件里都出现
```

推荐放一个专门的类型文件（例如 `mw-response.d.ts`，保持在 tsconfig 的 `include` 字段内），在文件内列全当前项目对应 wiki 实际安装的扩展。增广对整个 tsconfig 所覆盖的项目生效，业务文件不用重复声明，可以直接用 `page.flagged` / `query.notifications`。或者只要在任意地方导入过要用的字段组类型（如 [`ApiPageFlagged`](/api/extensions/flaggedrevs/ApiPageFlagged)），包的增广同样随之生效。

## 场景二：调用扩展的 action

扩展提供的 action 导出对应的独立响应类型，不并入 `ApiPage` / `ApiQueryResult`。从对应包按名导入，与核心 action 使用方法相同：

```ts
import type { ApiThankResponse } from "types-mediawiki-response/ext/thanks";

const res: ApiThankResponse = await api.post({
  action: "thank",
  rev: 12345,
});
res.result?.recipient;
```

这一条 import 附带两件事：

- 该扩展如果还有 query 模块（比如 `discussiontools` 既有 `action=discussiontoolspageinfo` 响应、又有 `prop=threaditemshtml`），其 query 字段也随之激活。
- 仅为调用 action 时不需要把包写进 `mw-response.d.ts`；只有同时消费它的 query 字段才需要。

## 增广 query 类型的包

wiki 装了对应扩展就激活（场景一），所列模块的字段会出现在 `ApiPage` / `ApiQueryResult` 上：

| 子路径              | 扩展                                                                            | query 模块                                                  |
| ------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `abusefilters`      | [AbuseFilter](https://www.mediawiki.org/wiki/Extension:AbuseFilter)             | `list=abusefilters`、`list=abuselog`                        |
| `babel`             | [Babel](https://www.mediawiki.org/wiki/Extension:Babel)                         | `meta=babel`                                                |
| `checkuser`         | [CheckUser](https://www.mediawiki.org/wiki/Extension:CheckUser)                 | `list=checkuser`、`list=checkuserlog`                       |
| `description`       | [Wikibase Client](https://www.mediawiki.org/wiki/Extension:Wikibase_Client)     | `prop=description`                                          |
| `echo`              | [Echo](https://www.mediawiki.org/wiki/Extension:Echo)                           | `meta=notifications` 等                                     |
| `extracts`          | [TextExtracts](https://www.mediawiki.org/wiki/Extension:TextExtracts)           | `prop=extracts`                                             |
| `flaggedrevs`       | [FlaggedRevs](https://www.mediawiki.org/wiki/Extension:FlaggedRevs)             | `prop=flagged`、`list=unreviewedpages` 等                   |
| `gadgets`           | [Gadgets](https://www.mediawiki.org/wiki/Extension:Gadgets)                     | `list=gadgets`                                              |
| `globalblocks`      | [GlobalBlocking](https://www.mediawiki.org/wiki/Extension:GlobalBlocking)       | `list=globalblocks`                                         |
| `globalpreferences` | [GlobalPreferences](https://www.mediawiki.org/wiki/Extension:GlobalPreferences) | `meta=globalpreferences`                                    |
| `globalusage`       | [GlobalUsage](https://www.mediawiki.org/wiki/Extension:GlobalUsage)             | `prop=globalusage`                                          |
| `globaluserinfo`    | [CentralAuth](https://www.mediawiki.org/wiki/Extension:CentralAuth)             | `meta=globaluserinfo`                                       |
| `linter`            | [Linter](https://www.mediawiki.org/wiki/Extension:Linter)                       | `list=linterrors`、`meta=linterstats`                       |
| `massmessage`       | [MassMessage](https://www.mediawiki.org/wiki/Extension:MassMessage)             | `prop=mmcontent`                                            |
| `oathauth`          | [OATHAuth](https://www.mediawiki.org/wiki/Extension:OATHAuth)                   | `meta=oath`（OATHAuth 1.46 移除）                           |
| `pageimages`        | [PageImages](https://www.mediawiki.org/wiki/Extension:PageImages)               | `prop=pageimages`                                           |
| `pageviews`         | [PageViewInfo](https://www.mediawiki.org/wiki/Extension:PageViewInfo)           | `prop=pageviews`、`list=mostviewed`、`meta=siteviews`       |
| `wikibase`          | [Wikibase](https://www.mediawiki.org/wiki/Extension:Wikibase)                   | `meta=wikibase`、`prop=pageterms`、`list=wblistentityusage` |

## 引入新 action 的包

这些包导出独立的响应类型（场景二），根据调用的 action 导入对应类型：

| 子路径              | 响应类型                                                                                                                                                                                                                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `abusefilters`      | `ApiAbuseFilterCheckSyntaxResponse`、`ApiAbuseFilterEvalExpressionResponse`、`ApiAbuseFilterCheckMatchResponse`、`ApiAbuseFilterUnblockAutopromoteResponse`、`ApiAbuseLogPrivateDetailsResponse`                                                                                                                  |
| `categorytree`      | `ApiCategoryTreeResponse`                                                                                                                                                                                                                                                                                         |
| `discussiontools`   | `ApiDiscussionToolsEditResponse`、`ApiDiscussionToolsPageInfoResponse`、`ApiDiscussionToolsFindCommentResponse`、`ApiDiscussionToolsGetSubscriptionsResponse`、`ApiDiscussionToolsSubscribeResponse`、`ApiDiscussionToolsThankResponse`、`ApiDiscussionToolsCompareResponse`、`ApiDiscussionToolsPreviewResponse` |
| `echo`              | `ApiEchoMuteResponse`、`ApiEchoCreateEventResponse`                                                                                                                                                                                                                                                               |
| `flaggedrevs`       | `ApiReviewResponse`、`ApiStabilizeResponse`、`ApiFlagConfigResponse`                                                                                                                                                                                                                                              |
| `globalpreferences` | `ApiGlobalPreferencesResponse`、`ApiGlobalPreferenceOverridesResponse`                                                                                                                                                                                                                                            |
| `massmessage`       | `ApiMassMessageResponse`、`ApiEditMassMessageListResponse`                                                                                                                                                                                                                                                        |
| `oathauth`          | `ApiOATHValidateResponse`（OATHAuth 1.46 移除）                                                                                                                                                                                                                                                                   |
| `sitematrix`        | `ApiSiteMatrixResponse`                                                                                                                                                                                                                                                                                           |
| `spamblacklist`     | `ApiSpamBlacklistResponse`                                                                                                                                                                                                                                                                                        |
| `templatedata`      | `ApiTemplateDataResponse`                                                                                                                                                                                                                                                                                         |
| `thanks`            | `ApiThankResponse`                                                                                                                                                                                                                                                                                                |
| `timedmediahandler` | `ApiTranscodeResetResponse`                                                                                                                                                                                                                                                                                       |
| `titleblacklist`    | `ApiTitleBlacklistResponse`                                                                                                                                                                                                                                                                                       |
| `urlshortener`      | `ApiShortenUrlResponse`                                                                                                                                                                                                                                                                                           |
| `visualeditor`      | `ApiVisualEditorResponse`、`ApiVisualEditorEditResponse`、`ApiVisualEditorTemplatesUsedResponse`、`ApiEditCheckReferenceUrlResponse`                                                                                                                                                                              |
| `wikilove`          | `ApiWikiLoveResponse`                                                                                                                                                                                                                                                                                             |

同时出现在两张表里的包（如 `abusefilters`、`discussiontools`、`flaggedrevs`）两种场景都服务——激活一次，action 类型按需按名导入。

## 给未覆盖的扩展补充类型

同样的接缝是通用的。若站点装了本包未覆盖的扩展，可自己声明字段组，再用模块增广并入 query 面。

- query 字段的并入点是 `ApiPage` / `ApiQueryResult`。
- 日志明细的并入点是 [ApiLogEventParams](/api/core/ApiLogEventParams)，自定义的 log action、以及仍留在老行里的遗留键形都从这里并入。
- action 响应是独立信封，没有可并入的共享形状，未覆盖扩展的新 action 只需自己定义普通接口并按名导入。

```ts
// types/mw-response.d.ts —— 以未覆盖的 Foo 扩展的 `prop=foo` 为例
import type { Flag } from "types-mediawiki-response";

/** `prop=foo` 贡献的字段组。 */
export interface ApiPageFoo {
  /** 某状态标记。 */
  fooflag?: Flag;

  /** 某链接。 */
  foourl?: string;
}

declare module "types-mediawiki-response" {
  interface ApiPage {
    foo?: ApiPageFoo;
  }
}
```

把文件放在 tsconfig `include` 内即可，与内置包一样，增广对整个项目生效。

新的 action 则不需要增广，自己声明一个 `extends ApiEnvelope` 的响应接口，在调用该 action 的地方导入使用：

```ts
import type { ApiEnvelope } from "types-mediawiki-response";

/** 未覆盖的 Bar 扩展 `action=bar` 的响应。 */
export interface ApiBarResponse extends ApiEnvelope {
  /** 该 action 的结果。 */
  result?: {
    /** 某计数。 */
    count: number;
  };
}
```
