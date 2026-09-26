/**
 * Type-level assertions for `QueryPage<K>` — the per-prop scoped page view.
 * Compiled by `pnpm typecheck`.
 */
import { expectTypeOf } from "expect-type";
import type { ApiRevision, QueryPage } from "../../../src";

// A page scoped to `prop=revisions`: identity fields + revisions only.
type RevPage = QueryPage<"revisions">;

// Requested prop and identity fields are present, with their real types.
expectTypeOf<RevPage>().toHaveProperty("revisions").toEqualTypeOf<ApiRevision[] | undefined>();
expectTypeOf<RevPage>().toHaveProperty("title").toEqualTypeOf<string | undefined>();

// The generator-injected rank is not a prop, so it rides along in every projection.
expectTypeOf<RevPage>().toHaveProperty("index").toEqualTypeOf<number | undefined>();

// A prop that was not selected is absent from the scoped view (reading it errors).
expectTypeOf<"revisions" extends keyof RevPage ? true : false>().toEqualTypeOf<true>();
expectTypeOf<"categories" extends keyof RevPage ? true : false>().toEqualTypeOf<false>();

// Multiple props can be combined.
type RevCatPage = QueryPage<"revisions" | "categories">;
expectTypeOf<"categories" extends keyof RevCatPage ? true : false>().toEqualTypeOf<true>();
