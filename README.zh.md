# types-mediawiki-response

[English](https://github.com/BearBin1215/types-mediawiki-response/blob/main/README.md) | 简体中文 | [在线文档](https://bearbin1215.github.io/types-mediawiki-response/zh/)

为 MediaWiki Action API 响应提供可复用类型。

- **纯类型**：产物仅类型声明，不影响产物体积。
- **跨版本支持**：覆盖 MediaWiki 1.39–1.47 的字段并集。
- **JSDoc 覆盖**：逐字段标注参数与语义，IDE 悬停即文档。
- **内置扩展**：支持按需引入扩展内容（见[扩展](#扩展)）。

## 安装

```bash
npm install -D types-mediawiki-response
```

## 用法

按调用的 `action` 导入对应响应类型：

```ts
import type { ApiQueryResponse } from "types-mediawiki-response";

const res = (await api.get({
  action: "query",
  prop: "revisions",
  titles,
  formatversion: "2",
})) as ApiQueryResponse;
```

可用 `ApiResponseWith<T>` 包装以获得含错误结果的响应类型，见文档[信封与错误处理指南](https://bearbin1215.github.io/types-mediawiki-response/zh/guide/errors.html)。

使用 `ApiQueryResponse` 的情况下，响应里的 `query.pages[]` 类型是所有已覆盖 `prop=` 字段的并集，可用 `QueryPage<K>` 收窄到本次请求的 prop，见文档[query 响应指南](https://bearbin1215.github.io/types-mediawiki-response/zh/guide/query.html)。

## 扩展

扩展响应类型以可选包形式放在 `types-mediawiki-response/ext/*`。扩展往 query 响应中加入的字段通过一行类型导入来激活：

```ts
// mw-extensions.d.ts —— 每个仓库声明一次，放在任意被 tsconfig include 的文件里
import type {} from "types-mediawiki-response/ext/flaggedrevs";
import type {} from "types-mediawiki-response/ext/globalusage";
```

增广对整个项目生效，此后 `page.flagged` / `query.notifications` 等字段类型就会被添加到对应位置。

扩展的 action（`action=thank`、`action=wikilove` 等）则导出独立响应类型，在调用处按名导入，像核心 action 一样使用：

```ts
import type { ApiThankResponse } from "types-mediawiki-response/ext/thanks";

const res = (await api.post({ action: "thank", rev })) as ApiThankResponse;
```

内置包清单见文档站的[扩展包指南](https://bearbin1215.github.io/types-mediawiki-response/zh/guide/ext-packs.html)。本包未覆盖的扩展，手写 `declare module 'types-mediawiki-response' { … }` 走同一接缝增广。
