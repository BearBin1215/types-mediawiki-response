/**
 * Type-level assertions for `action=purge` (local MediaWiki 1.43 fv2 fixture).
 * See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiPurgeEntry, ApiPurgeResponse, ApiQueryNormalized } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import purgeFixture from "../../fixtures/core/purge/purge.json";
import purgeNormalizedFixture from "../../fixtures/core/purge/purge-normalized.json";

export const sample = {
  batchcomplete: true,
  purge: [{ ns: 0, title: "Fixture edit target", purged: true }],
} satisfies ApiPurgeResponse;

// Problem entries from the pageSet carry no `purged` flag; `redirects` is a
// root-level list (with `redirects=1`).
export const problemSample = {
  batchcomplete: true,
  purge: [
    { ns: 0, title: "Fixture edit target", purged: true, linkupdate: true },
    { title: "Bad|Title", invalid: true, invalidreason: "…" },
    { pageid: 999, missing: true },
    { ns: 0, title: "Fixture redlink", missing: true, known: true },
  ],
  redirects: [{ from: "Fixture redirect", to: "Fixture edit target" }],
} satisfies ApiPurgeResponse;

// `purge` is a per-title array; `purged` is a Flag. Unnormalized requested
// titles surface the pageSet's root-level `normalized` pairs.
expectTypeOf<ApiPurgeResponse>().toHaveProperty("purge").toEqualTypeOf<ApiPurgeEntry[]>();
expectTypeOf<ApiPurgeEntry>().toHaveProperty("purged").toEqualTypeOf<true | undefined>();
expectTypeOf<ApiPurgeResponse>()
  .toHaveProperty("normalized")
  .toEqualTypeOf<ApiQueryNormalized[] | undefined>();

expectTypeOf<ExtraKeys<typeof purgeFixture, keyof ApiPurgeResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof purgeFixture.purge)[number], keyof ApiPurgeEntry>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof purgeNormalizedFixture, keyof ApiPurgeResponse>
>().toEqualTypeOf<never>();
