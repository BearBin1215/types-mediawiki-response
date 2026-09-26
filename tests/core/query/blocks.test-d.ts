/**
 * Type-level assertions for `list=blocks`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiBlock,
  ApiBlockRestrictions,
  ApiQueryResponse,
  ApiQueryResult,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import blocksFixture from "../../fixtures/core/query/blocks.json";

export const sample = {
  batchcomplete: true,
  query: {
    blocks: [
      {
        id: 176779,
        user: "~2026-51223-40",
        userid: 18519417,
        by: "Divinations",
        byid: 18009523,
        timestamp: "2026-09-25T18:49:26Z",
        expiry: "2026-12-25T18:49:26Z",
        "duration-l10n": "3 months",
        reason: "Vandalism",
        parsedreason: "Vandalism",
        automatic: false,
        anononly: false,
        nocreate: true,
        autoblock: true,
        noemail: false,
        hidden: false,
        "block-hidden": false,
        allowusertalk: true,
        partial: false,
        restrictions: [],
      },
    ],
  },
  continue: { bkcontinue: "20260925151908|176775", continue: "-||" },
} satisfies ApiQueryResponse;

// Block flags expand to real booleans (present as `false`).
expectTypeOf<ApiBlock>().toHaveProperty("partial").toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiQueryResult>().toHaveProperty("blocks").toEqualTypeOf<ApiBlock[] | undefined>();

// `restrictions` is an empty `[]` for sitewide blocks and the grouped object
// for partial blocks.
expectTypeOf<ApiBlock>()
  .toHaveProperty("restrictions")
  .toEqualTypeOf<ApiBlockRestrictions | unknown[] | undefined>();

expectTypeOf(blocksFixture.query.blocks).toExtend<unknown[]>();
expectTypeOf<ExtraKeys<typeof blocksFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof blocksFixture.query, keyof ApiQueryResult>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof blocksFixture.query.blocks)[number], keyof ApiBlock>
>().toEqualTypeOf<never>();

// `bkprop=range` on a range block adds the hex bounds; `parsedreason` is not
// produced by the 1.43 baseline (it rejects that `bkprop` value outright).
export const rangeSample = {
  id: 42,
  user: "2001:db8::/32",
  userid: 0,
  by: "Admin",
  byid: 1,
  timestamp: "2026-09-27T17:11:05Z",
  expiry: "infinity",
  rangestart: "20010db8000000000000000000000000",
  rangeend: "20010db800000000ffffffffffffffff",
  restrictions: [],
  anononly: false,
  nocreate: false,
  noemail: false,
  hidden: false,
} satisfies ApiBlock;

expectTypeOf<ApiBlock>().toHaveProperty("rangestart").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiBlock>().toHaveProperty("rangeend").toEqualTypeOf<string | undefined>();

// A partial block groups its restriction targets by kind.
export const partialSample = {
  id: 43,
  user: "Example user",
  by: "Admin",
  byid: 1,
  timestamp: "2026-09-27T17:11:05Z",
  expiry: "infinity",
  restrictions: {
    pages: [{ id: 12, ns: 0, title: "Main Page" }],
    namespaces: [2],
  },
  automatic: false,
  anononly: false,
  nocreate: false,
  autoblock: false,
  noemail: false,
  hidden: false,
  allowusertalk: true,
  partial: true,
} satisfies ApiBlock;
