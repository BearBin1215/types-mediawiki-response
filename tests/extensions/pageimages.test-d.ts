/**
 * Type-level assertions for the PageImages ext pack (`prop=pageimages`).
 */
import { expectTypeOf } from "expect-type";
import type { ApiThumbnail } from "../../src/extensions/pageimages";
import type { ExtraKeys } from "../typeutil";
import pageimagesFixture from "../fixtures/core/query/pageimages.json";

export const sample = {
  source: "https://example/120px.jpg",
  width: 120,
  height: 80,
} satisfies ApiThumbnail;

expectTypeOf<
  ExtraKeys<(typeof pageimagesFixture.query.pages)[number]["thumbnail"], keyof ApiThumbnail>
>().toEqualTypeOf<never>();
