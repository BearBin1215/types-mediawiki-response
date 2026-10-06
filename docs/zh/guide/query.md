---
description: "action=query 响应的类型组织：prop= 模块并入 ApiPage，list= 与 meta= 的结果挂在 query 根下，continue 令牌负责翻页，日志明细共用一个按 action 变化的形状，QueryPage 把页面投影回本次实际请求的 prop。"
---

# query 响应

`action=query` 是用得最多的 action，它的响应类型是组合出来的：各模块的结果按服务端放置的位置并入共享接口。

## 两个落点

- `query.pages[]`：页面级 `prop=` 模块的并集。每个元素是一个 [`ApiPage`](/api/core/ApiPage)，并入了所有已覆盖 `prop=` 模块的字段。页面上实际有哪些字段取决于请求传的 `prop=`，而类型取并集以便使用，但比任何单次请求都“宽”，没请求的字段看起来也可用。
- `query` 根下：`list=` / `meta=` 的结果，以及个别不按页面组织的 `prop=`（如 `prop=stashimageinfo` 落在 `query.stashimageinfo`）。它们直接并入 [`ApiQueryResult`](/api/core/ApiQueryResult)：`list=recentchanges` 对应 `query.recentchanges`，`meta=siteinfo` 对应 `query.general`，以此类推。这些结果不走下文的页面投影。

## 翻页与续传

单个请求拿不完结果的模块，会把续传令牌放进响应顶层的 `continue` 对象（类型 [`ApiQueryContinue`](/api/core/ApiQueryContinue)），同样是声明合并：每个模块按自己的参数前缀贡献一个键，如 `list=categorymembers` 的 `cmcontinue`，另有通用的不透明 `continue` 令牌。对象还在，就把它的键原样带回下一次请求，最省事的做法是把整个对象展开进请求参数。直到它整键缺省，就说明全部获取完毕：

```ts
import type { ApiQueryResponse } from "types-mediawiki-response";

const titles: string[] = [];
let cont: ApiQueryResponse["continue"];

do {
  const res = (await api.get({
    action: "query",
    list: "categorymembers",
    cmtitle: "Category:任务",
    cmlimit: "max",
    ...cont,
    formatversion: "2",
  })) as ApiQueryResponse;

  titles.push(...(res.query.categorymembers ?? []).map(({ title }) => title));
  cont = res.continue;
} while (cont);
```

两个落点都参与续传：list 结果与 generator 驱动的页面查询各有各的键。

## 日志明细

三个模块会带出日志行的结构化明细，服务端把它们归一成同一个形状：

- `list=logevents`：每条日志的 `params`（`leprop=details`）
- `list=recentchanges`：`type=log` 日志行的 `logparams`（`rcprop=loginfo`）
- `list=watchlist`：`type=log` 日志行的 `logparams`（`wlprop=loginfo`）

类型都是 [`ApiLogEventParams`](/api/core/ApiLogEventParams)，覆盖 MediaWiki 核心写出的全部 log action。

一条日志行实际有哪些键，取决于它的 `type`/`action`（`block/block` 条目带 `duration`/`flags`/`sitewide`，`move/move` 条目带 `target_ns`/`target_title`，每个键的文档都点名了携带它的 action）。并非每个 log action 都带明细键：`delete/delete`、`create/create` 这类日志行的 `params` 就是空对象 `{}`，没有内容。

与 `ApiPage` 一样，并集比任何单个条目都宽，编译器也无法把 `params` 关联到该条目的 `action`，读 action 专属键前先在运行时判断 `type`/`action`：

```ts
import type { ApiQueryResponse } from "types-mediawiki-response";

const res = (await api.get({
  action: "query",
  list: "logevents",
  leprop: "title|type|details",
  formatversion: "2",
})) as ApiQueryResponse;

for (const event of res.query.logevents ?? []) {
  // params 在每个条目上都是完整并集——判断只对你有意义，类型层面始终可读
  if (event.type === "block") {
    event.params?.duration; // string | undefined
  }
  event.params?.tag; // string | undefined——已声明的键随处可读

  event.params?.whatever; // unknown——未声明，见下
}
```

