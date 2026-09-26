/**
 * Type-level assertions for `action=protect` (local MediaWiki 1.43 fixture).
 * See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiProtectResponse, ApiProtectResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/protect/protect.json";
import cascadeFixture from "../../fixtures/core/protect/protect-cascade.json";

export const sample = {
  protect: {
    title: "Protect target",
    reason: "fixture protect",
    protections: [
      { edit: "sysop", expiry: "2026-10-03T04:34:46Z" },
      { move: "sysop", expiry: "infinite" },
    ],
  },
} satisfies ApiProtectResponse;

// A protection entry maps restriction type -> level plus an `expiry`.
expectTypeOf<ApiProtectResult>().toHaveProperty("protections");

// `cascade=1` adds a flag next to `protections`.
expectTypeOf<ApiProtectResult>().toHaveProperty("cascade").toEqualTypeOf<true | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiProtectResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof fixture.protect, keyof ApiProtectResult>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof cascadeFixture, keyof ApiProtectResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof cascadeFixture.protect, keyof ApiProtectResult>
>().toEqualTypeOf<never>();
