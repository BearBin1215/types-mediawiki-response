/**
 * Type-level assertions for `action=compare`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiCompareResponse, ApiCompareResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import compareFixture from "../../fixtures/core/compare/compare.json";

export const sample = {
  compare: {
    fromid: 1,
    fromrevid: 1,
    fromns: 0,
    fromtitle: "MediaWiki",
    fromsize: 1,
    fromuser: "192.0.2.22",
    fromuserid: 0,
    fromcomment: "",
    fromparsedcomment: "",
    toid: 1,
    torevid: 935,
    tons: 0,
    totitle: "MediaWiki",
    tosize: 168,
    touser: "192.0.2.14",
    touserid: 0,
    tocomment: "",
    toparsedcomment: "",
    diffsize: 1007,
    // fv2: diff HTML lives in `body` (fv1 used the `*` key).
    body: "<tr>…</tr>",
  },
} satisfies ApiCompareResponse;

expectTypeOf<ApiCompareResult>().toHaveProperty("body").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiCompareResult>().toHaveProperty("prev").toEqualTypeOf<number | undefined>();
expectTypeOf<ApiCompareResult>().toHaveProperty("next").toEqualTypeOf<number | undefined>();

expectTypeOf(compareFixture.compare).toExtend<Record<string, unknown>>();
expectTypeOf<ExtraKeys<typeof compareFixture, keyof ApiCompareResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof compareFixture.compare, keyof ApiCompareResult>
>().toEqualTypeOf<never>();
