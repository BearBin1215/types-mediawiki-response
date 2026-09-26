/**
 * Type-level assertions for `meta=tokens`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiQueryResponse, ApiQueryResult, ApiQueryTokens } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import tokensFixture from "../../fixtures/core/query/tokens.json";

// A realistic meta=tokens response (mirrors the fixture) must satisfy the type.
export const sample = {
  batchcomplete: true,
  query: {
    tokens: {
      csrftoken: "+\\",
      watchtoken: "+\\",
      patroltoken: "+\\",
      rollbacktoken: "+\\",
      userrightstoken: "+\\",
    },
  },
} satisfies ApiQueryResponse;

// `meta=tokens` adds a `tokens` object to the query result.
expectTypeOf<ApiQueryTokens>().toHaveProperty("csrftoken").toEqualTypeOf<string | undefined>();

// Widening-tolerant structural check on the real fixture.
expectTypeOf(tokensFixture.query.tokens).toExtend<Record<string, unknown>>();

// No omissions at the query level. The tokens object itself is intentionally
// open (see ApiQueryTokens' `${string}token` index signature), so its keys are
// not subset-checked.
expectTypeOf<ExtraKeys<typeof tokensFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof tokensFixture.query, keyof ApiQueryResult>>().toEqualTypeOf<never>();
