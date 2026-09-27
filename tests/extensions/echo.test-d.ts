/**
 * Type-level assertions for the Echo opt-in ext pack
 * (`meta=notifications` / `meta=unreadnotificationpages` / `meta=echomarkread`
 * / `meta=echomarkseen`), checked against real local 1.43 fv2 responses.
 *
 * The pack exports field-group types; consumers merge them into
 * `ApiQueryResult` themselves (see the pack's JSDoc). Here we assert each field
 * group matches the real response.
 */
import { expectTypeOf } from "expect-type";
import type { ApiQueryResponse } from "../../src";
import type {
  ApiEchoCreateEventResponse,
  ApiEchoNotification,
  ApiEchoNotificationCount,
  ApiEchoNotificationModel,
  ApiEchoNotificationSection,
  ApiEchoTimestamp,
  ApiEchoTitle,
  ApiEchoUnreadSource,
  ApiQueryEchoMarkRead,
  ApiQueryEchoMarkSeen,
  ApiQueryEchoNotifications,
  ApiQueryEchoUnreadPages,
} from "../../src/extensions/echo";
import type { ExtraKeys } from "../typeutil";
import readFixture from "../fixtures/extensions/echomarkread.json";
import seenFixture from "../fixtures/extensions/echomarkseen.json";
import createEventFixture from "../fixtures/extensions/echocreateevent.json";

export const readSample = {
  result: "success",
  alert: { rawcount: 0, count: "0" },
  message: { rawcount: 0, count: "0" },
  rawcount: 0,
  count: "0",
} satisfies ApiQueryEchoMarkRead;

export const seenSample = {
  result: "success",
  timestamp: "2026-09-27T00:52:23Z",
} satisfies ApiQueryEchoMarkSeen;

// counts: `count` is a localized string, `rawcount` numeric; `action=echomarkread`
// iterates every section, so the counts are always present.
expectTypeOf<ApiEchoNotificationCount>().toHaveProperty("count").toEqualTypeOf<string>();
expectTypeOf<ApiEchoNotificationCount>().toHaveProperty("rawcount").toEqualTypeOf<number>();
expectTypeOf<ApiQueryEchoMarkRead>()
  .toHaveProperty("alert")
  .toEqualTypeOf<ApiEchoNotificationCount>();
expectTypeOf<ApiQueryEchoMarkRead>()
  .toHaveProperty("message")
  .toEqualTypeOf<ApiEchoNotificationCount>();
expectTypeOf<ApiQueryEchoMarkRead>().toHaveProperty("rawcount").toEqualTypeOf<number>();
expectTypeOf<ApiQueryEchoMarkSeen>()
  .toHaveProperty("timestamp")
  .toEqualTypeOf<string | undefined>();

type Read = (typeof readFixture.query)["echomarkread"];
type Seen = (typeof seenFixture.query)["echomarkseen"];
expectTypeOf<ExtraKeys<Read, keyof ApiQueryEchoMarkRead>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<NonNullable<Read["alert"]>, keyof ApiEchoNotificationCount>
>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<Seen, keyof ApiQueryEchoMarkSeen>>().toEqualTypeOf<never>();

// `meta=notifications`: `count` is a localized string next to the numeric
// `rawcount`, `continue` is explicitly null when the list is complete, and the
// row shape carries six timestamp forms plus a hyphenated `namespace-key`.
export const notificationsSample = {
  batchcomplete: true,
  query: {
    notifications: {
      list: [
        {
          wiki: "mwfixture",
          id: 10,
          type: "thank-you-edit",
          category: "thank-you-edit",
          section: "message",
          timestamp: {
            utciso8601: "2026-09-27T17:11:05Z",
            utcunix: 1790529065,
            unix: "1790529065",
            utcmw: "20260927171105",
            mw: "20260927171105",
            date: "Today",
          },
          title: {
            full: "Audit probe source",
            namespace: "",
            "namespace-key": 0,
            text: "Audit probe source",
          },
          agent: { id: 15, name: "Capaudit" },
          revid: 822,
          targetpages: [822],
        },
      ],
      continue: null,
      rawcount: 2,
      count: "2",
      seenTime: { alert: "1970-01-01T00:00:01Z", message: "1970-01-01T00:00:01Z" },
    },
  },
} satisfies ApiQueryResponse & { query: { notifications?: ApiQueryEchoNotifications } };

// `meta=unreadnotificationpages` is keyed by wiki id; `source.title` is the
// wiki's display name and `source.url` points at its api.php endpoint.
export const unreadPagesSample = {
  batchcomplete: true,
  query: {
    unreadnotificationpages: {
      mwfixture: {
        source: {
          base: "http://localhost:8080/index.php",
          url: "http://localhost:8080/api.php",
          title: "Fixture wiki",
        },
        pages: [{ title: "Audit probe source", count: 1 }],
        totalCount: 1,
      },
    },
  },
} satisfies ApiQueryResponse & { query: { unreadnotificationpages?: ApiQueryEchoUnreadPages } };

// `count` localized, `rawcount` numeric; `unix` is a string while `utcunix` is a number.
expectTypeOf<ApiQueryEchoNotifications>()
  .toHaveProperty("count")
  .toEqualTypeOf<string | undefined>();
expectTypeOf<ApiQueryEchoNotifications>()
  .toHaveProperty("rawcount")
  .toEqualTypeOf<number | undefined>();
expectTypeOf<ApiEchoTimestamp>().toHaveProperty("unix").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiEchoTimestamp>().toHaveProperty("utcunix").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiEchoTitle>().toHaveProperty("namespace-key").toEqualTypeOf<number | undefined>();
// `*` carries a model object for `notformat=model`, an HTML string otherwise;
// `targetpages` is page ids; `seenTime` is a single timestamp per section but a
// section-keyed map at the top level.
expectTypeOf<ApiEchoNotification>()
  .toHaveProperty("*")
  .toEqualTypeOf<ApiEchoNotificationModel | string | undefined>();
expectTypeOf<ApiEchoNotification>()
  .toHaveProperty("targetpages")
  .toEqualTypeOf<number[] | undefined>();
expectTypeOf<ApiEchoNotificationSection>()
  .toHaveProperty("seenTime")
  .toEqualTypeOf<string | Record<string, string> | undefined>();
// The unread source reports the foreign wiki's api.php URL and display name.
expectTypeOf<ApiEchoUnreadSource>().toHaveProperty("url").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiEchoUnreadSource>().toHaveProperty("title").toEqualTypeOf<string | undefined>();

// --- `action=echocreateevent` (fixtures/extensions/echocreateevent.json) ---

// The module writes a plain `{ result: "success" }` status object.
export const createEventSample = {
  echocreateevent: { result: "success" },
} satisfies ApiEchoCreateEventResponse;
expectTypeOf<ApiEchoCreateEventResponse["echocreateevent"]>()
  .toHaveProperty("result")
  .toEqualTypeOf<"success" | (string & {}) | undefined>();

expectTypeOf<
  ExtraKeys<typeof createEventFixture, keyof ApiEchoCreateEventResponse>
>().toEqualTypeOf<never>();
