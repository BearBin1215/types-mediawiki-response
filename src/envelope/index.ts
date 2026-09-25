/**
 * Core response envelope types shared by all MediaWiki Action API responses.
 *
 * Note: this package models responses requested with `formatversion=2`
 * unless explicitly documented otherwise.
 *
 * The error/warning shape depends on the request's `errorformat`:
 * - default (`bc`): a single `error` object and a module-keyed `warnings` object;
 * - modern (`plaintext`/`wikitext`/`html`/`raw`/`none`): an `errors` array and a
 *   `warnings` array of message objects, plus a top-level `docref`.
 *
 * @see https://www.mediawiki.org/wiki/API:Errors_and_warnings
 */

/**
 * A single message under a modern `errorformat` (an entry of the `errors` or
 * `warnings` array). Which text-bearing field is present depends on the
 * format: `text` for `plaintext`/`wikitext`, `html` for `html`, `key`/`params`
 * for `raw`.
 */
export interface ApiMessage {
  /** Machine-readable code, e.g. `badvalue`, `unrecognizedparams`. */
  code?: string;

  /** Rendered message (`errorformat=plaintext`/`wikitext`). */
  text?: string;

  /** Parsed message HTML (`errorformat=html`). */
  html?: string;

  /** i18n message key (`errorformat=raw`). */
  key?: string;

  /**
   * i18n message parameters (`errorformat=raw`). A parameter is a scalar or an
   * object spec ({@link ApiMessageParamSpec}); numeric params occur too, and a
   * parameter may itself be a message.
   */
  params?: (string | number | ApiMessageParamSpec)[];

  /** Module the message originated from, e.g. `main`, `query+info`. */
  module?: string;

  /** Extra structured data some messages attach. */
  data?: unknown;
}

/**
 * An i18n message spec nested inside another message's `params`
 * (`errorformat=raw`) when a parameter is itself a message, serialized as
 * `{ message: ApiRawMessage }`. The nested `params` may recursively contain
 * further messages.
 */
export interface ApiRawMessage {
  /** i18n message key of the nested message. */
  key?: string;

  /**
   * Parameters of the nested message, which may themselves be messages,
   * serialized the same way as {@link ApiMessage.params}.
   */
  params?: (string | number | ApiMessageParamSpec)[];
}

/**
 * Object form of a raw-format message parameter. Exactly one spec kind is
 * present at runtime: `message` (a nested message), `plaintext`
 * (pre-escaped text), `num` (a number), or `list` + `type` (a list whose items
 * are parameter specs again).
 */
export interface ApiMessageParamSpec {
  /** The parameter, when it is itself a message. */
  message?: ApiRawMessage;

  /** Pre-escaped parameter text. */
  plaintext?: string;

  /** Numeric parameter. */
  num?: number;

  /** Parameter items, when the parameter is a list. */
  list?: ApiMessageParamSpec[];

  /** Rendering type of the {@link ApiMessageParamSpec.list} items, e.g. `text`. */
  type?: string;
}

/** The `error` object under the default (`bc`) `errorformat`. */
export interface ApiError {
  /** Machine-readable error code, e.g. `badtoken`. */
  code?: string;

  /** Human-readable description provided by the server. */
  info?: string;

  /** Docs link plus deprecation notices; nested in `error` under the `bc` format. */
  docref?: string;

  /** PHP backtrace, when `$wgShowExceptionDetails` is on (non-usage exceptions). */
  trace?: string;

  /**
   * Structured `apiData` attached to the message by the emitting code, merged
   * into this object as top-level keys.
   */
  [key: string]: unknown;
}

/** One `bc`-format warning entry (the value of a module key in `warnings`). */
export interface ApiWarningDetail {
  /** Warning text (`bc` errorformat). */
  warnings?: string;
}

/**
 * Warnings shape, polymorphic on `errorformat`:
 * `bc` → object keyed by module name; modern → array of {@link ApiMessage}.
 */
export type ApiWarnings = Record<string, ApiWarningDetail> | ApiMessage[];

/** Fields that may appear on every API response, successful or not. */
export interface ApiEnvelope {
  /**
   * Present and `true` when all data for the current batch of pages has been
   * returned. Continuation may still be ongoing: the generator runs again for
   * the next batch of pages, and list/meta modules may continue independently.
   * Serialized as a real boolean under `formatversion=2`.
   */
  batchcomplete?: true;

  /**
   * Identifier of the server that handled the request. Present by default on
   * error responses; on successful responses only when explicitly requested.
   */
  servedby?: string;

  /** Current server time (ISO 8601), present when the request set `curtimestamp`. */
  curtimestamp?: string;

  /** Opaque value echoed back from the request's `requestid` parameter. */
  requestid?: string;

  /** Non-fatal warnings; shape depends on `errorformat` (see {@link ApiWarnings}). */
  warnings?: ApiWarnings;

  /** Language of the interface strings in the response (`responselanginfo=1`). */
  uselang?: string;

  /** Language error messages are rendered in (`responselanginfo=1`). */
  errorlang?: string;
}

/** Error response under the default (`bc`) `errorformat`: a single `error` object. */
export interface ApiBcErrorResponse extends ApiEnvelope {
  /** The error that made the request fail. */
  error: ApiError;
}

/** Error response under a modern `errorformat`: an `errors` array plus top-level `docref`. */
export interface ApiModernErrorResponse extends ApiEnvelope {
  /** Every error raised by the request; at least one entry is present. */
  errors: ApiMessage[];

  /** Docs link plus deprecation notices (top-level under modern `errorformat`). */
  docref?: string;

  /** PHP backtrace, when `$wgShowExceptionDetails` is on (non-usage exceptions). */
  trace?: string;
}

/** An API response describing a failed request (either `errorformat` family). */
export type ApiErrorResponse = ApiBcErrorResponse | ApiModernErrorResponse;

/** Discriminated union helper: a response is either successful or an error. */
export type ApiResponseWith<TSuccess> = ApiErrorResponse | (TSuccess & ApiEnvelope);
