/**
 * Type-level assertions for the Babel ext pack (`meta=babel`).
 */
import { expectTypeOf } from "expect-type";
import type { ApiBabelResult } from "../../src/extensions/babel";
import babelFixture from "../fixtures/core/query/babel.json";

// Site-configured map (open keys): a fixture's `code → level` shape is assignable
// to the open record, and the levels are strings.
export const sample = {
  cmn: "N",
  en: "1",
  "zh-Hans-CN": "N",
} satisfies ApiBabelResult;

expectTypeOf<(typeof babelFixture.query)["babel"]>().toMatchTypeOf<ApiBabelResult>();
