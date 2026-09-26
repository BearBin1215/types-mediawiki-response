/**
 * Type-level assertions for `prop=extlinks`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiExternalLink, ApiPage, ApiQueryResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import extlinksFixture from "../../fixtures/core/query/extlinks.json";

export const sample = {
  query: {
    pages: [
      {
        pageid: 114093,
        ns: 0,
        title: "Professional development and consulting",
        extlinks: [{ url: "https://wiki-valley.com/" }],
      },
    ],
  },
  continue: { elcontinue: "2064842", continue: "||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiPage>().toHaveProperty("extlinks").toEqualTypeOf<ApiExternalLink[] | undefined>();

expectTypeOf<ExtraKeys<typeof extlinksFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof extlinksFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof extlinksFixture.query.pages)[number]["extlinks"][number], keyof ApiExternalLink>
>().toEqualTypeOf<never>();
