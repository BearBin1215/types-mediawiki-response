/**
 * Opt-in extension pack: **UrlShortener** (`action=shortenurl`).
 *
 * A standalone action response — import and use it directly (no declaration
 * merging needed):
 *
 * ```ts
 * import type { ApiShortenUrlResponse } from 'types-mediawiki-response/ext/urlshortener';
 * ```
 *
 * Requires the `urlshortener-create-url` right (granted to all users by
 * default) and that the target URL matches `$wgUrlShortenerAllowedDomains`;
 * disallowed domains are top-level `ApiErrorResponse`s. The short URL template
 * follows `$wgUrlShortenerTemplate` / `$wgUrlShortenerServer`. On wikis with
 * QR codes enabled, `qrcode=1` returns the code as SVG markup in `qrcode`, and
 * the short URL keys are then omitted unless the URL was long enough to need
 * shortening.
 *
 * @see https://www.mediawiki.org/wiki/Extension:UrlShortener
 */
import type { ApiEnvelope } from "../envelope";

/** The `shortenurl` object of an `action=shortenurl` response. */
export interface ApiShortenUrlResult {
  /** Full short URL carrying the base-32 short code. */
  shorturl?: string;

  /**
   * Alternative short URL using the alternate code mapping (a string whose
   * characters are individually base-32-shifted), kept valid in parallel.
   */
  shorturlalt?: string;

  /**
   * SVG markup of a QR code encoding the target URL, when `qrcode=1` was passed
   * and the wiki has QR codes enabled.
   *
   * @since MediaWiki 1.41
   */
  qrcode?: string;
}

/** Response of `action=shortenurl`. */
export interface ApiShortenUrlResponse extends ApiEnvelope {
  /** Result of `action=shortenurl`. */
  shortenurl: ApiShortenUrlResult;
}
