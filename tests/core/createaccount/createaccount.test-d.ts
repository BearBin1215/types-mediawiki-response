/**
 * Type-level assertions for `action=createaccount` (local MediaWiki 1.43 fv2
 * fixture — an in-band `FAIL`; AuthManager failures are the response object, not
 * a top-level error). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiAuthManagerMessage, ApiCreateAccountResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/createaccount/createaccount.json";

export const failSample = {
  createaccount: {
    status: "FAIL",
    message: "You have not specified a valid username.",
    messagecode: "invaliduser",
    canpreservestate: false,
  },
} satisfies ApiCreateAccountResponse;

// A `PASS` outcome carries the created username instead of an error message.
export const passSample = {
  createaccount: { status: "PASS", username: "NewUser" },
} satisfies ApiCreateAccountResponse;

expectTypeOf<ApiCreateAccountResponse["createaccount"]>()
  .toHaveProperty("canpreservestate")
  .toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiCreateAccountResponse["createaccount"]>()
  .toHaveProperty("message")
  .toEqualTypeOf<ApiAuthManagerMessage | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiCreateAccountResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.createaccount, keyof ApiCreateAccountResponse["createaccount"]>
>().toEqualTypeOf<never>();
