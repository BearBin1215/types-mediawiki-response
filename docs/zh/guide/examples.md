---
description: "三个最小、随 CI 类型检查的示例工程覆盖常见消费场景：TS 小工具、靠 JSDoc 获得悬浮类型的纯 JS 小工具、跑在 Node 上的机器人客户端。"
---

# 示例

仓库在 [`examples/`](https://github.com/BearBin1215/types-mediawiki-response/tree/main/examples) 下附带了三个最小的消费方工程，对应三种常见消费场景：

| 示例                                                                                              | 场景                           | 类型标注方式                                                  |
| ------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------- |
| [`web-ts`](https://github.com/BearBin1215/types-mediawiki-response/tree/main/examples/web-ts)     | 用 TS 编写、构建后使用的小工具 | `import type { ApiXxxResponse }` + 对 `mw.Api` 结果 `as` 断言 |
| [`web-js`](https://github.com/BearBin1215/types-mediawiki-response/tree/main/examples/web-js)     | 纯 JS 小工具                   | JSDoc `/** @type {X} */` 断言，IDE 内悬浮获得类型提示         |
| [`node-bot`](https://github.com/BearBin1215/types-mediawiki-response/tree/main/examples/node-bot) | 跑在 Node 上的客户端脚本       | 请求封装上的泛型参数：`request<ApiXxxResponse>(...)`          |

## web-ts：TypeScript 小工具

小工具工作流：`mw` 全局来自 `types-mediawiki`，用本包声明响应类型，构建后部署。`src/index.ts` 演示三种形状：

- wikitext 解析结果（`action=parse`）。
- 文件全域使用查询（`prop=globalusage`，由 GlobalUsage 包的 type-only 导入激活，见[按需启用扩展包](/guide/ext-packs.html)）。
- 带 token 编辑（`postWithToken`）。

每个结果都用 `as` 断言标注，导入全是 type-only，打包时被擦除。

## web-js：纯 JavaScript 小工具

同样的运行环境，但没有构建步骤：类型由 JSDoc 提供，IDE 直接悬浮展示。示例演示两个 JSDoc 惯用法：

- `@typedef` 别名。
- 用 `/** @type {X} */` 断言收窄 `mw.Api` 返回的宽松对象。

tsconfig 开启了 `checkJs`，CI 同样校验 JSDoc。

## node-bot：Node 上的机器人客户端

没有 MediaWiki 网页提供的 `mw.Api` 全局类，手写的 `Bot` 类封装 `fetch`，把响应类型作为泛型参数传入：`request<ApiQueryResponse>({ action: "query", … })`。

覆盖机器人实际需要的几块东西：规范的 `User-Agent`、取 CSRF token 的 `meta=tokens`、把 `query.pages` 限定到实际请求 prop 的 `QueryPage<"revisions">`，以及 `edit.result` 检查。

## 本地试用

```bash
git clone https://github.com/BearBin1215/types-mediawiki-response.git
cd types-mediawiki-response
pnpm install
pnpm build && pnpm check:examples   # 构建本包，随后对三个示例做类型检查
```

只查一个示例：`cd examples/web-ts && pnpm typecheck`。
