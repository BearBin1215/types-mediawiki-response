# node-bot — MediaWiki bot / client script running on Node.js

A custom TypeScript client for a MediaWiki bot: no `mw` globals, no jQuery — a hand-rolled `Bot` class wraps `fetch` and takes the response type as a generic argument (`request<ApiXxxResponse>(...)`). `src/bot.ts` covers what a bot actually needs: a descriptive `User-Agent`, the CSRF token via `meta=tokens`, `QueryPage<"revisions">` to scope `query.pages` to the requested props, and an `edit.result` check.

Check: `pnpm build && pnpm check:examples` from the repository root, or `pnpm typecheck` inside this directory. The example only typechecks; to execute it, wire real credentials and pass the file to any TS runner (e.g. `npx tsx src/bot.ts`).

---

# node-bot —— 跑在 Node.js 上的 MediaWiki 机器人 / 客户端脚本

自定义的 TypeScript MediaWiki 客户端：没有 `mw` 全局、没有 jQuery——手写的 `Bot` 类封装 `fetch`，把响应类型作为泛型参数传入（`request<ApiXxxResponse>(...)`）。`src/bot.ts` 覆盖机器人实际需要的几块东西：规范的 `User-Agent`、经 `meta=tokens` 取 CSRF token、用 `QueryPage<"revisions">` 把 `query.pages` 限定到实际请求的 prop、`edit.result` 检查。

校验：仓库根目录跑 `pnpm build && pnpm check:examples`，或本目录内跑 `pnpm typecheck`。本示例只做类型检查；要实际执行，接好真实凭据后交给任意 TS 运行器（如 `npx tsx src/bot.ts`）。
