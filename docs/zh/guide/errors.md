---
description: "用 ApiResponseWith 包住成功形状，并按 errorformat 收窄 bc 与 modern 两族错误。"
---

# 信封与错误处理

所有响应类型只建模**非错误响应**，即请求本身未被拒绝时返回的载荷，不等于“操作成功”。要表达“可能出错”时的响应类型，用 [`ApiResponseWith<T>`](/api/core/ApiResponseWith) 包住对应的 `ApiXxxResponse`，再按 `error` / `errors` 收窄：

```ts
import type { ApiEditResponse, ApiResponseWith } from "types-mediawiki-response";

const res = (await api.post({ action: "edit" /* … */ })) as ApiResponseWith<ApiEditResponse>;

if ("error" in res || "errors" in res) {
  // ApiErrorResponse —— 请求失败
} else {
  res.edit; // 成功载荷
}
```

要不要这层包装，取决于客户端怎么暴露错误：

- 站内 `mw.Api` 遇到响应根部带有 `error` / `errors` 时会直接抛出异常，写在 `try`/`catch` 里、直接 cast 成 `ApiXxxResponse` 即可。
- 不自带错误处理的客户端（比如裸 `fetch`）才需要 `ApiResponseWith` 封装，然后自行根据响应结构判定是否成功。

## 根级错误 vs 载荷内失败

“非错误响应”不等于“操作成功”。三种情况：

- **根级 `error` / `errors`**：整个请求失败，不带任何有效载荷，响应就是 [`ApiErrorResponse`](/api/core/ApiErrorResponse)，`ApiResponseWith<T>` 收窄的正是这一种。
- **载荷内失败**（in-band failure）：请求被接受、但操作失败。载荷仍在，失败只是载荷里的普通字段——不经过 `ApiResponseWith`，按字段判定即可。字段的位置随模块而异，例如：
  - `action=emailuser`：`res.emailuser.result` 为 `"Failure"`，失败的原因在 `res.emailuser.errors[]` 内；
  - `action=tag`：`res.tag` 是逐目标的数组，看 `res.tag[i].status` 内的结果状态；
  - `action=move`：`res.move.subpages` 是数组（部分失败）或 `{ errors }` 对象（整批子页面都没能移动）。
- **`warnings`**：两种信封都可能带。

所以 `as ApiXxxResponse` 断言的是“根下没有 error”，而不是“什么都没出错”。

## 两种错误格式

MediaWiki 的错误/警告形状取决于请求的 `errorformat`，本包对两族都建模：

- **bc**（backwards-compatible，默认）：顶层 `error` 为单个对象（`{ code, info, docref }`），警告是按模块名分键的 `warnings` 对象；
- **modern**（`plaintext` / `wikitext` / `html` / `raw` / `none`）：顶层 `errors` 为 [`ApiMessage[]`](/api/core/ApiMessage) 数组，警告是 `ApiMessage[]` 数组，另有顶层 `docref`。

收窄条件同时判断 `error` 与 `errors`，对两种设置都成立。

## 信封字段

[`ApiEnvelope`](/api/core/ApiEnvelope) 建模所有响应（成功与否）都可能出现的顶层字段：`batchcomplete`、`servedby`、`curtimestamp`、`requestid`、`warnings`。

每个 `ApiXxxResponse` 的成功形状已隐含这些字段，错误响应（[`ApiBcErrorResponse`](/api/core/ApiBcErrorResponse) / [`ApiModernErrorResponse`](/api/core/ApiModernErrorResponse)）则显式继承它。
