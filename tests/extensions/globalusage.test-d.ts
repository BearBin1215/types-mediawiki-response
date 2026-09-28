/**
 * Type-level assertions for the GlobalUsage ext pack (`prop=globalusage`).
 * The pack exports only the field-group type; consumer-side merge into `ApiPage`
 * is validated by the external harness. Here we check the type vs the fixture.
 */
import { expectTypeOf } from "expect-type";
import type { ApiGlobalUsage } from "../../src/extensions/globalusage";
import type { ExtraKeys } from "../typeutil";
import globalusageFixture from "../fixtures/core/query/globalusage.json";

export const sample = {
  title: "User_talk:Jarkko_Piiroinen",
  wiki: "commons.wikimedia.org",
  url: "https://commons.wikimedia.org/wiki/User_talk:Jarkko_Piiroinen",
  ns: "3",
} satisfies ApiGlobalUsage;

// `title` and `wiki` are written unconditionally; `guprop` only adds ns/url/pageid.
expectTypeOf<ApiGlobalUsage>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiGlobalUsage>().toHaveProperty("wiki").toEqualTypeOf<string>();

expectTypeOf<
  ExtraKeys<
    (typeof globalusageFixture.query.pages)[number]["globalusage"][number],
    keyof ApiGlobalUsage
  >
>().toEqualTypeOf<never>();
