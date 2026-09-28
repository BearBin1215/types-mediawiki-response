/**
 * Type-level assertions for the Wikibase ext pack (client-side modules).
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiEntityUsage,
  ApiEntityUsageMap,
  ApiEntityUsageRow,
  ApiPageTerms,
  ApiWikibaseInfo,
  ApiWikibaseRepoUrl,
} from "../../src/extensions/wikibase";
import type { ExtraKeys } from "../typeutil";
import pagetermsFixture from "../fixtures/core/query/pageterms.json";
import wbentityusageFixture from "../fixtures/core/query/wbentityusage.json";
import wblistFixture from "../fixtures/core/query/wblistentityusage.json";
import wikibaseFixture from "../fixtures/core/query/wikibase.json";

export const terms = {
  label: ["London"],
  description: ["capital of England"],
  alias: ["Big Smoke", "LDN"],
} satisfies ApiPageTerms;
type Terms = (typeof pagetermsFixture.query.pages)[number]["terms"];
expectTypeOf<ExtraKeys<Terms, keyof ApiPageTerms>>().toEqualTypeOf<never>();

// wbentityusage: entity-id → usage map; the usage record carries aspects/url only.
type UsageMap = (typeof wbentityusageFixture.query.pages)[number]["wbentityusage"];
type UsageEntry = UsageMap[keyof UsageMap];
expectTypeOf<ExtraKeys<UsageEntry, keyof ApiEntityUsage>>().toEqualTypeOf<never>();

// wblistentityusage rows land under query.entityusage.
type UsageRow = (typeof wblistFixture.query.entityusage)[number];
expectTypeOf<ExtraKeys<UsageRow, keyof ApiEntityUsageRow>>().toEqualTypeOf<never>();

// meta=wikibase: { repo.url.{base,scriptpath,articlepath}, siteid } — the
// module is client-only and reports no repo-hosting flag.
type Wikibase = typeof wikibaseFixture.query.wikibase;
expectTypeOf<ExtraKeys<Wikibase, keyof ApiWikibaseInfo>>().toEqualTypeOf<never>();
expectTypeOf<ApiWikibaseInfo>().not.toHaveProperty("isRepo");
type RepoUrl = typeof wikibaseFixture.query.wikibase.repo.url;
expectTypeOf<ExtraKeys<RepoUrl, keyof ApiWikibaseRepoUrl>>().toEqualTypeOf<never>();

// Usage rows always carry at least one entity, so the map is a plain record.
expectTypeOf<ApiEntityUsageMap>().toEqualTypeOf<Record<string, ApiEntityUsage>>();
