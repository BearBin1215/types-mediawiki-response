/**
 * Type-level assertions for the FlaggedRevs opt-in ext pack (`prop=flagged`),
 * checked against a local MediaWiki 1.43 fixture.
 *
 * The pack exports only the field-group type; consumers merge it into `ApiPage`
 * themselves (see the pack's JSDoc). That consumer-side merge is validated by
 * the external harness in `scripts/check-ext-consumer.ts`; here we only assert
 * the field group matches the real response.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiConfiguredPage,
  ApiFlagConfigEntry,
  ApiFlagConfigResponse,
  ApiOldReviewedPage,
  ApiPageFlagged,
  ApiReviewResponse,
  ApiStabilizeResponse,
  ApiUnreviewedPage,
} from "../../src/extensions/flaggedrevs";
import type { ExtraKeys } from "../typeutil";
import flaggedFixture from "../fixtures/core/query/flagged.json";

// A realistic `flagged` object must satisfy the field-group type.
export const sample = {
  stable_revid: 271,
  level: 0,
  level_text: "stable",
} satisfies ApiPageFlagged;

// No omissions: the fixture's `flagged` object carries no unmodeled keys.
type FlaggedFixture = (typeof flaggedFixture.query.pages)[number]["flagged"];
expectTypeOf<ExtraKeys<FlaggedFixture, keyof ApiPageFlagged>>().toEqualTypeOf<never>();

// `list=unreviewedpages` / `list=oldreviewedpages` / `list=configuredpages` take
// no `*prop=`: these row shapes are fixed.
export const unreviewedSample = {
  pageid: 120,
  ns: 0,
  title: "Abuse log probe",
  revid: 196,
} satisfies ApiUnreviewedPage;
export const oldReviewedSample = {
  pageid: 44,
  ns: 0,
  title: "Delete Probe",
  revid: 75,
  stable_revid: 74,
  pending_since: "2026-09-26T12:52:07Z",
  flagged_level: 1,
  flagged_level_text: "stable",
  diff_size: 12,
} satisfies ApiOldReviewedPage;
export const configuredSample = {
  pageid: 44,
  ns: 0,
  title: "Delete Probe",
  last_revid: 75,
  stable_revid: 74,
  stable_is_default: 1,
  autoreview: "sysop",
  expiry: "infinity",
} satisfies ApiConfiguredPage;

// `action=review` / `action=stabilize` / `action=flagconfig`; flagconfig writes
// at the root of the envelope, not under `query`. Stabilize's expiry is echoed
// through `Language::formatExpiry`, so the literal is `infinity`.
export const reviewSample = {
  batchcomplete: true,
  review: { result: "Success" },
} satisfies ApiReviewResponse;
export const stabilizeSample = {
  batchcomplete: true,
  stabilize: {
    title: "Audit probe source",
    default: "stable",
    autoreview: "sysop",
    expiry: "infinity",
  },
} satisfies ApiStabilizeResponse;
export const flagConfigSample = {
  batchcomplete: true,
  flagconfig: [{ name: "quality", levels: 1, tier1: 1 }],
} satisfies ApiFlagConfigResponse;

// The three report rows and the flag-config entry are single array literals,
// so every key in them is required.
expectTypeOf<ApiConfiguredPage>().toHaveProperty("expiry").toEqualTypeOf<string>();
expectTypeOf<ApiConfiguredPage>().toHaveProperty("stable_is_default").toEqualTypeOf<number>();
expectTypeOf<ApiUnreviewedPage>().toHaveProperty("revid").toEqualTypeOf<number>();
expectTypeOf<ApiOldReviewedPage>().toHaveProperty("diff_size").toEqualTypeOf<number>();
expectTypeOf<ApiFlagConfigEntry>().toHaveProperty("tier1").toEqualTypeOf<number>();
expectTypeOf<ApiReviewResponse["review"]>().toHaveProperty("result").toMatchTypeOf<string>();
expectTypeOf<ApiFlagConfigResponse>()
  .toHaveProperty("flagconfig")
  .toEqualTypeOf<ApiFlagConfigEntry[] | undefined>();
// `action=review` answers only `result`; failures surface as API errors.
expectTypeOf<ApiReviewResponse["review"]>().not.toHaveProperty("warnings");
