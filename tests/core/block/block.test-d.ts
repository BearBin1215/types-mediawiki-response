/**
 * Type-level assertions for `action=block` (local MediaWiki 1.43 fv2 fixture).
 * See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiBlockResponse, ApiBlockResult, Timestamp } from "../../../src";
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

// fv2 asymmetry: block reports `userID` (capital `D`).
expectTypeOf<ApiBlockResult>().toHaveProperty("userID").toEqualTypeOf<number>();

// Indefinite blocks use the `infinite` sentinel.
expectTypeOf<ApiBlockResult>().toHaveProperty("expiry").toEqualTypeOf<Timestamp | "infinite">();

expectTypeOf<ExtraKeys<typeof blockFixture, keyof ApiBlockResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof blockFixture.block, keyof ApiBlockResult>>().toEqualTypeOf<never>();
