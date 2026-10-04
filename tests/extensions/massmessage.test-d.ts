/**
 * Type-level assertions for the MassMessage ext pack (`prop=mmcontent`,
 * `action=massmessage`, `action=editmassmessagelist`), checked against real
 * local 1.43 fv2 fixtures.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiEditMassMessageListResult,
  ApiEditMassMessageListResponse,
  ApiMassMessageInvalidTarget,
  ApiMassMessageResponse,
  ApiMassMessageResult,
  ApiMassMessageTarget,
  ApiMmContent,
} from "../../src/extensions/massmessage";
import type { ExtraKeys } from "../typeutil";
import editmassmessagelistFixture from "../fixtures/extensions/editmassmessagelist.json";
import massmessageFixture from "../fixtures/extensions/massmessage.json";
import mmcontentFixture from "../fixtures/extensions/mmcontent.json";

export const sendSample = {
  massmessage: { result: "success", count: 3 },
} satisfies ApiMassMessageResponse;

export const target = {
  title: "User talk:Oathx",
} satisfies ApiMassMessageTarget;

export const invalidTarget = {
  "*": "User talk:MissingUser@example.org",
  invalidsite: "",
} satisfies ApiMassMessageInvalidTarget;

// A list stored without a description reports `null`; the query module writes
// both keys unconditionally.
expectTypeOf<ApiMmContent>().toHaveProperty("description").toEqualTypeOf<string | null>();
expectTypeOf<ApiMmContent>().toHaveProperty("targets").toEqualTypeOf<string[]>();

// `missing` is the empty-string marker (fv2 quirk), not `true`.
expectTypeOf<ApiMassMessageTarget>().toHaveProperty("missing").toEqualTypeOf<string | undefined>();
// `action=massmessage` and `action=editmassmessagelist` both seed the result
// object with a literal, so `result` is always present.
expectTypeOf<ApiMassMessageResult["result"]>().toEqualTypeOf<"success">();
expectTypeOf<ApiMassMessageResult["count"]>().toEqualTypeOf<number>();
expectTypeOf<ApiEditMassMessageListResult["result"]>().toEqualTypeOf<"Success" | "Done">();
expectTypeOf<
  ExtraKeys<(typeof mmcontentFixture.query.pages)[number]["mmcontent"], keyof ApiMmContent>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof massmessageFixture.massmessage, keyof ApiMassMessageResponse["massmessage"]>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    typeof editmassmessagelistFixture.editmassmessagelist,
    keyof ApiEditMassMessageListResponse["editmassmessagelist"]
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    NonNullable<ApiEditMassMessageListResponse["editmassmessagelist"]["added"]>[number],
    keyof ApiMassMessageTarget
  >
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    NonNullable<ApiEditMassMessageListResponse["editmassmessagelist"]["invalidadd"]>[number],
    keyof ApiMassMessageInvalidTarget
  >
>().toEqualTypeOf<never>();
