---
description: "Wrap the success shape with ApiResponseWith and narrow the two errorformat families."
---

# Envelope and error handling

All response types model the **non-error response** — the payload returned when the request itself was not rejected. That is **not** the same as "the operation succeeded"; see [Root errors vs in-band failures](#root-errors-vs-in-band-failures) below. To express "may fail", wrap the corresponding `ApiXxxResponse` with [`ApiResponseWith<T>`](/api/core/ApiResponseWith) and narrow on `error` / `errors`:

```ts
import type { ApiEditResponse, ApiResponseWith } from "types-mediawiki-response";

const res = (await api.post({ action: "edit" /* … */ })) as ApiResponseWith<ApiEditResponse>;

if ("error" in res || "errors" in res) {
  // ApiErrorResponse — the request failed
} else {
  res.edit; // success payload
}
```

Which clients need this wrapper depends on how they surface errors. `mw.Api`, the stock in-wiki client, **rejects the promise** when the response carries a root `error` / `errors` — inside `try`/`catch`, casting straight to `ApiXxxResponse` is enough and the narrowing above is unnecessary. `ApiResponseWith` is for clients that resolve the error envelope as an ordinary value (a bare `fetch` wrapper, for example). In-band failures stay in the payload either way.

## Root errors vs in-band failures

"Non-error response" is not the same as "the operation succeeded". Three cases:

- **Root-level `error` / `errors`** — the request failed as a whole and carries no payload; the entire response is [`ApiErrorResponse`](/api/core/ApiErrorResponse). This is the case `ApiResponseWith<T>` narrows on.
- **In-band failure** — the request was accepted but the operation failed. The payload is present, and the failure is an ordinary field of it — no `ApiResponseWith` involved, just check the field. Where the field lives depends on the module, for example:
  - `action=emailuser`: `res.emailuser.result` is `"Failure"`, with the reason inside `res.emailuser.errors[]`;
  - `action=tag`: `res.tag` is a per-target array; check the result status in `res.tag[i].status`;
  - `action=move`: `res.move.subpages` is either an array (partial failure) or an `{ errors }` object (the whole subpage move failed).
- **`warnings`** — may appear on either envelope.

So casting to `ApiXxxResponse` asserts "no root error", not "nothing went wrong".

## Two error formats

The error/warning shape depends on the request's `errorformat`; both families are modeled:

- **bc** (backwards-compatible, the default): a single top-level `error` object (`{ code, info, docref }`), and warnings as a `warnings` object keyed by module name;
- **modern** (`plaintext` / `wikitext` / `html` / `raw` / `none`): a top-level `errors` array of [`ApiMessage`](/api/core/ApiMessage), warnings as an `ApiMessage[]` array, plus a top-level `docref`.

The narrowing condition checks both `error` and `errors`, so it holds under either setting.

## Envelope fields

[`ApiEnvelope`](/api/core/ApiEnvelope) models the top-level fields that may appear on any response, successful or not: `batchcomplete`, `servedby`, `curtimestamp`, `requestid`, `warnings`.

Every `ApiXxxResponse` already carries these fields; the error responses ([`ApiBcErrorResponse`](/api/core/ApiBcErrorResponse) / [`ApiModernErrorResponse`](/api/core/ApiModernErrorResponse)) extend them explicitly.