声明之外的键落进索引签名，读出来是 `unknown` 而不是报错。如果要把实际会收到的键（比如站点自定义的 log action）提成已知形状，可以往接口里增广：

```ts
// mw-response.d.ts —— 放进 tsconfig include
declare module "types-mediawiki-response" {
  interface ApiLogEventParams {
    foo?: string;
  }
}
```

增广后 `event.params?.foo` 读出 `string | undefined` 而非 `unknown`。注意增广的键与内建键同权：它加进的是所有日志行共享的形状，任何 action 的条目上都能通过编译。

字段属于哪个 action，约定写在 docstring 里（内建键亦然：`duration` 只有 block 系列行会带），运行时判断仍以 `type`/`action` 为准。若想编译期就把读键限定在某个 action，可以不增广，改在调用处把 `params` 收窄成局部形状（`ApiLogEventParams & { foo?: string }`）再读。

query 字段的同一接缝见[按需启用的扩展包](/guide/ext-packs.html)。

## 用 QueryPage 收窄页面

`ApiPage` 是并集，编译器并不知道你这次请求了哪些 `prop=`，所以没请求的字段也能通过检查。[`QueryPage<K>`](/api/core/QueryPage) 把这层信息补回去，把页面收窄到你实际请求的那几个 prop：

```ts
import type { ApiQueryResponse, QueryPage } from "types-mediawiki-response";

const res = (await api.get({
  action: "query",
  prop: "revisions",
  titles,
  formatversion: "2",
})) as ApiQueryResponse;

// 不收窄：ApiPage 是并集，没请求的字段也“可用”
const wide = res.query.pages ?? [];
wide[0]?.revisions; // ok —— 请求过
wide[0]?.categories; // 也“ok” —— 但本次响应里根本没有 categories

// 收窄：身份字段 + revisions
const narrow = (res.query.pages ?? []) as QueryPage<"revisions">[];
narrow[0]?.revisions; // ok
narrow[0]?.categories; // 编译错误 —— 未请求
```

`K` 取 `ApiPage` 的字段键。多数 `prop=` 模块与模块名同名，传如联合类型可以一次投影多个，例如 `QueryPage<"revisions" | "categories">`。

少数模块一次贡献多个页面级键，逐键点名既长又容易漏，可以直接用现成的按模块别名：

| 模块                | 别名                                             | 覆盖的字段                                |
| ------------------- | ------------------------------------------------ | ----------------------------------------- |
| `prop=info`         | [`InfoPage`](/api/core/InfoPage)                 | `prop=info` 贡献的全部页面级字段          |
| `prop=imageinfo`    | [`ImageInfoPage`](/api/core/ImageInfoPage)       | `imageinfo`、`imagerepository`、`badfile` |
| `prop=contributors` | [`ContributorsPage`](/api/core/ContributorsPage) | `contributors`、`anoncontributors`        |
| `generator=search`  | [`SearchPage`](/api/core/SearchPage)             | `generator=search` 注入的命中字段         |

手写键名有两种坑：

- `QueryPage<"info">` 无法通过编译，因为 `prop=info` 没有 `info` 键。
- `QueryPage<"imageinfo">` 只投影 `imageinfo` 数组本身，不含同组的 `imagerepository` / `badfile`。

## 投影机制

`QueryPage` 由 [`ApiPageIdentity`](/api/core/ApiPageIdentity)（所有页面共有的身份字段）、`generator=search` / `generator=prefixsearch` 注入的 `index`，加上 `Pick<ApiPage, K>` 组合而成，是纯类型操作，不干扰各模块对 `ApiPage` 的声明合并，按需启用的扩展包并入的字段同样参与投影。

[`QueryPageExisting`](/api/core/QueryPageExisting)（以及 [`InfoPageExisting`](/api/core/InfoPageExisting)）会在此基础上，把选中的、由所属模块无条件写入的字段收紧为必选，身份字段之外，是 `prop=info` 的核心集合与 `revisions`（完整清单见 [`PropConstantKeys`](/api/core/PropConstantKeys)），门控字段保持可选。
