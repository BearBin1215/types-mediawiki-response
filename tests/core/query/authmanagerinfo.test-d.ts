/**
 * Type-level assertions for `meta=authmanagerinfo` (local MediaWiki 1.43 fv2
 * fixture, `amirequestsfor=create`). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiAuthManagerMessage,
  ApiQueryAuthManagerField,
  ApiQueryAuthManagerInfo,
  ApiQueryAuthManagerInfoRequest,
  ApiQueryResponse,
  ApiQueryResult,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/authmanagerinfo.json";
import mergedFixture from "../../fixtures/core/query/authmanagerinfo-merged.json";

export const sample = {
  batchcomplete: true,
  query: {
    authmanagerinfo: {
      canauthenticatenow: true,
      cancreateaccounts: true,
      canlinkaccounts: false,
      preservedusername: "",
      requests: [
        {
          id: "MediaWiki\\Auth\\PasswordAuthenticationRequest",
          metadata: {},
          required: "primary-required",
          provider: "Password-based authentication",
          account: "",
          fields: {
            username: { type: "string", label: "Username", optional: false, sensitive: false },
          },
        },
      ],
    },
  },
} satisfies ApiQueryResponse;

// Capability flags are part of every successful response.
expectTypeOf<ApiQueryAuthManagerInfo>()
  .toHaveProperty("canauthenticatenow")
  .toEqualTypeOf<boolean>();
expectTypeOf<ApiQueryAuthManagerInfo>()
  .toHaveProperty("cancreateaccounts")
  .toEqualTypeOf<boolean>();
expectTypeOf<ApiQueryAuthManagerInfo>().toHaveProperty("canlinkaccounts").toEqualTypeOf<boolean>();

// Message-bearing fields follow `amimessageformat`: string by default,
// `{key, params}` under `raw`, absent under `none` (hence optional).
expectTypeOf<ApiQueryAuthManagerInfoRequest["provider"]>().toEqualTypeOf<
  ApiAuthManagerMessage | undefined
>();
expectTypeOf<ApiQueryAuthManagerField["help"]>().toEqualTypeOf<ApiAuthManagerMessage | undefined>();
expectTypeOf<ApiQueryAuthManagerInfoRequest["metadata"]>().toEqualTypeOf<
  Record<string, unknown> | undefined
>();

// Under `amimessageformat=raw`, the message-bearing fields are `{key, params}` specs.
export const rawFormatSample = {
  query: {
    authmanagerinfo: {
      canauthenticatenow: false,
      cancreateaccounts: true,
      canlinkaccounts: false,
      requests: [
        {
          id: "MediaWiki\\Auth\\PasswordAuthenticationRequest",
          metadata: {},
          required: "optional",
          provider: { key: "authprovider-provider", params: ["Password-based authentication"] },
          account: { key: "authprovider-account", params: [] },
          fields: {
            username: {
              type: "string",
              label: { key: "usercredentials-user", params: [] },
              help: { key: "authmanager-userlogin-help", params: [] },
              optional: false,
              sensitive: false,
            },
          },
        },
      ],
    },
  },
} satisfies ApiQueryResponse;

// `amimergerequestfields=1` moves the field descriptors to a top-level `fields`
// map; the per-request `fields` disappear in that mode.
expectTypeOf<ApiQueryAuthManagerInfo>()
  .toHaveProperty("fields")
  .toEqualTypeOf<Record<string, ApiQueryAuthManagerField> | undefined>();
expectTypeOf<
  ExtraKeys<typeof mergedFixture.query.authmanagerinfo, keyof ApiQueryAuthManagerInfo>
>().toEqualTypeOf<never>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof fixture.query, keyof ApiQueryResult>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.query.authmanagerinfo, keyof ApiQueryAuthManagerInfo>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    NonNullable<ApiQueryAuthManagerInfo["requests"]>[number],
    keyof ApiQueryAuthManagerInfoRequest
  >
>().toEqualTypeOf<never>();
