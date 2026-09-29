# types-mediawiki-response

English | [简体中文](https://github.com/BearBin1215/types-mediawiki-response/blob/main/README.zh.md) | [Document](https://bearbin1215.github.io/types-mediawiki-response/)

Reusable typings for MediaWiki Action API responses.

- **Pure types**: type declarations only — no impact on your bundle size.
- **Cross-version**: field union spanning MediaWiki 1.39–1.47.
- **JSDoc coverage**: every field annotated with its parameter and semantics; hover in your IDE and it is there.
- **Bundled extensions**: extension fields are opt-in (see [Extensions](#extensions)).

## Installation

```bash
npm install -D types-mediawiki-response
```

## Usage

Import the response type for the `action` you called:

```ts
import type { ApiQueryResponse } from "types-mediawiki-response";

const res = (await api.get({
  action: "query",
  prop: "revisions",
  titles,
  formatversion: "2",
})) as ApiQueryResponse;
```

Wrap with `ApiResponseWith<T>` to get the full error response type — see the [envelope and error handling guide](https://bearbin1215.github.io/types-mediawiki-response/guide/errors.html).

When using `ApiQueryResponse`, `query.pages[]` in the response is the union of every covered `prop=` field; project it with `QueryPage<K>` to scope a page to the props you requested — see the [query responses guide](https://bearbin1215.github.io/types-mediawiki-response/guide/query.html).

## Extensions

Extension response types ship as opt-in packs under `types-mediawiki-response/ext/*`. The fields a pack adds to query responses are activated by a one-line type import:

```ts
// mw-extensions.d.ts — declared once per repository, in any file covered by your tsconfig
import type {} from "types-mediawiki-response/ext/flaggedrevs";
import type {} from "types-mediawiki-response/ext/globalusage";
```

The augmentation applies to the whole project, after which field types such as `page.flagged` / `query.notifications` are added where they belong.

An extension action (`action=thank`, `action=wikilove`, …) instead exports a standalone response type — import it by name where you call it, like any core action:

```ts
import type { ApiThankResponse } from "types-mediawiki-response/ext/thanks";

const res = (await api.post({ action: "thank", rev })) as ApiThankResponse;
```

Bundled packs are listed in the [extension packs guide](https://bearbin1215.github.io/types-mediawiki-response/guide/ext-packs.html). Extensions this package does not cover can be augmented the same way with a hand-written `declare module 'types-mediawiki-response' { … }`.
