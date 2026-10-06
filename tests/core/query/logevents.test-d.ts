/**
 * Type-level assertions for `list=logevents`, checked against real fixtures.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 *
 * The `params` samples below pin the wire format of every core log action's
 * structured details (see `logparams.ts` for the full key inventory).
 */
import { expectTypeOf } from "expect-type";
import type { ContentModel } from "../../../src/common";
import type {
  ApiLogEvent,
  ApiLogEventParams,
  ApiQueryResponse,
  ApiQueryResult,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import logeventsFixture from "../../fixtures/core/query/logevents.json";

export const sample = {
  batchcomplete: true,
  query: {
    logevents: [
      {
        logid: 106,
        ns: 0,
        title: "Merge dst 1791258098",
        pageid: 23,
        logpage: 23,
        params: {
          type: "revision",
          ids: [33],
          old: { bitmask: 0, content: false, comment: false, user: false, restricted: false },
          new: { bitmask: 2, content: false, comment: true, user: false, restricted: false },
        },
        type: "delete",
        action: "revision",
        user: "Capadmin",
        userid: 7,
        timestamp: "2026-10-06T03:44:51Z",
        comment: "log probe revdel",
        parsedcomment: "log probe revdel",
        tags: [],
      },
    ],
  },
  continue: { lecontinue: "20261006034331|101", continue: "-||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("logevents")
  .toEqualTypeOf<ApiLogEvent[] | undefined>();
// `params` carries the structured log details of the row's action.
expectTypeOf<ApiLogEvent>().toHaveProperty("params").toEqualTypeOf<ApiLogEventParams | undefined>();

expectTypeOf(logeventsFixture.query.logevents).toExtend<unknown[]>();
expectTypeOf<ExtraKeys<typeof logeventsFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof logeventsFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof logeventsFixture.query.logevents)[number], keyof ApiLogEvent>
>().toEqualTypeOf<never>();

// --- per-action `params` shapes, from the per-action fixtures ---

// block/block: sitewide infinity block (logevents-block.json).
export const blockSitewide = {
  type: "block",
  action: "block",
  params: {
    duration: "infinity",
    flags: ["nocreate", "nousertalk"],
    sitewide: true,
  },
} satisfies Pick<ApiLogEvent, "type" | "action" | "params">;

// block/block: partial block with page restrictions and a finite expiry
// (logevents-block.json).
export const blockPartial = {
  params: {
    duration: "1 week",
    flags: ["noemail"],
    restrictions: { pages: [{ page_ns: 0, page_title: "CM probe 1791258182" }] },
    sitewide: false,
    expiry: "2026-10-13T03:44:28Z",
  },
} satisfies { params: ApiLogEventParams };

// block/reblock: 1.44+ keys blockId / duration-l10n (logevents-reblock.json).
export const reblock = {
  params: {
    duration: "infinity",
    flags: ["nocreate", "noemail", "nousertalk"],
    blockId: 177008,
    sitewide: true,
    "duration-l10n": "infinite",
  },
} satisfies { params: ApiLogEventParams };

// move/move (logevents-move.json).
export const move = {
  params: {
    target_ns: 0,
    target_title: "Protect probe moved 1791258182",
    suppressredirect: false,
  },
} satisfies { params: ApiLogEventParams };

// protect/protect (logevents-protect.json).
export const protect = {
  params: {
    description: "‎[edit=autoconfirmed] (indefinite)",
    cascade: false,
    details: [{ type: "edit", level: "autoconfirmed", expiry: "infinite", cascade: false }],
  },
} satisfies { params: ApiLogEventParams };

// protect/move_prot: the oldtitle pair (logevents-protect.json).
export const moveProt = {
  params: { oldtitle_ns: 0, oldtitle_title: "Protect probe 1791258182" },
} satisfies { params: ApiLogEventParams };

// delete/restore (logevents-delete.json).
export const restore = {
  params: { count: { revisions: 1, files: 0 } },
} satisfies { params: ApiLogEventParams };

// delete/delete: no structured details, an empty object (logevents-delete.json).
export const plainDelete = { params: {} } satisfies { params: ApiLogEventParams };

// merge/merge: raw mergerevid (string here), ISO mergepoint (logevents-merge.json).
export const merge = {
  params: {
    mergerevid: "32",
    dest_ns: 0,
    dest_title: "Merge dst 1791258098",
    mergepoint: "2026-10-06T03:41:40Z",
  },
} satisfies { params: ApiLogEventParams };

// patrol/patrol: previd 0 on a creation, auto always false (logevents-patrol.json).
export const patrol = {
  params: { curid: 42, previd: 0, auto: false },
} satisfies { params: ApiLogEventParams };

// tag/update: raw revid (number) / logid (decimal string) forms (logevents-tag.json).
export const tagUpdate = {
  params: {
    revid: 1,
    logid: "1",
    tagsAdded: ["logprobe-tag"],
    tagsAddedCount: 1,
    tagsRemoved: [],
    tagsRemovedCount: 0,
    initialTags: [],
  },
} satisfies { params: ApiLogEventParams };

// tag/update targeting a revision: the other id is `false` (mediawiki.org rows).
export const tagUpdateRevision = {
  params: {
    revid: 8362370,
    logid: false,
    tagsAdded: [],
    tagsAddedCount: 0,
    tagsRemoved: ["undo"],
    tagsRemovedCount: 1,
    initialTags: ["undo"],
  },
} satisfies { params: ApiLogEventParams };

// managetags/create: tag only, no count (logevents-managetags.json).
export const manageTags = {
  params: { tag: "logprobe-tag" },
} satisfies { params: ApiLogEventParams };

// contentmodel/change (logevents-contentmodel.json).
export const contentModel = {
  params: { oldmodel: "wikitext", newmodel: "json" },
} satisfies { params: ApiLogEventParams };

// rights/rights: parallel groups/metadata arrays, `[]` when empty
// (logevents-rights.json).
export const rights = {
  params: {
    oldgroups: [],
    newgroups: ["bot"],
    oldmetadata: [],
    newmetadata: [{ group: "bot", expiry: "infinity" }],
  },
} satisfies { params: ApiLogEventParams };

// newusers/create2 (refreshed logevents.json).
export const newUsers = {
  params: { userid: 10 },
} satisfies { params: ApiLogEventParams };

// upload/upload: ISO img_timestamp (logevents-upload.json).
export const upload = {
  params: { img_sha1: "79zri6pp4w3d5yoichem9culfhopubn", img_timestamp: "2026-08-15T21:14:20Z" },
} satisfies { params: ApiLogEventParams };

// pagelang/pagelang: `[def]`-suffixed wiki-default language (logevents-pagelang.json).
export const pageLang = {
  params: { oldlanguage: "en[def]", newlanguage: "de" },
} satisfies { params: ApiLogEventParams };

// import/interwiki: count + interwiki title pair (logevents-import.json).
export const importInterwiki = {
  params: { count: 4, interwiki_ns: 0, interwiki_title: "w:en:Module:Params" },
} satisfies { params: ApiLogEventParams };

// --- pinned unions on `params` ---

// Block flags are closed: the six current values plus the legacy row values
// `autoblock` / `angry-autoblock` that old log rows still carry.
expectTypeOf<ApiLogEventParams["flags"]>().toEqualTypeOf<
  | Array<
      | "anononly"
      | "nocreate"
      | "noautoblock"
      | "noemail"
      | "nousertalk"
      | "hiddenname"
      | "autoblock"
      | "angry-autoblock"
    >
  | undefined
>();

// `revid`/`logid` are raw caller values: `false` on rows targeting the other
// kind, decimal strings on legacy rows.
expectTypeOf<ApiLogEventParams["revid"]>().toEqualTypeOf<number | string | false | undefined>();
expectTypeOf<ApiLogEventParams["logid"]>().toEqualTypeOf<number | string | false | undefined>();

// Content models share the open `ContentModel` union.
expectTypeOf<ApiLogEventParams["oldmodel"]>().toEqualTypeOf<ContentModel | undefined>();
expectTypeOf<ApiLogEventParams["newmodel"]>().toEqualTypeOf<ContentModel | undefined>();

// The same visibility flags as `list=recentchanges` (`leprop=user|userid` on a
// restricted log entry); all are `Flag`s.
export const hiddenSample = {
  logid: 792,
  ns: 0,
  title: "Audit probe protected",
  type: "protect",
  action: "modify",
  anon: true,
  temp: true,
  actionhidden: true,
  userhidden: true,
  commenthidden: true,
  suppressed: true,
} satisfies ApiLogEvent;
