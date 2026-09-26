/**
 * Type-level assertions for `action=revisiondelete` (local MediaWiki 1.43
 * fixture). See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiRevisionDeleteItem,
  ApiRevisionDeleteResponse,
  ApiRevisionDeleteResult,
  RevisionDeleteStatus,
} from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import fixture from "../../fixtures/core/revisiondelete/revisiondelete.json";

export const sample = {
  revisiondelete: {
    status: "Success",
    target: "Revdel target",
    items: [
      {
        status: "Success",
        id: 329,
        timestamp: "2026-09-26T04:36:13Z",
        userhidden: true,
        commenthidden: true,
        texthidden: false,
        userid: 3,
        user: "Capadmin",
        comment: "",
      },
    ],
  },
} satisfies ApiRevisionDeleteResponse;

// Per-item hide flags are real booleans on the action result.
expectTypeOf<ApiRevisionDeleteItem>()
  .toHaveProperty("userhidden")
  .toEqualTypeOf<boolean | undefined>();

// The module reports only Success/Fail outcomes; `status`/`target`/`items` and
// the per-item `status`/`id` are written unconditionally.
expectTypeOf<ApiRevisionDeleteResult>()
  .toHaveProperty("status")
  .toEqualTypeOf<RevisionDeleteStatus>();
expectTypeOf<ApiRevisionDeleteResult>().toHaveProperty("target").toEqualTypeOf<string>();
expectTypeOf<ApiRevisionDeleteItem>()
  .toHaveProperty("status")
  .toEqualTypeOf<RevisionDeleteStatus>();
expectTypeOf<ApiRevisionDeleteItem>().toHaveProperty("id").toEqualTypeOf<number>();

expectTypeOf<ExtraKeys<typeof fixture, keyof ApiRevisionDeleteResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof fixture.revisiondelete, keyof ApiRevisionDeleteResult>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof fixture.revisiondelete.items)[number], keyof ApiRevisionDeleteItem>
>().toEqualTypeOf<never>();
