/**
 * Type-level assertions for `list=watchlist` (local MediaWiki 1.43 fixture). See
 * `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiQueryResponse, ApiQueryResult, ApiWatchlistEntry } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import watchlistFixture from "../../fixtures/core/query/watchlist.json";

export const sample = {
  batchcomplete: true,
  query: {
    watchlist: [
      {
        type: "edit",
        ns: 0,
        title: "Foo",
        pageid: 186,
        revid: 300,
        old_revid: 299,
        userid: 3,
        user: "Capadmin",
        temp: false,
        anon: false,
        bot: false,
        new: false,
        minor: false,
        oldlen: 19,
        newlen: 20,
        timestamp: "2026-09-26T04:34:47Z",
        notificationtimestamp: "",
        comment: "",
        parsedcomment: "",
        patrolled: true,
        unpatrolled: false,
        autopatrolled: true,
        expiry: false,
      },
    ],
  },
  continue: { wlcontinue: "20260926043443|263", continue: "-||" },
} satisfies ApiQueryResponse;

// flags are real booleans; `expiry` is `false` when there is no upcoming expiry.
expectTypeOf<ApiWatchlistEntry>().toHaveProperty("minor").toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiWatchlistEntry>()
  .toHaveProperty("expiry")
  .toEqualTypeOf<string | false | undefined>();
// `user` is the numeric user id when only `wlprop=userid` is requested (B/C),
// and `notificationtimestamp` is `""` for a never-notified page.
expectTypeOf<ApiWatchlistEntry>()
  .toHaveProperty("user")
  .toEqualTypeOf<string | number | undefined>();
expectTypeOf<ApiWatchlistEntry>()
  .toHaveProperty("notificationtimestamp")
  .toEqualTypeOf<string | undefined>();

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("watchlist")
  .toEqualTypeOf<ApiWatchlistEntry[] | undefined>();

expectTypeOf<ExtraKeys<typeof watchlistFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof watchlistFixture.query.watchlist)[number], keyof ApiWatchlistEntry>
>().toEqualTypeOf<never>();

// `wlprop=loginfo` also renders the localized action text (`logdisplay`), and
// `wlprop=expiry` yields `false` — not a timestamp — for a permanent watch.
export const logSample = {
  type: "log",
  ns: 0,
  title: "Audit probe protected",
  pageid: 0,
  revid: 0,
  old_revid: 0,
  userid: 15,
  user: "Capaudit",
  temp: false,
  anon: false,
  bot: false,
  new: false,
  minor: false,
  oldlen: 0,
  newlen: 0,
  timestamp: "2026-09-27T17:20:58Z",
  notificationtimestamp: "",
  comment: "audit seed",
  parsedcomment: "audit seed",
  logid: 792,
  logtype: "protect",
  logaction: "modify",
  logparams: {
    description: "\u200e[create=sysop] (indefinite)",
    cascade: false,
    details: [{ type: "create", level: "sysop", expiry: "infinite" }],
  },
  logdisplay: "changed protection settings for",
  tags: [],
  expiry: false,
} satisfies ApiWatchlistEntry;

expectTypeOf<ApiWatchlistEntry>().toHaveProperty("logdisplay").toEqualTypeOf<string | undefined>();

// Hidden/suppressed markers appear only when true (`Flag`); `actionhidden`
// marks log-deleted actions and `suppressed` oversighted ones.
export const hiddenSample = {
  type: "log",
  ns: 0,
  title: "Deleted page",
  actionhidden: true,
  userhidden: true,
  commenthidden: true,
  suppressed: true,
} satisfies ApiWatchlistEntry;

expectTypeOf<ApiWatchlistEntry>().toHaveProperty("actionhidden").toEqualTypeOf<true | undefined>();
expectTypeOf<ApiWatchlistEntry>().toHaveProperty("suppressed").toEqualTypeOf<true | undefined>();
