/**
 * Type-level assertions for `prop=info` responses. Compiled by `pnpm typecheck`
 * (tests/ is in the tsconfig `include`), so a contradiction between these
 * assertions and the declared types fails the build.
 *
 * Note on fixtures: importing `*.json` via `resolveJsonModule` widens literals
 * (`true`->`boolean`, `"wikitext"`->`string`), so an imported fixture can never
 * be assignable to a precisely-typed response. Precise conformance is therefore
 * asserted with a `satisfies` literal (which preserves literal types); the real
 * fixture is used only for widening-tolerant structural checks (fv2 shape).
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiActionPermission,
  ApiPage,
  ApiPageProtection,
  ApiPreloadedContent,
  ApiQueryResponse,
  ApiQueryResult,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import infoFixture from "../../fixtures/core/query/info.json";
import infoInpropFixture from "../../fixtures/core/query/info-inprop.json";
import infoAuthFixture from "../../fixtures/core/query/info-auth.json";
import infoPreloadFixture from "../../fixtures/core/query/info-preload.json";

// A realistic prop=info response (mirrors fixtures/core/query/info.json) must satisfy
// the declared type. `satisfies` keeps literal precision and flags stray fields.
export const sample = {
  batchcomplete: true,
  query: {
    normalized: [{ fromencoded: false, from: "DoesNotExist_x", to: "DoesNotExist x" }],
    pages: [
      {
        ns: 0,
        title: "DoesNotExist x",
        missing: true,
        contentmodel: "wikitext",
        pagelanguagedir: "ltr",
      },
      {
        pageid: 1,
        ns: 0,
        title: "MediaWiki",
        contentmodel: "wikitext",
        pagelanguage: "en",
        pagelanguagehtmlcode: "en",
        pagelanguagedir: "ltr",
        touched: "2026-09-24T19:59:24Z",
        lastrevid: 6287429,
        length: 250,
      },
    ],
  },
} satisfies ApiQueryResponse;

// `prop=info` contributes these fields to the shared page shape, with these types.
expectTypeOf<ApiPage>().toHaveProperty("contentmodel");
expectTypeOf<ApiPage>().toHaveProperty("lastrevid").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiPage>().toHaveProperty("length").toEqualTypeOf<number | undefined>();
// Framework identity field: optional, since missing pages carry no pageid.
expectTypeOf<ApiPage>().toHaveProperty("pageid").toEqualTypeOf<number | undefined>();

// Widening-tolerant structural check on the real fixture: fv2 returns `pages`
// as an array (fv1 would key it by pageid), so this guards the fetched fixture.
expectTypeOf(infoFixture.query.pages).toExtend<unknown[]>();

// No omissions across the levels this fixture exercises (bounded by fixture
// coverage; pair with the paraminfo enum checklist).
expectTypeOf<ExtraKeys<typeof infoFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof infoFixture.query, keyof ApiQueryResult>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof infoFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();

// --- inprop= extension (fixtures/core/query/info-inprop.json) ---

// A protected page with urls/displaytitle/talkid satisfies the merged shape.
export const inpropSample = {
  batchcomplete: true,
  query: {
    pages: [
      {
        pageid: 1,
        ns: 0,
        title: "MediaWiki",
        contentmodel: "wikitext",
        protection: [{ type: "edit", level: "sysop", expiry: "infinity" }],
        restrictiontypes: ["edit", "move"],
        talkid: 1139045,
        associatedpage: "Talk:MediaWiki",
        fullurl: "https://www.mediawiki.org/wiki/MediaWiki",
        displaytitle: "MediaWiki",
        linkclasses: [],
      },
      { ns: 8, title: "MediaWiki:Vector.js", missing: true, known: true, redirect: true },
    ],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiPage>()
  .toHaveProperty("protection")
  .toEqualTypeOf<ApiPageProtection[] | undefined>();
// `redirect` / `known` appear only when true, so they are `Flag`s.
expectTypeOf<ApiPage>().toHaveProperty("redirect").toEqualTypeOf<true | undefined>();

expectTypeOf<
  ExtraKeys<(typeof infoInpropFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    NonNullable<(typeof infoInpropFixture.query.pages)[number]["protection"]>[number],
    keyof ApiPageProtection
  >
>().toEqualTypeOf<never>();

// --- auth-gated inprops (fixtures/core/query/info-auth.json) ---

// The watched page carries `watched: true`; the unwatched one still reports
// `watched: false` and zeroes (the fixture user has the `unwatchedpages` right,
// so zero counts are shown), so these are plain booleans/numbers, not flags.
export const authSample = {
  batchcomplete: true,
  query: {
    pages: [
      {
        pageid: 1,
        ns: 0,
        title: "Main Page",
        contentmodel: "wikitext",
        new: true,
        watched: false,
        watchers: 0,
        visitingwatchers: 0,
        notificationtimestamp: "",
      },
      {
        pageid: 316,
        ns: 0,
        title: "Fixture edit target 1790421984253",
        watched: true,
        watchers: 1,
        visitingwatchers: 1,
        notificationtimestamp: "2026-09-26T11:26:27Z",
      },
    ],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiPage>().toHaveProperty("watched").toEqualTypeOf<boolean | undefined>();
// `readable` is a real boolean too (and deprecated in 1.43), not a `Flag`.
expectTypeOf<ApiPage>().toHaveProperty("readable").toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiPage>().toHaveProperty("watchers").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiPage>().toHaveProperty("visitingwatchers").toEqualTypeOf<number | undefined>();
// `notificationtimestamp` is `''` until the page has been visited.
expectTypeOf<ApiPage>().toHaveProperty("notificationtimestamp").toEqualTypeOf<string | undefined>();
// `new` appears only for new pages, so it stays a `Flag`.
expectTypeOf<ApiPage>().toHaveProperty("new").toEqualTypeOf<true | undefined>();

expectTypeOf<
  ExtraKeys<(typeof infoAuthFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();

// --- preload / editintro inprops (fixtures/core/query/info-preload.json) ---

// Both only appear for a single, not-yet-existing title, so `missing` is on.
export const preloadSample = {
  batchcomplete: true,
  query: {
    pages: [
      {
        ns: 0,
        title: "Preload target 1790422809652",
        missing: true,
        contentmodel: "wikitext",
        preloadcontent: {
          contentmodel: "wikitext",
          contentformat: "text/x-wiki",
          content: "",
        },
        preloadisdefault: true,
        editintro: { newarticletext: '<div class="mw-newarticletext plainlinks">…</div>' },
      },
    ],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiPage>()
  .toHaveProperty("preloadcontent")
  .toEqualTypeOf<ApiPreloadedContent | undefined>();
expectTypeOf<ApiPage>().toHaveProperty("preloadisdefault").toEqualTypeOf<boolean | undefined>();
// `editintro` is a message-name-keyed map of HTML, not a single string.
expectTypeOf<ApiPage>()
  .toHaveProperty("editintro")
  .toEqualTypeOf<Record<string, string> | undefined>();

expectTypeOf<
  ExtraKeys<(typeof infoPreloadFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    (typeof infoPreloadFixture.query.pages)[number]["preloadcontent"],
    keyof ApiPreloadedContent
  >
>().toEqualTypeOf<never>();

// The cascade flag on a protection entry is spelled **`cascade`** (the key
// `ApiQueryInfo` actually writes); entries inherited through cascading
// protection instead carry `source`, the page whose protection cascades here.
// `intestactions=` adds the permission maps: `boolean` detail gives one boolean
// per action, `full`/`quick` gives the blocking messages, and
// `intestactionsautocreate=1` adds `wouldautocreate`.
export const actionTestSample = {
  batchcomplete: true,
  query: {
    pages: [
      {
        pageid: 517,
        ns: 0,
        title: "Audit probe source",
        protection: [
          { type: "edit", level: "sysop", expiry: "infinity", cascade: true },
          {
            type: "edit",
            level: "sysop",
            expiry: "infinity",
            source: "Audit probe transcluding page",
          },
        ],
        watched: true,
        watchers: 3,
        watchlistexpiry: "2026-10-27T17:11:05Z",
        actions: {
          edit: true,
          move: [{ code: "sitejsprotected", text: "You do not have permission…" }],
        },
        wouldautocreate: { edit: false, move: false },
      },
    ],
  },
} satisfies ApiQueryResponse;

expectTypeOf<ApiPageProtection>().not.toHaveProperty("cascading");
expectTypeOf<ApiPageProtection>().toHaveProperty("cascade").toEqualTypeOf<true | undefined>();
expectTypeOf<ApiPageProtection>().toHaveProperty("source").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiPage>()
  .toHaveProperty("actions")
  .toEqualTypeOf<Record<string, boolean | ApiActionPermission[]> | unknown[] | undefined>();
