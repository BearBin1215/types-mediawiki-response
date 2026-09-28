/**
 * Type-level assertions for the GlobalBlocking ext pack (`list=globalblocks`),
 * checked against real 1.39/1.40/1.41/1.43 responses.
 */
import { expectTypeOf } from "expect-type";
import type { ApiGlobalBlock } from "../../src/extensions/globalblocks";
import type { ExtraKeys } from "../typeutil";
import globalblocks139 from "../fixtures/core/query/globalblocks-139.json";
import globalblocks140 from "../fixtures/core/query/globalblocks-140.json";
import globalblocks141 from "../fixtures/core/query/globalblocks-141.json";
import globalblocksFixture from "../fixtures/core/query/globalblocks.json";

export const sample = {
  id: "1",
  target: "1.2.3.4",
  by: "Admin",
  anononly: false,
} satisfies ApiGlobalBlock;

// `bgprop=address` (the deprecated spelling) emits the target under `address`
// on every covered version — 1.39–1.41 as the only target key, 1.43 as the
// alias next to `bgprop=target`.
export const addressSample = {
  id: "1",
  address: "10.255.1.2",
  by: "Admin",
} satisfies ApiGlobalBlock;

expectTypeOf<ApiGlobalBlock>().toHaveProperty("address").toEqualTypeOf<string | undefined>();

expectTypeOf<
  ExtraKeys<(typeof globalblocksFixture.query.globalblocks)[number], keyof ApiGlobalBlock>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof globalblocks139.query.globalblocks)[number], keyof ApiGlobalBlock>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof globalblocks140.query.globalblocks)[number], keyof ApiGlobalBlock>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof globalblocks141.query.globalblocks)[number], keyof ApiGlobalBlock>
>().toEqualTypeOf<never>();
