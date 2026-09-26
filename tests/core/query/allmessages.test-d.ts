/**
 * Type-level assertions for `meta=allmessages`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiAllMessage, ApiQueryResponse, ApiQueryResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import allmessagesFixture from "../../fixtures/core/query/allmessages.json";

export const sample = {
  batchcomplete: true,
  query: {
    allmessages: [
      { name: "pagetitle", normalizedname: "pagetitle", content: "$1 - {{SITENAME}}" },
      { name: "mainpage", normalizedname: "mainpage", content: "MediaWiki", default: "Main Page" },
      { name: "edit", normalizedname: "edit", content: "Edit", customised: true },
      { name: "NoSuchMessage_0a1b2c3d", normalizedname: "noSuchMessage_0a1b2c3d", missing: true },
    ],
  },
} satisfies ApiQueryResponse;

// fv2 exposes the body as `content` (fv1 used the `*` key).
expectTypeOf<ApiAllMessage>().toHaveProperty("content").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiQueryResult>()
  .toHaveProperty("allmessages")
  .toEqualTypeOf<ApiAllMessage[] | undefined>();

// `customised` only appears under `amcustomised=modified`, always as `true`.
expectTypeOf<ApiAllMessage["customised"]>().toEqualTypeOf<true | undefined>();

expectTypeOf(allmessagesFixture.query.allmessages).toExtend<unknown[]>();
expectTypeOf<ExtraKeys<typeof allmessagesFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof allmessagesFixture.query, keyof ApiQueryResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof allmessagesFixture.query.allmessages)[number], keyof ApiAllMessage>
>().toEqualTypeOf<never>();
