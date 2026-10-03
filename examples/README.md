# Examples

Minimal, type-checked consumer projects covering the three common ways to use `types-mediawiki-response`. Each example links the package via `workspace:*`, so they always typecheck against the **built** `dist/` — run `pnpm build` first, or just use `pnpm check:examples`, which builds and then typechecks all three. Every example carries its own bilingual README: [web-ts](./web-ts/README.md), [web-js](./web-js/README.md), [node-bot](./node-bot/README.md).

| Directory   | Scenario                                   | Typing pattern                                                        |
| ----------- | ------------------------------------------ | --------------------------------------------------------------------- |
| `web-ts/`   | A gadget written in TS and bundled for use | `import type { ApiXxxResponse }` + `as` assertion on `mw.Api` results |
| `web-js/`   | A gadget kept in plain JS                  | JSDoc `/** @type {X} */` cast, hover hints in the IDE                 |
| `node-bot/` | A client script running on Node            | Generic argument on a request wrapper: `request<ApiXxxResponse>(...)` |

The `web-*` examples also depend on [`types-mediawiki`](https://www.npmjs.com/package/types-mediawiki) for the ambient `mw` globals; that package is unrelated to response typing and only provides `mw.Api` and friends.

Extension fields stay opt-in: importing anything from a pack file activates it — the `web-ts` example enables GlobalUsage with `import type { ApiGlobalUsage } from "types-mediawiki-response/ext/globalusage"`.

The examples are not part of the published package (`files` ships `dist/` and READMEs only); they exist so consumer-facing breakage is caught by `pnpm check`.

---

# 示例

三个最小的、随 CI 类型检查的消费方工程，覆盖使用 `types-mediawiki-response` 的三种常见方式。每个示例通过 `workspace:*` 链接本包，始终对**构建后**的 `dist/` 做类型检查——先跑 `pnpm build`，或直接用 `pnpm check:examples`（构建并对三个示例逐一 typecheck）。每个示例都有各自的双语 README：[web-ts](./web-ts/README.md)、[web-js](./web-js/README.md)、[node-bot](./node-bot/README.md)。

| 目录        | 场景                           | 类型标注方式                                                  |
| ----------- | ------------------------------ | ------------------------------------------------------------- |
| `web-ts/`   | 用 TS 编写、构建后使用的小工具 | `import type { ApiXxxResponse }` + 对 `mw.Api` 结果 `as` 断言 |
| `web-js/`   | 纯 JS 小工具                   | JSDoc `/** @type {X} */` 断言，IDE 内悬浮获得类型提示         |
| `node-bot/` | 跑在 Node 上的客户端脚本       | 请求封装上的泛型参数：`request<ApiXxxResponse>(...)`          |

`web-*` 两个示例还依赖 [`types-mediawiki`](https://www.npmjs.com/package/types-mediawiki) 提供 `mw` 全局类型；该包与响应类型无关，只提供 `mw.Api` 等页面全局。

扩展字段保持按需启用：从扩展包导入任意内容即激活——`web-ts` 示例用 `import type { ApiGlobalUsage } from "types-mediawiki-response/ext/globalusage"` 启用 GlobalUsage。

示例不随包发布（`files` 只含 `dist/` 与 README）；它们的存在让面向消费方的破坏性变更被 `pnpm check` 拦下。
