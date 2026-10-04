/**
 * `action=managetags` response — defines/removes change tags; needs CSRF. As
 * written in 1.43 core, every operation (including non-delete ones) requires
 * the `deletechangetags` right, and operations other than `delete` additionally
 * require `managechangetags`. The result echoes the operation under
 * `managetags`.
 *
 * @see https://www.mediawiki.org/wiki/API:Managetags
 */
import type { ApiSpecMessage } from "../common";
import type { ApiEnvelope, ApiMessage } from "../envelope";

/** `action=managetags` operation, echoed from the request. */
export type ApiManageTagsOperation = "activate" | "create" | "deactivate" | "delete";

/** Response of `action=managetags`. */
export interface ApiManageTagsResponse extends ApiEnvelope {
  /** Result of `action=managetags`. */
  managetags: {
    /** The operation that was performed. */
    operation: ApiManageTagsOperation;

    /** Tag name acted on. */
    tag: string;

    /** Whether the operation succeeded. */
    success: boolean;

    /** Log entry id recorded for the operation. */
    logid?: number;

    /** Non-fatal messages (e.g. a deprecation notice), shaped per the request's `errorformat`. */
    warnings?: ApiSpecMessage[] | ApiMessage[];
  };
}
