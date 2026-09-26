/**
 * Type-level assertions for `action=clientlogin`, checked against a local
 * MediaWiki 1.43 fv2 fixture. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiAuthManagerMessage,
  ApiClientLogin,
  ApiClientLoginResponse,
  ApiQueryAuthManagerInfoRequest,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import clientloginFixture from "../../fixtures/core/clientlogin/clientlogin.json";

export const sample = {
  clientlogin: { status: "PASS", username: "Capadmin" },
} satisfies ApiClientLoginResponse;

// Interactive step: `message` renders per `messageformat`; `requests` lists the
// AuthManager requests to continue with.
export const uiSample = {
  clientlogin: {
    status: "UI",
    message: "Enter a password of at least 10 characters.",
    messagecode: "passwordtooshort",
    requests: [
      {
        id: "MediaWiki\\Auth\\PasswordAuthenticationRequest",
        metadata: {},
        required: "required",
        fields: { password: { type: "password", optional: false, sensitive: true } },
      },
    ],
  },
} satisfies ApiClientLoginResponse;

// Open union covering the login-flow states, including future ones.
expectTypeOf<ApiClientLogin>()
  .toHaveProperty("status")
  .toEqualTypeOf<"PASS" | "FAIL" | "UI" | "REDIRECT" | "RESTART" | (string & {}) | undefined>();
expectTypeOf<ApiClientLogin>()
  .toHaveProperty("message")
  .toEqualTypeOf<ApiAuthManagerMessage | undefined>();
expectTypeOf<ApiClientLogin>()
  .toHaveProperty("requests")
  .toEqualTypeOf<ApiQueryAuthManagerInfoRequest[] | undefined>();

expectTypeOf<
  ExtraKeys<typeof clientloginFixture, keyof ApiClientLoginResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof clientloginFixture.clientlogin, keyof ApiClientLogin>
>().toEqualTypeOf<never>();
