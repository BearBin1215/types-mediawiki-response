---
description: "字段类型如何对应线格式：Flag 出现即 true、否则整键缺省，无值可能回空串，连字符与 * 键逐字保留，query.pages 是数组，字符串联合分开放与封闭两种。"
---

# 字段约定

类型声明贴近服务端实际发送的线格式，因此字段的类型本身就在提示该怎么读这个值。以下是各模块反复出现的约定；单个字段的具体语义以其 JSDoc 为准。

## Flag：出现即 `true`，否则整键缺省

[`Flag`](/api/core/Flag) 字段置位时以 `true` 出现；未置位时整个键缺省，不会返回 `false`。通过真值判断或者 `in` 判断都可以：

```ts
const edit = res.edit;
if (edit.new) {
  // 本次编辑创建了页面
}
"nochange" in edit; // 成员判断同样成立
```

类型是普通 `boolean` 的字段则可能返回 `false` 值（如 `move.redirectcreated`、`action=block` 回显的各项标记），判定字段时看类型选择使用对应口径即可。

## 无值可能回空串而非缺省

有些模块没有值时回 `''`，而不是省略整键：

- `prop=info` 的 `notificationtimestamp`：请求者从未访问过该页时是 `''`（类型 `Timestamp | ""`）；
- `action=move` 的 `reason`：没填摘要时是 `''`；
- `list=allusers` 的 `registration`：早于注册时间戳记录的账号是 `''`。

另一些字段用 `null`（如 `list=users` 的 `registration`）或整键缺省。字段所用的哨兵值会在其类型并集里写明，不要跨模块假设同一口径。

## 键名逐字保留

键名与服务端拼写逐字一致，连字符原样保留，用方括号读取：

```ts
upload["duplicate-archive"];
general["git-hash"]; // meta=siteinfo
```

遗留 XML 风格的内容键同理，逐字建模为 `"*"`，Echo 渲染后的通知正文、MassMessage 的无效目标都挂在 `*` 键下。

## `query.pages` 是数组

fv2 下 pages 容器是页面对象的普通数组，不是 fv1 那种按 pageid 键控的 map，直接遍历即可。`Object.values(res.query.pages ?? [])` 能通过编译，但那是 fv1 习惯的残留。某些会自定义排序的 generator 请求会把序号写进每页的 `index` 字段。

## 空容器：`{}` 与 `[]`

服务端标为 map 的字段，空的时候序列化成 `{}`，列表则序列化成 `[]`。最常见的例子是日志明细：`delete/delete` 日志行的 `params` 存在但为 `{}`，见 [query 响应](/guide/query.html)。可能出现空形状的字段，其类型并集里会列出该形状。

## 数字偶尔以字符串到达

原始元数据是高发区：imageinfo 行的 `metadata` 字段明细行内的 `name` / `value` 是并集——`name` 可能是数字（列表形字段的位置序号），`value` 可能是数字、布尔，或 `"num/den"` 这类字符串，以 IDE 悬浮提示为准。

真实响应中 `pages[0]` 的内容（值逐字取自 `www.mediawiki.org`）：

```jsonc
{
  "ns": 6,
  "title": "File:09808957674.png",
  "imageinfo": [
    {
      "metadata": [
        { "name": "frameCount", "value": 0 }, // value 是数字
        { "name": "colorType", "value": "truecolour-alpha" }, // value 是字符串
        // ...
        {
          "name": "metadata",
          // value 是数组，条目可能再嵌套
          "value": [
            { "name": "XResolution", "value": "2835/100" }, // "num/den" 形式的字符串
            { "name": "ResolutionUnit", "value": 3 },
            // ...
            {
              "name": "PNGFileComment",
              "value": [
                { "name": "x-default", "value": "Created with GIMP" },
                { "name": "_type", "value": "lang" },
              ],
            },
          ],
        },
      ],
    },
  ],
}
```

## 开放与封闭联合

字符串联合有意分成两类：

- **封闭**：值集由 MediaWiki 发射代码硬编码、无钩子可改（例如 `prop=info` 的 `pagelanguagedir`）。类型只列真实值，其余一律拒绝。
- **开放**：值集取决于注册表、钩子或站点配置（例如 `ContentModel`）。已知值列出供自动补全，`(string & {})` 保证站点自定义值仍可赋入。

内容模型是开放的：站点可通过 `$wgContentHandlers` 注册自定义 handler，因此 `ContentModel` 接受任意字符串，同时把已知值放进自动补全。带提成接口的开放联合（内容模型对应 `ContentModelExtension`）可以把站点自己的值增广进去，使其成为一等成员而非匿名字符串。增广的成员形状与字段组不同，是「模型名 → 自身」的键值对：

```ts
// mw-response.d.ts —— 站点通过 $wgContentHandlers 注册了 `my-model`
import type {} from "types-mediawiki-response"; // 锚定模块以供增广

declare module "types-mediawiki-response" {
  interface ContentModelExtension {
    /** 值是进入联合的成员，键名仅作标识。 */
    MyModel: "my-model";
  }
}
```

增广后 `"my-model"` 与内建已知值同权：参与自动补全，而不再只是被 `(string & {})` 默默接受。增广文件的摆放与生效范围见[按需启用的扩展包](/guide/ext-packs.html)。
