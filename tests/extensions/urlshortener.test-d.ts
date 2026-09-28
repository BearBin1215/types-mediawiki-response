/**
 * Type-level assertions for the UrlShortener ext pack (`action=shortenurl`),
 * checked against a real local 1.43 fv2 fixture.
 */
import { expectTypeOf } from "expect-type";
import type { ApiShortenUrlResponse } from "../../src/extensions/urlshortener";
import type { ExtraKeys } from "../typeutil";
import shortenurlFixture from "../fixtures/extensions/shortenurl.json";

export const sample = {
  shortenurl: {
    shorturl: "http://localhost:8080/index.php/Special:UrlRedirector/3",
    shorturlalt: "http://localhost:8080/index.php/Special:UrlRedirector/_z",
  },
} satisfies ApiShortenUrlResponse;

// The alternate short URL is only present when the module reports it.
expectTypeOf<ApiShortenUrlResponse["shortenurl"]>()
  .toHaveProperty("shorturlalt")
  .toEqualTypeOf<string | undefined>();

// `qrcode` is SVG markup, reported only when QR codes are enabled and requested.
expectTypeOf<ApiShortenUrlResponse["shortenurl"]>()
  .toHaveProperty("qrcode")
  .toEqualTypeOf<string | undefined>();

expectTypeOf<
  ExtraKeys<typeof shortenurlFixture, keyof ApiShortenUrlResponse>
>().toEqualTypeOf<never>();
