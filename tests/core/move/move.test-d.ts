/**
 * Type-level assertions for `action=move`, checked against real fixtures
 * captured from a local MediaWiki 1.43 LTS. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiMoveResponse, ApiMoveResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import noredirectFixture from "../../fixtures/core/move/noredirect.json";
import redirectFixture from "../../fixtures/core/move/redirect.json";
import subpagesFixture from "../../fixtures/core/move/subpages.json";
import subpagesErrorsFixture from "../../fixtures/core/move/subpages-errors.json";

// Basic move.
export const basicSample = {
  move: {
    from: "MF",
    to: "MT",
    reason: "fixture move",
    redirectcreated: false,
    moveoverredirect: false,
  },
} satisfies ApiMoveResponse;

// movetalk adds talkfrom/talkto/talkmoveoverredirect.
export const talkSample = {
  move: {
    from: "MF2",
    to: "MT2",
    reason: "fixture move with redirect",
    redirectcreated: true,
    moveoverredirect: false,
    talkfrom: "Talk:MF2",
    talkto: "Talk:MT2",
    talkmoveoverredirect: false,
  },
} satisfies ApiMoveResponse;

// movesubpages: `subpages` is polymorphic (array when moved, object when errored).
export const subpagesArraySample = {
  move: {
    from: "User:Mfs",
    to: "User:Mtd",
    reason: "",
    redirectcreated: true,
    moveoverredirect: false,
    subpages: [{ from: "User:Mfs/Sub", to: "User:Mtd/Sub" }],
  },
} satisfies ApiMoveResponse;
// Mixed subpage outcomes: per-item failures appear as `{ from, errors }`;
// `reason` is present even when empty.
export const subpagesMixedSample = {
  move: {
    from: "MF3",
    to: "MT3",
    reason: "",
    redirectcreated: true,
    moveoverredirect: false,
    subpages: [
      { from: "User:Mf3/Sub", to: "User:Mt3/Sub" },
      {
        from: "User:Mf3/Sub2",
        errors: [{ message: "protectedpage", code: "protectedpage", type: "error" }],
      },
    ],
  },
} satisfies ApiMoveResponse;
export const subpagesErrorSample = {
  move: {
    from: "MF3",
    to: "MT3",
    reason: "",
    redirectcreated: true,
    moveoverredirect: false,
    subpages: {
      errors: [
        {
          message: "namespace-nosubpages",
          params: [""],
          code: "namespace-nosubpages",
          type: "error",
        },
      ],
    },
  },
} satisfies ApiMoveResponse;

// A modern `errorformat` renders the in-band subpage errors as `ApiMessage`s.
export const subpagesErrorModernSample = {
  move: {
    from: "MF3",
    to: "MT3",
    reason: "",
    redirectcreated: true,
    moveoverredirect: false,
    subpages: { errors: [{ code: "namespace-nosubpages", text: "…" }] },
  },
} satisfies ApiMoveResponse;

// `redirectcreated` / `moveoverredirect` are real booleans (present as `false`).
expectTypeOf<ApiMoveResult>().toHaveProperty("redirectcreated").toEqualTypeOf<boolean>();
expectTypeOf<ApiMoveResult>().toHaveProperty("moveoverredirect").toEqualTypeOf<boolean>();
// A successful move carries no `result` key.
expectTypeOf<ApiMoveResult>().not.toHaveProperty("result");

for (const fx of [noredirectFixture, redirectFixture, subpagesFixture, subpagesErrorsFixture]) {
  expectTypeOf<ExtraKeys<typeof fx, keyof ApiMoveResponse>>().toEqualTypeOf<never>();
  expectTypeOf<ExtraKeys<(typeof fx)["move"], keyof ApiMoveResult>>().toEqualTypeOf<never>();
}
