# web-ts — MediaWiki gadget / user script written in TypeScript

A site gadget or user script written in TypeScript, bundled before being deployed to the wiki: `mw` globals come from `types-mediawiki`, and every `mw.Api` result is typed with `import type { ApiXxxResponse }` plus an `as` assertion. `src/index.ts` demonstrates a read (`action=parse`), a query through the GlobalUsage opt-in pack (`prop=globalusage`), and a token-guarded edit.

Check: `pnpm build && pnpm check:examples` from the repository root, or `pnpm typecheck` inside this directory. Under TS ≥ 7 (tsgo) an extension augmentation is only visible on types referenced in the same file — hence the local `const pages: ApiPage[]` annotation in `findGlobalUsages`; classic tsc does not need it.

---

# web-ts —— TypeScript 编写的 MediaWiki 小工具 / 用户脚本

用 TypeScript 编写、构建打包后部署到 wiki 的站点小工具（gadget）/ 用户脚本：`mw` 全局来自 `types-mediawiki`，每个 `mw.Api` 结果用 `import type { ApiXxxResponse }` 加 `as` 断言标注。`src/index.ts` 演示读取（`action=parse`）、经 GlobalUsage 按需包的查询（`prop=globalusage`）和带 token 保护的编辑。

校验：仓库根目录跑 `pnpm build && pnpm check:examples`，或本目录内跑 `pnpm typecheck`。TS ≥ 7（tsgo）下扩展增广只对同文件引用到的类型可见——所以 `findGlobalUsages` 里有本地 `const pages: ApiPage[]` 注解；经典 tsc 不需要。
