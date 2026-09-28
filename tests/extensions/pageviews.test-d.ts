/**
 * Type-level assertions for the PageViewInfo ext pack
 * (`prop=pageviews`, `meta=siteviews`, `list=mostviewed`).
 */
import { expectTypeOf } from "expect-type";
import type { ApiMostViewedPage, ApiViewCounts } from "../../src/extensions/pageviews";
import type { ExtraKeys } from "../typeutil";
import mostviewedFixture from "../fixtures/core/query/mostviewed.json";
import pageviewsFixture from "../fixtures/core/query/pageviews.json";
import siteviewsFixture from "../fixtures/core/query/siteviews.json";

// `list=mostviewed` rows carry exactly ns/title/count, all written unconditionally.
export const sample = { ns: 0, title: "Main Page", count: 6768204 } satisfies ApiMostViewedPage;
expectTypeOf<ApiMostViewedPage>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiMostViewedPage>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiMostViewedPage>().toHaveProperty("count").toEqualTypeOf<number>();
expectTypeOf<
  ExtraKeys<(typeof mostviewedFixture.query.mostviewed)[number], keyof ApiMostViewedPage>
>().toEqualTypeOf<never>();

// The date-keyed maps are open records of `number | null`; samples are assignable.
type Pageviews = (typeof pageviewsFixture.query.pages)[number]["pageviews"];
type Siteviews = typeof siteviewsFixture.query.siteviews;
expectTypeOf<Pageviews>().toMatchTypeOf<ApiViewCounts>();
expectTypeOf<Siteviews>().toMatchTypeOf<ApiViewCounts>();
