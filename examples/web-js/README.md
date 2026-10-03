# web-js — MediaWiki gadget / user script kept in plain JavaScript

A site gadget or user script that stays in plain JavaScript with no build step: JSDoc alone provides the IDE hover types, and the tsconfig's `checkJs` makes CI validate them too. `src/gadget.js` demonstrates `@typedef` aliases, the `/** @type {X} */ (…)` cast that narrows the loose value `mw.Api` resolves to (a plain `@type` annotation on the variable is an assignment, not a cast), and a `list=` query typed the same way — `mw.Api` rejects on API errors, so a resolved value is always a success shape.

Check: `pnpm build && pnpm check:examples` from the repository root, or `pnpm typecheck` inside this directory.

---

# web-js —— 保持纯 JavaScript 的 MediaWiki 小工具 / 用户脚本

保持纯 JavaScript、无构建步骤的站点小工具 / 用户脚本：仅靠 JSDoc 获得 IDE 悬浮类型，tsconfig 的 `checkJs` 让 CI 同样校验它们。`src/gadget.js` 演示 `@typedef` 别名、收窄 `mw.Api` 宽松返回值的 `/** @type {X} */ (…)` 断言（写在变量上的普通 `@type` 是赋值而非断言），以及同样方式标注的 `list=` 查询——`mw.Api` 遇到 API 错误会 reject，resolve 下来的只会是成功形状。

校验：仓库根目录跑 `pnpm build && pnpm check:examples`，或本目录内跑 `pnpm typecheck`。
