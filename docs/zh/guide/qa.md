---
description: "只有把类型接进真实的请求代码时才会冒出来的毛刺。"
---

# 常见问题

## 翻页 query 循环报错 TS7022

给 `list=` 模块翻页时，可能会把续传游标写成同一个变量——它既进请求体、又从响应里被赋值回来：

```ts
import type { ApiQueryResponse } from "types-mediawiki-response";

const titles: string[] = [];
let cmcontinue: string | false = false;

do {
  // ❌ TS7022: 'res' implicitly has type 'any' …
  const res = await api.get<ApiQueryResponse>({
    action: "query",
    list: "categorymembers",
    cmtitle: "Category:游戏",
    cmlimit: "max",
    cmcontinue, // (1) 游标进了请求体 …
  });
  cmcontinue = res.continue?.cmcontinue || false; // (2) … 又从 res 里被赋值回来
  titles.push(...(res.query.categorymembers ?? []).map((m) => m.title ?? ""));
} while (cmcontinue);
```

这只在你的客户端返回类型由调用方的 `Promise<T>`（泛型 `get<T>` / `post<T>`）指定时才会触发。用断言写法的客户端如 `(await api.get({ … })) as ApiQueryResponse` 不会碰到。

**原因**：`res` 的类型由调用推断，而调用的实参就是前面的对象字面量。字面量里嵌了简写属性 `cmcontinue`（1），于是要给实参定类型就得先知道 `cmcontinue` 的类型，而 `cmcontinue` 又是在（2）处从 `res` 赋值来的。依赖就这样绕回了正在声明的那个绑定：

```
res  →  api.get({ …, cmcontinue })  →  cmcontinue  →  res.continue  →  res
```

TypeScript 解不开这个环，在 `noImplicitAny` 下只好放弃，把 `res` 判成 `any`。随后那句 `.map((m) => …)` 里的 `m` 报 TS7006 就是连带后果。

**修法（任选其一）：**

1. 给响应加显式标注，让它的类型不必再经由实参推断：

   ```ts
   const res: ApiQueryResponse = await api.get<ApiQueryResponse>({
     /* … */
     cmcontinue,
   });
   ```

2. 用一个类型独立的 `continue` 对象整体展开，替代单个游标变量，使请求体在自己的初始化式里不引用任何来自 `res` 的东西：

   ```ts
   const titles: string[] = [];
   let cont: ApiQueryResponse["continue"];

   do {
     const res = await api.get<ApiQueryResponse>({
       action: "query",
       list: "categorymembers",
       cmtitle: "Category:游戏",
       cmlimit: "max",
       ...cont,
     });
     titles.push(...(res.query.categorymembers ?? []).map((m) => m.title ?? ""));
     cont = res.continue;
   } while (cont);
   ```

3. 对 await 结果用断言，而不是传类型实参：

   ```ts
   const res = (await api.get({ /* … */ cmcontinue })) as ApiQueryResponse;
   ```
