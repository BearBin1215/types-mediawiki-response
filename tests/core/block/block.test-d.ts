/**
 * Type-level assertions for `action=block` (local MediaWiki 1.43 fv2 fixture).
 * See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiBlockResponse, ApiBlockResult, Timestamp, WatchlistExpiry } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import blockFixture from "../../fixtures/core/block/block.json";

export const blockSample = {
  block: {
    user: "10.0.0.99",
    userID: 0,
    id: 1,
    expiry: "2026-10-02T19:13:49Z",
    reason: "fixture block",
    anononly: false,
    nocreate: true,
    autoblock: false,
    noemail: false,
    hidename: false,
    allowusertalk: false,
    watchuser: false,
    partial: false,
    pagerestrictions: null,
    namespacerestrictions: null,
    actionrestrictions: ["upload"],
  },
} satisfies ApiBlockResponse;

// A partial block echoes the restricted pages (titles) and namespaces (ids);
// `watchlistexpiry`/`actionrestrictions` are `null` when not applicable.
export const partialBlockSample = {
  block: {
    user: "203.0.113.20",
    userID: 0,
    id: 6,
    expiry: "infinite",
    reason: "partial probe",
    anononly: false,
    nocreate: false,
    autoblock: false,
    noemail: false,
    hidename: false,
    allowusertalk: true,
    watchuser: false,
    watchlistexpiry: null,
    partial: true,
    pagerestrictions: ["Main Page"],
    namespacerestrictions: [0, 2],
    actionrestrictions: null,
    additionalBlocksStatuses: [],
  },
} satisfies ApiBlockResponse;

// fv2 asymmetry: block reports `userID` (capital `D`).
expectTypeOf<ApiBlockResult>().toHaveProperty("userID").toEqualTypeOf<number>();

// Indefinite blocks use the `infinite` sentinel.
expectTypeOf<ApiBlockResult>().toHaveProperty("expiry").toEqualTypeOf<Timestamp | "infinite">();

// Partial-block targets are echoed back; `null` for a sitewide block.
expectTypeOf<ApiBlockResult>().toHaveProperty("pagerestrictions").toEqualTypeOf<string[] | null>();
expectTypeOf<ApiBlockResult>()
  .toHaveProperty("namespacerestrictions")
  .toEqualTypeOf<number[] | null>();

// `actionrestrictions` is `null` when the block restricts no actions.
expectTypeOf<ApiBlockResult>()
  .toHaveProperty("actionrestrictions")
  .toEqualTypeOf<string[] | null | undefined>();

// `watchlistexpiry` is `null` when the page is not actually watched.
expectTypeOf<ApiBlockResult>()
  .toHaveProperty("watchlistexpiry")
  .toEqualTypeOf<WatchlistExpiry | undefined>();

// Extension-supplied extra statuses; `[]` when none is set.
expectTypeOf<ApiBlockResult>()
  .toHaveProperty("additionalBlocksStatuses")
  .toEqualTypeOf<Record<string, unknown> | unknown[] | undefined>();

expectTypeOf<ExtraKeys<typeof blockFixture, keyof ApiBlockResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof blockFixture.block, keyof ApiBlockResult>>().toEqualTypeOf<never>();
