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
 * A single i18n message parameter under `errorformat=raw`: a scalar, a bare
 * nested message ({@link ApiRawMessage}, produced when a message sits inside a
 * list), or an object spec ({@link ApiMessageParamSpec}). Plain-text parameters
 * are inlined as scalars, and a numeric parameter may arrive as a bare number
 * or a `{ num }` spec.
 */
export type ApiMessageParam = string | number | ApiRawMessage | ApiMessageParamSpec;

/**
 * A single message under a modern `errorformat` (an entry of the `errors` or
 * `warnings` array). Which text-bearing field is present depends on the
 * format: `text` for `plaintext`/`wikitext`, `html` for `html`, `key`/`params`
 * for `raw`.
 */
export interface ApiMessage {
  /** Machine-readable code, e.g. `badvalue`, `unrecognizedparams`. */
  code: string;

  /** Rendered message (`errorformat=plaintext`/`wikitext`). */
  text?: string;

  /** Parsed message HTML (`errorformat=html`). */
  html?: string;

  /** i18n message key (`errorformat=raw`). */
  key?: string;

  /** i18n message parameters (`errorformat=raw`). */
  params?: ApiMessageParam[];

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
  key: string;

  /**
   * Parameters of the nested message, which may themselves be messages,
   * serialized the same way as {@link ApiMessage.params}.
   */
  params: ApiMessageParam[];
}

/**
 * Object form of a raw-format message parameter. Exactly one spec kind is
 * present at runtime: a nested message
 * (`message`), pre-escaped text (`plaintext`), raw text (`raw`), a number
 * (`num`), a duration in seconds (`duration`/`period`), an expiry (`expiry`),
 * a date/time (`datetime`/`date`/`time`), a user group (`group`), a byte size
 * (`size`), a bit rate (`bitrate`), the deprecated object form (`object`), or a
 * list (`list` + `type`).
 */
export interface ApiMessageParamSpec {
  /** The parameter, when it is itself a message. */
  message?: ApiRawMessage;

  /** Pre-escaped parameter text. */
  plaintext?: string;

  /** Raw parameter text, inserted after formatting. */
  raw?: string;

  /** Numeric parameter. */
  num?: number;

  /** Duration in seconds, rendered in full. */
  duration?: number;

  /** Duration in seconds, rendered abbreviated. */
  period?: number;

  /** Expiry timestamp, or `infinity`. */
  expiry?: string;

  /** Date and time. */
  datetime?: string;

  /** Date. */
  date?: string;

  /** Time. */
  time?: string;

  /** User group name. */
  group?: string;

  /** Size in bytes. */
  size?: number;

  /** Bit rate in bit/s. */
  bitrate?: number;

  /**
   * Object parameter, serialized as the object's string value.
   *
   * @deprecated since MediaWiki 1.43; removed in 1.44.
   */
  object?: string;

  /**
   * Parameter items, when the parameter is a list. Serialized as an array
   * from MediaWiki 1.43 on; earlier versions keep the input array's keys, so
   * a non-contiguous list comes back as an object.
   */
  list?: ApiMessageParam[] | Record<string, ApiMessageParam>;

  /** Rendering type of the {@link ApiMessageParamSpec.list} items. Open union for forward compatibility. */
  type?: "comma" | "semicolon" | "pipe" | "text" | (string & {});
}

/** The `error` object under the default (`bc`) `errorformat`. */
export interface ApiError {
  /** Machine-readable error code, e.g. `badtoken`. */
  code: string;

  /** Human-readable description provided by the server. */
  info: string;

  /** Docs link plus deprecation notices; nested in `error` under the `bc` format. */
  docref?: string;

  /** PHP backtrace, when `$wgShowExceptionDetails` is on (non-usage exceptions). */
  trace?: string;

  /**
   * Structured data attached to the message by the emitting code, merged
   * into this object as top-level keys.
   */
  [key: string]: unknown;
}

/** One `bc`-format warning entry (the value of a module key in `warnings`). */
export interface ApiWarningDetail {
  /** Warning text (`bc` errorformat). */
  warnings: string;
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
