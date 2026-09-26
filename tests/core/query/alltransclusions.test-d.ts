/**
 * Type-level assertions for `list=alltransclusions`. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiAllLink, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/query/alltransclusions.json";

export const sample = {
  batchcomplete: true,
  query: {
    alltransclusions: [{ fromid: 917033, ns: 10, title: "Template:Growth/Navbar/ar" }],
  },
  continue: { atcontinue: "1|941967", continue: "-||" },
} satisfies ApiQueryResponse;

expectTypeOf<ApiQueryResult>()
  .toHaveProperty("alltransclusions")
  .toEqualTypeOf<ApiAllLink[] | undefined>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.query.alltransclusions)[number], keyof ApiAllLink>
>().toEqualTypeOf<never>();
