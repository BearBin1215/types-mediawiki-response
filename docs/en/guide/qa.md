---
description: "Sharp edges that only surface once the types meet a real request client."
---

# FAQ

## Paginated query loop errors with TS7022 (self-reference)

When you page through a `list=` module, you may end up carrying the continuation cursor as a single variable that both goes into the request and comes back out of the response:

```ts
import type { ApiQueryResponse } from "types-mediawiki-response";

const titles: string[] = [];
let cmcontinue: string | false = false;

do {
  // ❌ TS7022: 'res' implicitly has type 'any' …
  const res = await api.get<ApiQueryResponse>({
    action: "query",
    list: "categorymembers",
    cmtitle: "Category:Games",
    cmlimit: "max",
    cmcontinue, // (1) the cursor goes into the request …
  });
  cmcontinue = res.continue?.cmcontinue || false; // (2) … and comes back out of res
  titles.push(...(res.query.categorymembers ?? []).map((m) => m.title ?? ""));
} while (cmcontinue);
```

This only triggers when your client's return type is chosen by the caller (a generic `get<T>` / `post<T>` returning `Promise<T>`). Clients that cast the result — as in `(await api.get({ … })) as ApiQueryResponse` — never run into it.

**Cause.** `res`'s type is inferred from the call, and the call's argument is the object literal just above. That literal embeds the shorthand property `cmcontinue` (1), so typing the argument first needs the type of `cmcontinue` — but `cmcontinue` is assigned back from `res` at (2). The dependency runs straight back into the binding being declared:

```
res  →  api.get({ …, cmcontinue })  →  cmcontinue  →  res.continue  →  res
```

TypeScript cannot resolve the cycle, so under `noImplicitAny` it gives up and types `res` as `any`. The TS7006 you then see on `m` in the `.map((m) => …)` line is just fallout.

**Fix — any one of these breaks the cycle.**

1. Annotate the response, so its type no longer has to be inferred through the argument:

   ```ts
   const res: ApiQueryResponse = await api.get<ApiQueryResponse>({
     /* … */
     cmcontinue,
   });
   ```

2. Spread a single, independently typed `continue` object in place of the cursor variable, so the request body references nothing derived from `res` inside its own initializer:

   ```ts
   const titles: string[] = [];
   let cont: ApiQueryResponse["continue"];

   do {
     const res = await api.get<ApiQueryResponse>({
       action: "query",
       list: "categorymembers",
       cmtitle: "Category:Games",
       cmlimit: "max",
       ...cont,
     });
     titles.push(...(res.query.categorymembers ?? []).map((m) => m.title ?? ""));
     cont = res.continue;
   } while (cont);
   ```

3. Cast the awaited result instead of passing a type argument:

   ```ts
   const res = (await api.get({ /* … */ cmcontinue })) as ApiQueryResponse;
   ```
