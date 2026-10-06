---
description: "How an action=query response is typed: prop= modules merge into ApiPage, list= and meta= results hang off the query root, continue tokens page through results, log event details share one per-action shape, and QueryPage projects the props you actually requested."
---

# Query responses

`action=query` is the most heavily used action, and its response is typed by composition: module results merge into shared interfaces, keyed by where the server puts them.

## The two landing spots

- `query.pages[]`: the union of the page-level `prop=` modules. Each entry is an [`ApiPage`](/api/core/ApiPage) that merges the fields of every covered `prop=` module. Which fields a page actually carries depends on the `prop=` you passed; the type is their union for convenience, yet wider than any single request, so fields you never asked for look available.
- The `query` root: `list=` / `meta=` results, plus the occasional `prop=` whose result is not page-scoped (e.g. `prop=stashimageinfo` lands at `query.stashimageinfo`). They merge directly into [`ApiQueryResult`](/api/core/ApiQueryResult): `query.recentchanges` for `list=recentchanges`, `query.general` for `meta=siteinfo`, and so on. They do not go through the pages projection below.

## Continuation

Modules that can return more results than one request carries add their tokens to a top-level `continue` object, typed as [`ApiQueryContinue`](/api/core/ApiQueryContinue) — another declaration-merged interface, where each module contributes a key named after its parameter prefix (e.g. `cmcontinue` for `list=categorymembers`), next to the generic opaque `continue` token. While the object is present, pass its keys back on the next request; spreading the whole object into the request is the usual way. Once it is absent, you have everything:

```ts
import type { ApiQueryResponse } from "types-mediawiki-response";

const titles: string[] = [];
let cont: ApiQueryResponse["continue"];

do {
  const res = (await api.get({
    action: "query",
    list: "categorymembers",
    cmtitle: "Category:Contents",
    cmlimit: "max",
    ...cont,
    formatversion: "2",
  })) as ApiQueryResponse;

  titles.push(...(res.query.categorymembers ?? []).map(({ title }) => title));
  cont = res.continue;
} while (cont);
```

Both landing spots take part in continuation: list results and generator-driven page queries each contribute their own keys.

## Log event details

Three modules surface the structured details of log entries, and the server normalizes them all into one shape:

- `list=logevents`: each log entry's `params` (`leprop=details`)
- `list=recentchanges`: `logparams` on `type=log` entries (`rcprop=loginfo`)
- `list=watchlist`: `logparams` on `type=log` entries (`wlprop=loginfo`)

All three are typed as [`ApiLogEventParams`](/api/core/ApiLogEventParams), covering every log action MediaWiki core writes.

Which keys an entry actually carries depends on its `type`/`action` (a `block/block` entry carries `duration`/`flags`/`sitewide`, a `move/move` entry carries `target_ns`/`target_title`; each key's doc names the actions that carry it). Not every log action has detail keys: on `delete/delete` and `create/create` entries, `params` is an empty object `{}` — present, just empty.

As with `ApiPage`, the union is wider than any single entry, and the compiler cannot correlate `params` with the entry's `action`, so check `type`/`action` at runtime before reading action-specific keys:

```ts
import type { ApiQueryResponse } from "types-mediawiki-response";

const res = (await api.get({
  action: "query",
  list: "logevents",
  leprop: "title|type|details",
  formatversion: "2",
})) as ApiQueryResponse;

for (const event of res.query.logevents ?? []) {
  // params reads as the full union on every entry — the check is for you, not the compiler
  if (event.type === "block") {
    event.params?.duration; // string | undefined
  }
  event.params?.tag; // string | undefined — declared keys read anywhere

  event.params?.whatever; // unknown — not declared, see below
}
```

Keys outside the declared set fall through to the index signature and read as `unknown` instead of erroring. To promote keys you actually receive — say, from a site-custom log action — merge them into the interface:

```ts
// mw-response.d.ts — inside your tsconfig include
declare module "types-mediawiki-response" {
  interface ApiLogEventParams {
    /** Subject page of the site-custom `foo/foo` log action. */
    foo?: string;
  }
}
```

Merged, `event.params?.foo` reads as `string | undefined` instead of `unknown`. An augmented key has the same standing as a built-in one: it joins the shape shared by all log entries, so reading it compiles on entries of any action.

Which action a field belongs to is a docstring convention (built-in keys work the same way: `duration` only ever appears on block-family rows); at runtime, go by `type`/`action`. If you want compile-time restriction of a read to one action, skip the augmentation and narrow `params` to a local shape (`ApiLogEventParams & { foo?: string }`) at the call site.

The same seam for query fields is described in [Opt-in extension packs](/guide/ext-packs.html).

## Narrowing pages with QueryPage

`ApiPage` is a union, and the compiler does not know which `prop=` you requested, so a field you never asked for still typechecks. [`QueryPage<K>`](/api/core/QueryPage) puts that information back, narrowing the page to the props you actually requested:

```ts
import type { ApiQueryResponse, QueryPage } from "types-mediawiki-response";

const res = (await api.get({
  action: "query",
  prop: "revisions",
  titles,
  formatversion: "2",
})) as ApiQueryResponse;

// Not narrowed: ApiPage is the union, so unrequested fields look available
const wide = res.query.pages ?? [];
wide[0]?.revisions; // ok — requested
wide[0]?.categories; // also "ok" — but this response carries no categories

// Narrowed: identity fields + revisions only
const narrow = (res.query.pages ?? []) as QueryPage<"revisions">[];
narrow[0]?.revisions; // ok
narrow[0]?.categories; // compile error — not requested
```

`K` takes field keys of `ApiPage`. For most `prop=` modules the key matches the module name, and passing a union type projects several at once, e.g. `QueryPage<"revisions" | "categories">`.

A few modules contribute several page-level keys at once; naming every key is long and easy to get wrong, so you can use the ready-made per-module aliases instead:

| Module              | Alias                                            | Covers                                         |
| ------------------- | ------------------------------------------------ | ---------------------------------------------- |
| `prop=info`         | [`InfoPage`](/api/core/InfoPage)                 | every page-level field `prop=info` contributes |
| `prop=imageinfo`    | [`ImageInfoPage`](/api/core/ImageInfoPage)       | `imageinfo`, `imagerepository`, `badfile`      |
| `prop=contributors` | [`ContributorsPage`](/api/core/ContributorsPage) | `contributors`, `anoncontributors`             |
| `generator=search`  | [`SearchPage`](/api/core/SearchPage)             | the hit fields `generator=search` injects      |

Spelling the keys by hand has two traps:

- `QueryPage<"info">` does not compile, because `prop=info` has no `info` key.
- `QueryPage<"imageinfo">` projects only the `imageinfo` array, not its sibling fields (`imagerepository` / `badfile`).

## How the projection works

`QueryPage` is built from [`ApiPageIdentity`](/api/core/ApiPageIdentity) (the identity fields shared by every page), the `index` a `generator=search` / `generator=prefixsearch` request injects, plus `Pick<ApiPage, K>`. It is a pure type-level operation; it does not interfere with the per-module declaration merging, and fields contributed by opt-in extension packs participate in the projection too.

[`QueryPageExisting`](/api/core/QueryPageExisting) (and [`InfoPageExisting`](/api/core/InfoPageExisting)) additionally require the picked fields their module writes unconditionally: the identity fields plus the `prop=info` core set and `revisions` (see [`PropConstantKeys`](/api/core/PropConstantKeys)). Gated fields stay optional.
