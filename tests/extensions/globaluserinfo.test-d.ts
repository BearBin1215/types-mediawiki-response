/**
 * Type-level assertions for the CentralAuth ext pack (`meta=globaluserinfo`).
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiGlobalUserInfo,
  ApiGlobalUserUnattached,
} from "../../src/extensions/globaluserinfo";
import type { ExtraKeys } from "../typeutil";
import globaluserinfoFixture from "../fixtures/core/query/globaluserinfo.json";

export const sample = {
  id: 1,
  name: "Tim Starling",
  home: "metawiki",
  editcount: 100,
} satisfies ApiGlobalUserInfo;

// Unattached accounts are per-wiki account objects, not bare wiki-id strings.
export const unattachedSample = {
  wiki: "enwiki",
  editcount: 10,
  registration: "2005-06-08T00:00:00Z",
  groups: ["sysop"],
  blocked: { expiry: "infinity", reason: "vandalism" },
} satisfies ApiGlobalUserUnattached;

expectTypeOf<ApiGlobalUserInfo>()
  .toHaveProperty("unattached")
  .toEqualTypeOf<ApiGlobalUserUnattached[] | undefined>();

expectTypeOf<
  ExtraKeys<typeof globaluserinfoFixture.query.globaluserinfo, keyof ApiGlobalUserInfo>
>().toEqualTypeOf<never>();
