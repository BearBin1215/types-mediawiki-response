/**
 * Shared primitive types used across response modules.
 */

/**
 * MediaWiki boolean-style flags: present as `true` when set, otherwise absent.
 *
 * @see https://www.mediawiki.org/wiki/API:JSON_version_2
 */
export type Flag = true;

/**
 * A MediaWiki timestamp in ISO 8601 format (UTC),
 * e.g. `2024-01-15T08:30:00Z`.
 */
export type Timestamp = string;

/**
 * Expiry of a temporary state: a timestamp, or the literal `infinity` when it
 * does not expire. Block records spell the permanent case `infinite` instead
 * — see {@link BlockExpiry}.
 */
export type Expiry = Timestamp | "infinity";

/**
 * Expiry of a block as an action result reports it: a timestamp, or the
 * literal `infinite` for an indefinite block.
 */
export type BlockExpiry = Timestamp | "infinite";

/**
 * Expiry of a watch: a timestamp, or `null` when the page is not watched or
 * the watch is permanent.
 */
export type WatchlistExpiry = Timestamp | null;

/**
 * A block of plain text (as opposed to HTML), e.g. a TextExtracts excerpt
 * requested with `explaintext`. Kept distinct from HTML-bearing string fields.
 */
export type PlainText = string;

/** Namespace index. Negative indexes are pseudo-namespaces. */
export type NamespaceIndex = number;

/**
 * `success` — or the actual outcome string when an operation did not succeed.
 * **Open union**: `(string & {})` keeps other outcomes forward-compatible.
 */
export type SuccessStatus = "success" | (string & {});

/**
 * `Success` — or the actual result string when an operation did not succeed.
 * **Open union**: `(string & {})` keeps other outcomes forward-compatible.
 */
export type SuccessResult = "Success" | (string & {});

/**
 * A structured in-band message — a serialized MediaWiki `Message`/`FatalError`
 * spec (`{ message, params, code, type }`) nested inside an action result
 * (e.g. password-policy messages, file-backend errors, AuthManager failures).
 * Distinct from `ApiMessage`, which models the `errorformat`-based envelope.
 */
export interface ApiSpecMessage {
  /** i18n message key, e.g. `passwordtooshort`. */
  message?: string;

  /** Parameters substituted into the message (may be numbers). */
  params?: unknown[];

  /** Machine-readable code (usually mirrors `message`). */
  code?: string;

  /** Severity, e.g. `error`. Open union. */
  type?: string;

  /** Pre-rendered HTML, when the server supplies it. */
  html?: string;
}

/**
 * A watchlist label (`{ id, name }`), as returned by `meta=userinfo`
 * `uiprop=watchlistlabels`, `prop=info` `inprop=watchlistlabels`,
 * `list=watchlist` `wlprop=labels`, and echoed by `action=watch`. Requires
 * `$wgEnableWatchlistLabels`. Emitted as a list; an empty set serializes as `[]`.
 *
 * @since MediaWiki 1.46
 */
export interface ApiWatchlistLabel {
  /** Stable numeric label id. */
  id?: number;

  /** Label text. */
  name?: string;
}

/**
 * Content model of a page. **Open union** — known values are autocomplete
 * sugar only; `(string & {})` accepts any model a response may carry.
 *
 * Coverage policy: MediaWiki core models are listed directly; `Scribunto`
 * is included as the one near-universal extension model; extension packs
 * promote their own models by augmenting {@link ContentModelExtension}
 * (e.g. `MassMessageListContent` from the MassMessage pack); consumers may
 * augment the same interface for site-specific models registered through
 * `$wgContentHandlers`.
 */
export type ContentModel =
  | "wikitext"
  | "javascript"
  | "css"
  | "json"
  | "text"
  | "Scribunto"
  | ContentModelExtension[keyof ContentModelExtension]
  | (string & {});

/**
 * Augmentation target for content models beyond MediaWiki core: extension
 * packs and consumers merge members here (each mapping the model name to
 * itself) to promote them to first-class known values of
 * {@link ContentModel}.
 *
 * @example
 * // A site-specific model registered through $wgContentHandlers:
 * declare module "types-mediawiki-response" {
 *   interface ContentModelExtension {
 *     MyModel: "my-model";
 *   }
 * }
 */
export interface ContentModelExtension {}

/**
 * Serialization format of a revision slot, e.g. `text/x-wiki`. **Open union**:
 * known core formats are listed for autocomplete and `(string & {})` keeps the
 * type forward-compatible with extension-provided formats.
 */
export type ContentFormat =
  | "text/x-wiki"
  | "text/plain"
  | "text/javascript"
  | "text/css"
  | "application/json"
  | (string & {});
