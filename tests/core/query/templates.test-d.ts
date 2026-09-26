/**
 * Type-level assertions for `prop=templates`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `query/info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiPage, ApiQueryResponse, ApiQueryResult, ApiTemplate } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import templatesFixture from "../../fixtures/core/query/templates.json";

export const sample = {
  continue: { tlcontinue: "6411|10|Hubs", continue: "||" },
  query: {
    pages: [
      {
        pageid: 6411,
        ns: 100,
        title: "Manual:Contents",
        templates: [{ ns: 10, title: "Template:Dir" }],
      },
    ],
  },
} satisfies ApiQueryResponse;

// `prop=templates` adds a `templates` array to pages.
expectTypeOf<ApiPage>().toHaveProperty("templates").toEqualTypeOf<ApiTemplate[] | undefined>();

// No omissions at each level the fixture exercises.
expectTypeOf<ExtraKeys<typeof templatesFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof templatesFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
type TemplatesPage = (typeof templatesFixture.query.pages)[number];
expectTypeOf<ExtraKeys<TemplatesPage, keyof ApiPage>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<TemplatesPage["templates"][number], keyof ApiTemplate>
>().toEqualTypeOf<never>();
