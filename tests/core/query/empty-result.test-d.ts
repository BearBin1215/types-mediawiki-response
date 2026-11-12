/**
 * Type-level assertions for a query that produced no result object. Nothing
 * writes under `query` when the generator matches nothing, when a continuation
 * marks the generator finished, when the only module writes at the root
 * (`list=watchlistraw`), or when no module was requested at all — the envelope
 * then carries `batchcomplete` alone. Hence `query` is optional on
 * `ApiQueryResponse` and required on `ApiQueryResponseWithResult`.
 * Compiled by `pnpm typecheck`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiQueryResponse, ApiQueryResponseWithResult, ApiQueryResult } from "../../../src";
import fixture from "../../fixtures/core/query/generator-empty.json";

export const emptySample = { batchcomplete: true } satisfies ApiQueryResponse;

// A parsed `*=max` limit lands at the root, next to an otherwise empty response.
export const emptyWithLimitSample = {
  batchcomplete: true,
  limits: { links: 500 },
} satisfies ApiQueryResponse;

export const presentSample = {
  batchcomplete: true,
  query: { pages: [{ pageid: 1, ns: 0, title: "Main Page" }] },
} satisfies ApiQueryResponseWithResult;

expectTypeOf<ApiQueryResponse>()
  .toHaveProperty("query")
  .toEqualTypeOf<ApiQueryResult | undefined>();
expectTypeOf<ApiQueryResponseWithResult>().toHaveProperty("query").toEqualTypeOf<ApiQueryResult>();

// The captured response carries `batchcomplete` and no `query` member.
expectTypeOf<keyof typeof fixture>().toEqualTypeOf<"batchcomplete">();
