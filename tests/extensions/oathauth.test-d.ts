/**
 * Type-level assertions for the OATHAuth ext pack (`meta=oath`,
 * `action=oathvalidate`), checked against real local 1.43 fv2 fixtures.
 */
import { expectTypeOf } from "expect-type";
import type { ApiOATHStatus, ApiOATHValidateResponse } from "../../src/extensions/oathauth";
import type { ExtraKeys } from "../typeutil";
import oathFixture from "../fixtures/extensions/oath.json";
import oathvalidateFixture from "../fixtures/extensions/oathvalidate.json";

export const sample = {
  oathvalidate: { enabled: true, valid: true },
} satisfies ApiOATHValidateResponse;

// `enabled` / `valid` are real booleans (fv2, present even when `false`).
expectTypeOf<ApiOATHStatus>().toHaveProperty("enabled").toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiOATHValidateResponse>()
  .toHaveProperty("oathvalidate")
  .toEqualTypeOf<{ enabled?: boolean; valid?: boolean }>();

expectTypeOf<
  ExtraKeys<typeof oathFixture.query.oath, keyof ApiOATHStatus>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof oathvalidateFixture, keyof ApiOATHValidateResponse>
>().toEqualTypeOf<never>();
