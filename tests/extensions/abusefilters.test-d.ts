/**
 * Type-level assertions for the AbuseFilter ext pack (`list=abusefilters`,
 * `list=abuselog`, `action=abusefilterchecksyntax`,
 * `action=abuselogprivatedetails`).
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiAbuseFilter,
  ApiAbuseFilterCheckSyntaxResponse,
  ApiAbuseLogEntry,
  ApiAbuseLogPrivateDetailsResponse,
  AbuseFilterSyntaxStatus,
} from "../../src/extensions/abusefilters";
import type { ExtraKeys } from "../typeutil";
import abusefiltersFixture from "../fixtures/core/query/abusefilters.json";

export const sample = {
  id: 1,
  description: "Test filter",
  enabled: true,
} satisfies ApiAbuseFilter;

// 1.43 emits the status flags as empty strings; `flags` (booleans) is newer.
export const legacyFlagsSample = {
  id: 2,
  private: "",
  protected: "",
  enabled: "",
  deleted: "",
} satisfies ApiAbuseFilter;

// `list=abuselog`: `filter_id`/`revid` degrade to `""` for viewers who may not
// see the details, `filter_id` is `global-<id>` for central filters, and
// `hidden` is a real boolean. Variable values may be arrays or `null`.
export const logSample = {
  id: 685277,
  filter_id: "global-42",
  user: "Example user",
  ns: 2,
  title: "User:Example user",
  action: "edit",
  result: "disallow",
  details: {
    accountname: "Example user",
    summary: null,
    addedLines: ["x"],
  },
  timestamp: "2026-09-27T17:18:13Z",
  hidden: false,
} satisfies ApiAbuseLogEntry;

// `action=abusefilterchecksyntax`: `message` is localized text; parser warnings
// arrive as a list of `{ message, character }` and only when non-empty.
export const checkSyntaxSample = {
  batchcomplete: true,
  abusefilterchecksyntax: {
    status: "error",
    message: "Not allowed to use `…` in the filter",
    character: 12,
    warnings: [{ message: "The pattern matches the empty string", character: 0 }],
  },
} satisfies ApiAbuseFilterCheckSyntaxResponse;

// `action=abuselogprivatedetails` uses hyphenated keys and a nullable IP.
export const privateDetailsSample = {
  batchcomplete: true,
  abuselogprivatedetails: {
    "log-id": 12,
    user: "Example user",
    "filter-id": 3,
    "filter-description": "desc",
    "ip-address": null,
  },
} satisfies ApiAbuseLogPrivateDetailsResponse;

expectTypeOf<ApiAbuseFilter>()
  .toHaveProperty("actions")
  .toEqualTypeOf<string | string[] | undefined>();
expectTypeOf<ApiAbuseLogEntry>().toHaveProperty("revid").toEqualTypeOf<number | "" | undefined>();
expectTypeOf<ApiAbuseLogEntry>().toHaveProperty("hidden").toEqualTypeOf<boolean | undefined>();
expectTypeOf<ApiAbuseLogEntry>()
  .toHaveProperty("details")
  .toEqualTypeOf<Record<string, unknown> | unknown[] | undefined>();
expectTypeOf<ApiAbuseFilterCheckSyntaxResponse["abusefilterchecksyntax"]>()
  .toHaveProperty("status")
  .toEqualTypeOf<AbuseFilterSyntaxStatus | undefined>();
expectTypeOf<ApiAbuseFilterCheckSyntaxResponse["abusefilterchecksyntax"]>()
  .toHaveProperty("warnings")
  .toEqualTypeOf<{ message?: string; character?: number }[] | undefined>();

expectTypeOf<
  ExtraKeys<(typeof abusefiltersFixture.query.abusefilters)[number], keyof ApiAbuseFilter>
>().toEqualTypeOf<never>();
