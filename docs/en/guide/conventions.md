---
description: "How field types map to the wire format: Flag reads as true-or-absent, some empty values come back as empty strings, hyphenated and * keys are kept verbatim, query.pages is an array, and string unions are open or closed."
---

# Field conventions

The declarations mirror what the server actually sends, so a field's type already tells you how to read the value. These are the conventions that recur across modules; each field's JSDoc carries the specifics.

## Flags: `true` or absent

A [`Flag`](/api/core/Flag) field is `true` when set; when it is not set the key is omitted entirely — it never comes back as `false`. Both a truthiness check and an `in` check are correct:

```ts
const edit = res.edit;
if (edit.new) {
  // page created by this edit
}
"nochange" in edit; // membership check works the same way
```

Fields typed plain `boolean` are the opposite — they genuinely return `false` (e.g. `move.redirectcreated`, the flags echoed by `action=block`). Which regime a field uses is visible in its type.

## Empty string in place of omission

Some modules return `''` when there is no value instead of dropping the key:

- `prop=info`'s `notificationtimestamp` is `''` until the requesting user has visited the page (`Timestamp | ""`);
- `action=move`'s `reason` is `''` when no summary was supplied;
- `list=allusers`' `registration` is `''` for accounts created before registration timestamps were tracked.

Others use `null` (`list=users`' `registration`) or omit the key altogether. The union in the field's type names its sentinel — don't assume one convention across modules.

## Keys are verbatim

Keys keep the server's spelling exactly, hyphens included, and are read with bracket access:

```ts
upload["duplicate-archive"];
general["git-hash"]; // meta=siteinfo
```

Legacy XML-style content keys are modeled the same way, as `"*"`: Echo's rendered notification body and MassMessage's invalid targets both arrive under `*`.

## `query.pages` is an array

Under `formatversion=2` the pages container is a plain array of page objects — not the pageid-keyed map of fv1. Iterate it directly; `Object.values(res.query.pages ?? [])` compiles but is a leftover fv1 habit. Generator requests that impose their own order record it in each page's `index` field.

## Empty maps and empty lists

A field the server emits as a map serializes as `{}` when empty; a list serializes as `[]`. The everyday example is the log details: on `delete/delete` rows, `params` is present but `{}` — see [Query responses](/guide/query.html). Where the empty shape can occur, it is part of the field's union.

## Numbers occasionally arrive as strings

Raw metadata is the recurring case: the `metadata` field on an imageinfo row — returned when the request includes `iiprop=metadata` — is an array of entries whose `name` / `value` are unions: names can be numeric (positional entries of list-shaped fields) and values can be numbers, booleans, or strings like `"num/den"`. These unions are per-field facts taken from real responses — trust the hover, not a package-wide rule.

The `pages[0]` object of a live response (values verbatim from `www.mediawiki.org`):

```jsonc
{
  "ns": 6,
  "title": "File:09808957674.png",
  "imageinfo": [
    {
      "metadata": [
        { "name": "frameCount", "value": 0 },                 // numeric value
        { "name": "colorType", "value": "truecolour-alpha" }, // string value
        // ...
        {
          "name": "metadata",
          // array value; entries may nest further
          "value": [
            { "name": "XResolution", "value": "2835/100" },   // a "num/den" string
            { "name": "ResolutionUnit", "value": 3 },
            // ...
            {
              "name": "PNGFileComment",
              "value": [
                { "name": "x-default", "value": "Created with GIMP" },
                { "name": "_type", "value": "lang" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Open and closed unions

String unions come in two deliberate kinds:

- **Closed**: the value set is hardcoded in MediaWiki's emitting code with no hook to change it (e.g. `prop=info`'s `pagelanguagedir`). The type lists exactly those values and rejects everything else.
- **Open**: the value set depends on a registry, hook, or site configuration (e.g. `ContentModel`). Known values are listed for autocomplete, and `(string & {})` keeps any site-specific value assignable.

Content models are open, because a site can register handlers through `$wgContentHandlers`: `ContentModel` accepts any string while offering the known ones on autocomplete. Open unions that ship a promotion interface — `ContentModelExtension` for content models — let you merge your site's own values in, so they read as first-class members instead of anonymous strings. The member shape differs from a field-group augmentation: a map from model name to itself:

```ts
// mw-response.d.ts — the site registers `my-model` through $wgContentHandlers
import type {} from "types-mediawiki-response"; // anchors the module for augmentation

declare module "types-mediawiki-response" {
  interface ContentModelExtension {
    /** The value joins the union; the key is just a label. */
    MyModel: "my-model";
  }
}
```

Afterwards `"my-model"` stands alongside the built-in known values in autocomplete, instead of being silently accepted by `(string & {})`. Where to keep the file and how the merge applies — see [Opt-in extension packs](/guide/ext-packs.html).
