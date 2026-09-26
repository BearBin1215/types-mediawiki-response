/**
 * Type-level assertions for the continuation registry `ApiQueryContinue` and
 * the legacy `rawcontinue=1` root keys. A module used as a generator emits its
 * cursor under the `g`-prefixed form of its list-mode name; both forms are
 * named in the registry so their value types stay precise. The sample mirrors
 * a `generator=allpages` response tail. Compiled by `pnpm typecheck`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiQueryContinue, ApiQueryResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import rawContinueFixture from "../../fixtures/core/query/rawcontinue.json";

type Continue = ApiQueryContinue;

// String cursors keep their precise type in both modes.
expectTypeOf<Continue["apcontinue"]>().toEqualTypeOf<string | undefined>();
expectTypeOf<Continue["gapcontinue"]>().toEqualTypeOf<string | undefined>();
expectTypeOf<Continue["gcmcontinue"]>().toEqualTypeOf<string | undefined>();
expectTypeOf<Continue["grvcontinue"]>().toEqualTypeOf<string | undefined>();

// `list=trackingcategories` (1.45+) is generator-capable, so both forms exist.
expectTypeOf<Continue["tccontinue"]>().toEqualTypeOf<string | undefined>();
expectTypeOf<Continue["gtccontinue"]>().toEqualTypeOf<string | undefined>();

// Offset cursors stay numeric in both modes.
expectTypeOf<Continue["sroffset"]>().toEqualTypeOf<number | undefined>();
expectTypeOf<Continue["gsroffset"]>().toEqualTypeOf<number | undefined>();
expectTypeOf<Continue["gpsoffset"]>().toEqualTypeOf<number | undefined>();
expectTypeOf<Continue["gqpoffset"]>().toEqualTypeOf<number | undefined>();

export const sample = {
  continue: {
    continue: "-||",
    gapcontinue: "Example/B",
    grvcontinue: "20260101000000|1",
    gsroffset: 10,
  },
  query: { pages: [] },
} satisfies ApiQueryResponse;

// `rawcontinue=1` replaces `continue`/`batchcomplete` with the legacy root keys,
// which are keyed by module and then by parameter name.
export const rawContinueSample = {
  "query-continue": { recentchanges: { grccontinue: "20260101000000|1" } },
  "query-noncontinue": { recentchanges: { grccontinue: "20260101000000|1" } },
  query: { pages: [] },
} satisfies ApiQueryResponse;

expectTypeOf(rawContinueFixture["query-continue"]).toExtend<
  Record<string, Record<string, string | number>>
>();
expectTypeOf(rawContinueFixture["query-noncontinue"]).toExtend<
  Record<string, Record<string, string | number>>
>();
expectTypeOf<ExtraKeys<typeof rawContinueFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
