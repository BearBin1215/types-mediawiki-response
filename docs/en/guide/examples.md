---
description: "Three minimal, CI-typechecked example projects cover the common consumption scenarios: TS gadgets, plain-JS gadgets with JSDoc hover types, and Node bot clients."
---

# Examples

The repository ships three minimal consumer projects under [`examples/`](https://github.com/BearBin1215/types-mediawiki-response/tree/main/examples), covering three common consumption scenarios:

| Example                                                                                           | Scenario                                   | Typing pattern                                                        |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| [`web-ts`](https://github.com/BearBin1215/types-mediawiki-response/tree/main/examples/web-ts)     | A gadget written in TS and bundled for use | `import type { ApiXxxResponse }` + `as` assertion on `mw.Api` results |
| [`web-js`](https://github.com/BearBin1215/types-mediawiki-response/tree/main/examples/web-js)     | A gadget kept in plain JS                  | JSDoc `/** @type {X} */` cast, hover hints in the IDE                 |
| [`node-bot`](https://github.com/BearBin1215/types-mediawiki-response/tree/main/examples/node-bot) | A client script running on Node            | Generic argument on a request wrapper: `request<ApiXxxResponse>(...)` |

## web-ts: gadget in TypeScript

The gadget workflow: `mw` globals from `types-mediawiki`, response types declared with this package, bundled before deployment. `src/index.ts` demonstrates three shapes:

- Parsed wikitext (`action=parse`).
- Global usages of a file (`prop=globalusage`, activated by a type-only import of the GlobalUsage pack, see [Opt-in extension packs](/guide/ext-packs.html)).
- A token-guarded edit (`postWithToken`).

Every result is typed with an `as` assertion; the imports are type-only and get erased by the bundler.

## web-js: gadget in plain JavaScript

Same runtime environment, no build step: JSDoc provides the types and the IDE renders them on hover. The example shows two JSDoc idioms:

- `@typedef` aliases.
- The `/** @type {X} */` cast that narrows the loose value `mw.Api` resolves to.

The tsconfig enables `checkJs`, so CI validates the JSDoc too.

## node-bot: bot client on Node

There is no `mw.Api` global class like a MediaWiki page provides: a hand-rolled `Bot` class wraps `fetch` and takes the response type as a generic argument — `request<ApiQueryResponse>({ action: "query", … })`.

It covers the pieces a bot actually needs: a descriptive `User-Agent`, `meta=tokens` for the CSRF token, `QueryPage<"revisions">` to scope `query.pages` to the requested props, and an `edit.result` check.

## Try them

```bash
git clone https://github.com/BearBin1215/types-mediawiki-response.git
cd types-mediawiki-response
pnpm install
pnpm build && pnpm check:examples   # builds the package, typechecks all three
```

To check a single example: `cd examples/web-ts && pnpm typecheck`.
