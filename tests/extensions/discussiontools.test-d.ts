/**
 * Type-level assertions for the DiscussionTools opt-in pack, checked against
 * real MediaWiki responses. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiDiscussionToolsComment,
  ApiDiscussionToolsCompareResponse,
  ApiDiscussionToolsFindCommentResponse,
  ApiDiscussionToolsGetSubscriptionsResponse,
  ApiDiscussionToolsPageInfoResponse,
  ApiDiscussionToolsSubscribeResponse,
  ApiDiscussionToolsThankResponse,
} from "../../src/extensions/discussiontools";
import type { ExtraKeys } from "../typeutil";
import type { Timestamp } from "../../src";
import activityFixture from "../fixtures/extensions/discussiontoolspageinfo-activity.json";
import pageInfoFixture from "../fixtures/extensions/discussiontoolspageinfo.json";

// `discussiontoolspageinfo`: a reply tree with nested `replies`, plus the
// per-comment transclusion map keyed by comment id and name (`false` local,
// `true` unknown source, a string the source page title).
export const pageInfoSample = {
  batchcomplete: true,
  discussiontoolspageinfo: {
    threaditemshtml: [
      {
        id: "h-Audit_topic-20260927183200",
        name: "h-Capaudit-20260927183200",
        level: 0,
        headingLevel: 2,
        type: "heading",
        timestamp: "2026-09-27T18:32:00Z",
        author: "Capaudit",
        html: "<h3>…</h3>",
        othercontent: "<p>Section preamble</p>",
        replies: [
          {
            id: "c-Capaudit-20260927183200-Audit_topic",
            level: 1,
            type: "comment",
            author: "Capaudit",
            timestamp: "2026-09-27T18:32:00Z",
            html: "<p>…</p>",
            replies: [{ id: "c-x", level: 2, type: "comment", replies: [] }],
          },
        ],
      },
    ],
    transcludedfrom: {
      "h-Audit_topic-20260927183200": true,
      "c-Capaudit-20260927183200-Audit_topic": false,
      "c-Transcluded-20260927190000-Other_topic": "Talk:Archive",
    },
  },
} satisfies ApiDiscussionToolsPageInfoResponse;

// `findcomment` returns a list of candidates, with `oldid` nullable.
export const findCommentSample = {
  discussiontoolsfindcomment: [
    {
      id: "h-Audit_topic-20260927183200",
      name: "h-Capaudit-20260927183200",
      title: "Talk:Audit probe source",
      oldid: null,
      matchedby: "name",
      couldredirect: true,
      shouldredirect: true,
    },
  ],
} satisfies ApiDiscussionToolsFindCommentResponse;

export const subscriptionsSample = {
  subscriptions: {
    "h-Capaudit-20260927183200": 1,
    "h-Other_topic-20260927190000": 2,
  },
} satisfies ApiDiscussionToolsGetSubscriptionsResponse;

export const subscribeSample = {
  discussiontoolssubscribe: {
    page: "Talk:Audit probe source",
    commentname: "Audit topic",
    subscribe: false,
  },
} satisfies ApiDiscussionToolsSubscribeResponse;

// `discussiontoolsthank` writes a root-level `result` (same shape as
// `action=thank`), not a module-named key.
export const thankSample = {
  result: { success: 1, recipient: "Capaudit" },
} satisfies ApiDiscussionToolsThankResponse;

export const compareSample = {
  discussiontoolscompare: {
    fromrevid: 835,
    fromtitle: "Linter probe",
    torevid: 836,
    totitle: "Linter probe 2",
    removedcomments: [
      {
        id: "c-Capaudit-20260927183200",
        type: "comment",
        level: 1,
        replies: [],
        timestamp: "20260927183200",
        author: "Capaudit",
        headingId: "h-Audit_topic-20260927183200",
        subscribableHeadingId: "h-Audit_topic-20260927183200",
      },
    ],
    addedcomments: [
      {
        id: "c-Capaudit-20260927184000",
        type: "comment",
        level: 1,
        replies: [],
        timestamp: "20260927184000",
        author: "Capaudit",
        headingId: "h-Audit_topic-20260927183200",
        subscribableHeadingId: null,
      },
    ],
  },
} satisfies ApiDiscussionToolsCompareResponse;

// `replies` is recursive, and `name`/`author` only appear at some levels.
expectTypeOf<ApiDiscussionToolsComment>()
  .toHaveProperty("replies")
  .toEqualTypeOf<ApiDiscussionToolsComment[] | undefined>();
expectTypeOf<ApiDiscussionToolsComment>()
  .toHaveProperty("headingLevel")
  .toEqualTypeOf<number | null | undefined>();
// `subscriptions` is keyed by comment name and holds `0`/`1`/`2`, not booleans.
expectTypeOf<ApiDiscussionToolsGetSubscriptionsResponse["subscriptions"]>().toEqualTypeOf<
  Record<string, number>
>();

// --- real fixture (fixtures/extensions/discussiontoolspageinfo.json) ---

// The captured topic carries a nested reply; `transcludedfrom` lists every
// thread id at `false` (all local content).
expectTypeOf(pageInfoFixture.discussiontoolspageinfo.threaditemshtml).toExtend<unknown[]>();
expectTypeOf<
  ExtraKeys<
    NonNullable<(typeof pageInfoFixture.discussiontoolspageinfo.threaditemshtml)[number]>,
    keyof ApiDiscussionToolsComment
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    NonNullable<
      NonNullable<
        (typeof pageInfoFixture.discussiontoolspageinfo.threaditemshtml)[number]
      >["replies"]
    >[number],
    keyof ApiDiscussionToolsComment
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    typeof pageInfoFixture.discussiontoolspageinfo,
    keyof ApiDiscussionToolsPageInfoResponse["discussiontoolspageinfo"]
  >
>().toEqualTypeOf<never>();

// `threaditemsflags=activity` (@1.45/@1.46), captured on 1.46 with comments
// from two authors: headings carry the activity counts and the most recent /
// earliest reply (a comment item without its `replies`).
expectTypeOf<ApiDiscussionToolsComment>()
  .toHaveProperty("commentCount")
  .toEqualTypeOf<number | undefined>();
expectTypeOf<ApiDiscussionToolsComment>()
  .toHaveProperty("authorCount")
  .toEqualTypeOf<number | undefined>();
expectTypeOf<ApiDiscussionToolsComment>()
  .toHaveProperty("latestReplyTimestamp")
  .toEqualTypeOf<Timestamp | null | undefined>();
expectTypeOf<ApiDiscussionToolsComment>()
  .toHaveProperty("latestReply")
  .toEqualTypeOf<ApiDiscussionToolsComment | null | undefined>();
expectTypeOf<
  ExtraKeys<typeof activityFixture, keyof ApiDiscussionToolsPageInfoResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    NonNullable<(typeof activityFixture.discussiontoolspageinfo.threaditemshtml)[number]>,
    keyof ApiDiscussionToolsComment
  >
>().toEqualTypeOf<never>();
