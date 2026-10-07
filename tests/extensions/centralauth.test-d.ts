/**
 * Type-level assertions for the CentralAuth ext pack, checked against real
 * 1.43 responses captured on a two-wiki MySQL setup (`mw143g`).
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiCentralAuthInBandErrorResponse,
  ApiCentralAuthTokenResponse,
  ApiCreateLocalAccountResponse,
  ApiDeleteGlobalAccountResponse,
  ApiGlobalCentralUser,
  ApiGlobalGroup,
  ApiGlobalGroupMembership,
  ApiGlobalUserFound,
  ApiGlobalUserInvalidName,
  ApiGlobalUserLocalInfo,
  ApiGlobalUserMissingId,
  ApiGlobalUserMissingName,
  ApiGlobalUserRightsResponse,
  ApiGlobalUserRow,
  ApiSetGlobalAccountStatusFailedResponse,
  ApiSetGlobalAccountStatusResponse,
  ApiWikiSet,
} from "../../src/extensions/centralauth";
import type { ApiSpecMessage, Expiry } from "../../src/common";
import type { ExtraKeys } from "../typeutil";
import centralauthtoken from "../fixtures/extensions/centralauthtoken.json";
import createlocalaccount from "../fixtures/extensions/createlocalaccount.json";
import createlocalaccountError from "../fixtures/extensions/createlocalaccount-error.json";
import deleteglobalaccount from "../fixtures/extensions/deleteglobalaccount.json";
import globalallusers from "../fixtures/extensions/globalallusers.json";
import globalgroups from "../fixtures/extensions/globalgroups.json";
import globaluserrightsAdd from "../fixtures/extensions/globaluserrights-add.json";
import globaluserrightsRemove from "../fixtures/extensions/globaluserrights-remove.json";
import setglobalaccountstatusLock from "../fixtures/extensions/setglobalaccountstatus-lock.json";
import setglobalaccountstatusNoreason from "../fixtures/extensions/setglobalaccountstatus-noreason.json";
import wikisets from "../fixtures/extensions/wikisets.json";

// --- list rows ---------------------------------------------------------------

// `existslocally` / `locked` are valueless flags; `groups` is `aguprop=groups`.
export const globalUserSample = {
  id: 1,
  name: "Gblink",
  groups: ["global-fixture"],
  existslocally: "",
} satisfies ApiGlobalCentralUser;

// A global account with no groups and no local attachment (no `existslocally`).
export const globalUserDetachedSample = {
  id: 4,
  name: "Gnolocal",
  groups: [],
} satisfies ApiGlobalCentralUser;

export const globalGroupSample = {
  name: "global-fixture",
  rights: ["apihighlimits", "global-fixture-right"],
} satisfies ApiGlobalGroup;

// `id` is a database int: a string up to 1.45, a number from 1.46; the 1.43
// capture below shows the string form.
export const wikiSetSample = {
  id: "1",
  name: "fixture-wikiset",
  type: "optin",
  wikisincluded: ["wiki143"],
  wikisnotincluded: [],
} satisfies ApiWikiSet;

expectTypeOf<ApiGlobalCentralUser>().toHaveProperty("id").toEqualTypeOf<number>();
expectTypeOf<ApiGlobalCentralUser>().toHaveProperty("name").toEqualTypeOf<string>();
expectTypeOf<ApiWikiSet>().toHaveProperty("id").toEqualTypeOf<string | number>();

expectTypeOf<
  ExtraKeys<(typeof globalallusers.query.globalallusers)[number], keyof ApiGlobalCentralUser>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof globalgroups.query.globalgroups)[number], keyof ApiGlobalGroup>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof wikisets.query.wikisets)[number], keyof ApiWikiSet>
>().toEqualTypeOf<never>();

// --- read actions ------------------------------------------------------------

export const centralAuthTokenSample = {
  centralauthtoken: { centralauthtoken: "a6987fbddab26e3d4cbb67f31edaf27d2" },
} satisfies ApiCentralAuthTokenResponse;

// --- write actions -----------------------------------------------------------

export const globalUserRightsSample = {
  globaluserrights: { user: "Gblink", userid: 1, added: ["global-fixture"], removed: [] },
} satisfies ApiGlobalUserRightsResponse;

export const globalUserRightsRemoveSample = {
  globaluserrights: { user: "Gblink", userid: 1, added: [], removed: ["global-fixture"] },
} satisfies ApiGlobalUserRightsResponse;

// `reason` is echoed as `null` when the call omitted it (1.43 probe).
export const setGlobalAccountStatusSample = {
  setglobalaccountstatus: {
    user: "Gblink",
    locked: true,
    hidden: "",
    reason: "fixture lock",
  },
} satisfies ApiSetGlobalAccountStatusResponse;

export const setGlobalAccountStatusNoReasonSample = {
  setglobalaccountstatus: { user: "Gblink", locked: false, hidden: "", reason: null },
} satisfies ApiSetGlobalAccountStatusResponse;

export const deleteGlobalAccountSample = {
  deleteglobalaccount: { user: "Gdel2", reason: "fixture delete" },
} satisfies ApiDeleteGlobalAccountResponse;

export const createLocalAccountSample = {
  createlocalaccount: { username: "Gfresh3", reason: "fixture create local" },
} satisfies ApiCreateLocalAccountResponse;

expectTypeOf<ApiSetGlobalAccountStatusResponse["setglobalaccountstatus"]["reason"]>().toExtend<
  string | null
>();
expectTypeOf<
  ApiSetGlobalAccountStatusResponse["setglobalaccountstatus"]["locked"]
>().toEqualTypeOf<boolean>();
expectTypeOf<ApiSetGlobalAccountStatusResponse["setglobalaccountstatus"]["hidden"]>().toEqualTypeOf<
  "" | "lists" | "suppressed"
>();

// Success models the full result with `reason` and carries no in-band `error`;
// the failure response keeps the unchanged state but drops `reason` and reports
// in-band (no fixture: the split shape is fixed by the source control flow).
expectTypeOf<ApiSetGlobalAccountStatusResponse>().not.toHaveProperty("error");
expectTypeOf<
  ApiSetGlobalAccountStatusFailedResponse["setglobalaccountstatus"]
>().not.toHaveProperty("reason");
expectTypeOf<ApiSetGlobalAccountStatusFailedResponse["error"]>().toEqualTypeOf<
  ApiSpecMessage[][]
>();

// A failed `action=createlocalaccount` reports in band under the root `error`
// key as a list of per-status lists — not a standard ApiErrorResponse. (For
// `deleteglobalaccount`, the "no such user" case dies normally; the in-band
// shape is reserved for Status failures.)
export const inBandErrorSample = {
  error: [
    [
      {
        message: "centralauth-createlocal-no-global-account",
        params: [],
        code: "centralauth-createlocal-no-global-account",
        type: "error",
      },
    ],
  ],
} satisfies ApiCentralAuthInBandErrorResponse;

expectTypeOf<
  ExtraKeys<
    (typeof createlocalaccountError)["error"][number][number],
    keyof ApiCentralAuthInBandErrorResponse["error"][number][number]
  >
>().toEqualTypeOf<never>();
expectTypeOf<(typeof globaluserrightsAdd)["globaluserrights"]["userid"]>().toEqualTypeOf<number>();
expectTypeOf<(typeof globaluserrightsRemove)["globaluserrights"]["removed"]>().toExtend<string[]>();
expectTypeOf<
  (typeof setglobalaccountstatusLock)["setglobalaccountstatus"]["locked"]
>().toEqualTypeOf<boolean>();
expectTypeOf<
  (typeof setglobalaccountstatusNoreason)["setglobalaccountstatus"]["reason"]
>().toBeNull();
expectTypeOf<
  (typeof centralauthtoken)["centralauthtoken"]["centralauthtoken"]
>().toEqualTypeOf<string>();
expectTypeOf<
  (typeof createlocalaccount)["createlocalaccount"]["username"]
>().toEqualTypeOf<string>();
expectTypeOf<(typeof deleteglobalaccount)["deleteglobalaccount"]["user"]>().toEqualTypeOf<string>();

// --- list=globalusers (1.47 capture from meta.wikimedia.org) -------------------

import globalusersFixture from "../fixtures/extensions/globalusers.json";
import globalusersCentralidsFixture from "../fixtures/extensions/globalusers-centralids.json";
import globalusersInvalidFixture from "../fixtures/extensions/globalusers-invalid.json";

// Found row with every gusprop requested. `locked` is a real boolean; the
// hidden/suppressed markers are only observable to suppress rights holders.
export const globalUserFoundSample = {
  centralid: 1,
  name: "Tim Starling",
  locked: false,
  editcount: 14479,
  registration: "2008-03-13T04:16:56Z",
  localinfo: { attached: true, localid: 434, timestamp: "2008-03-13T04:16:56Z" },
  groups: [],
  groupmemberships: [{ group: "steward", expiry: "infinity" }],
  rights: [],
} satisfies ApiGlobalUserFound;

// Detached account: `localinfo` without localid/timestamp.
export const globalUserDetachedLocalSample = {
  centralid: 37323504,
  name: "Juju",
  locked: false,
  editcount: 41,
  registration: "2015-03-17T04:40:37Z",
  localinfo: { attached: false },
  groups: [],
  groupmemberships: [],
  rights: [],
} satisfies ApiGlobalUserFound;

// Marker rows for unknown names/ids and invalid names.
export const globalUserMissingNameSample = {
  name: "Nosuchglobaluser 0a1b2c3d",
  missing: true,
} satisfies ApiGlobalUserRow;
export const globalUserMissingIdSample = {
  centralid: 999999999,
  missing: true,
} satisfies ApiGlobalUserRow;
export const globalUserInvalidSample = {
  name: "Ajraddatz<x",
  invalid: true,
} satisfies ApiGlobalUserRow;

expectTypeOf<ApiGlobalUserFound>().toHaveProperty("centralid").toEqualTypeOf<number>();
expectTypeOf<ApiGlobalUserFound>()
  .toHaveProperty("localinfo")
  .toEqualTypeOf<ApiGlobalUserLocalInfo | undefined>();
expectTypeOf<ApiGlobalGroupMembership>().toHaveProperty("expiry").toEqualTypeOf<Expiry>();
expectTypeOf<ApiGlobalUserFound>().toHaveProperty("hidden").toEqualTypeOf<true | undefined>();

// `keyof` over the union would only yield the common keys, so the ExtraKeys
// denominator is the union of every row member's keys.
type GlobalUserRowKeys =
  | keyof ApiGlobalUserFound
  | keyof ApiGlobalUserMissingName
  | keyof ApiGlobalUserInvalidName
  | keyof ApiGlobalUserMissingId;

expectTypeOf<
  ExtraKeys<(typeof globalusersFixture.query.globalusers)[number], GlobalUserRowKeys>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof globalusersCentralidsFixture.query.globalusers)[number], GlobalUserRowKeys>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof globalusersInvalidFixture.query.globalusers)[number], GlobalUserRowKeys>
>().toEqualTypeOf<never>();
