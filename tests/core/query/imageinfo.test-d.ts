/**
 * Type-level assertions for `prop=imageinfo`, checked against a real fixture.
 * Compiled by `pnpm typecheck`. See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiImageInfo, ApiPage, ApiQueryResponse } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import imageinfoFixture from "../../fixtures/core/query/imageinfo.json";
import exifFixture from "../../fixtures/core/query/imageinfo-exif.json";

export const sample = {
  batchcomplete: true,
  query: {
    pages: [
      {
        pageid: 455229,
        ns: 6,
        title: "File:Example.png",
        imagerepository: "local",
        imageinfo: [
          {
            timestamp: "2015-06-23T17:22:28Z",
            user: "Physikerwelt",
            userid: 922875,
            size: 20649,
            width: 640,
            height: 430,
            parsedcomment: "",
            comment: "",
            canonicaltitle: "File:Example.png",
            url: "https://upload.example/Example.png",
            descriptionurl: "https://www.mediawiki.org/wiki/File:Example.png",
            descriptionshorturl: "https://www.mediawiki.org/w/index.php?curid=455229",
            sha1: "7742be684725e3c08539aaac58725bbe0814aeda",
            metadata: [{ name: "width", value: 640 }],
            extmetadata: {
              DateTime: { value: "2015-06-23 17:22:28", source: "mediawiki-metadata", hidden: "" },
            },
            mime: "image/png",
            mediatype: "BITMAP",
            bitdepth: 8,
          },
        ],
      },
    ],
  },
} satisfies ApiQueryResponse;

// `prop=imageinfo` adds per-page `imageinfo[]` (+ framework `imagerepository`).
expectTypeOf<ApiPage>().toHaveProperty("imageinfo").toEqualTypeOf<ApiImageInfo[] | undefined>();

expectTypeOf(imageinfoFixture.query.pages).toExtend<unknown[]>();
expectTypeOf<ExtraKeys<typeof imageinfoFixture, keyof ApiQueryResponse>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof imageinfoFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<(typeof imageinfoFixture.query.pages)[number]["imageinfo"][number], keyof ApiImageInfo>
>().toEqualTypeOf<never>();

// Conditional `iiprop` results, observed on a local 1.43 wiki:
// `badfile` sits on the **page**, beside `imageinfo`; `uploadwarning` writes its
// HTML into `html` (`""` when there is nothing to warn about); a file row whose
// blob is gone gets `filemissing`.
export const conditionalSample = {
  batchcomplete: true,
  query: {
    pages: [
      {
        ns: 6,
        title: "File:NoSuchFile audit.png",
        missing: true,
        imagerepository: "",
        badfile: false,
        imageinfo: [
          {
            html: "",
            canonicaltitle: "File:NoSuchFile audit.png",
            filemissing: true,
            commonmetadata: [],
            thumbmime: "image/png",
            duration: 12.5,
            pagecount: 3,
            archivename: "Archive-Old-file.png",
            userhidden: true,
            commenthidden: true,
            filehidden: true,
            anon: true,
            temp: true,
            suppressed: true,
          },
        ],
      },
    ],
  },
} satisfies ApiQueryResponse;

// `thumberror` is rendered text, not a flag.
expectTypeOf<ApiImageInfo>().toHaveProperty("thumberror").toEqualTypeOf<string | undefined>();
expectTypeOf<ApiPage>().toHaveProperty("badfile").toEqualTypeOf<boolean | undefined>();

// --- real EXIF-bearing image (fixtures/core/query/imageinfo-exif.json) ---

// An upload with a real IFD0 EXIF block: the tag set lands in `metadata` and
// `commonmetadata` (EXIF RATIONALs as "num/den" strings), while `extmetadata`
// stays limited to the DateTime/ObjectName pair this MediaWiki version maps.
// `ApiImageMetadataItem.value` already covers the scalar kinds (string/number).
export const exifSample = {
  batchcomplete: true,
  query: {
    pages: [
      {
        pageid: 1,
        ns: 6,
        title: "File:Gap exif.jpg",
        imagerepository: "local",
        imageinfo: [
          {
            timestamp: "2024-01-15T12:00:00Z",
            user: "Capadmin",
            userid: 3,
            size: 1274,
            width: 64,
            height: 48,
            canonicaltitle: "File:Gap exif.jpg",
            url: "https://www.mediawiki.org/wiki/Special:FilePath/Gap_exif.jpg",
            descriptionurl: "https://www.mediawiki.org/wiki/File:Gap_exif.jpg",
            sha1: "b2bbe763c7e1828c750d53f78550709a6fea19be",
            metadata: [
              { name: "Make", value: "FixtureCam" },
              { name: "XResolution", value: "72/1" },
              { name: "MEDIAWIKI_EXIF_VERSION", value: 1 },
            ],
            commonmetadata: [{ name: "Make", value: "FixtureCam" }],
            extmetadata: {
              DateTime: { value: "2024-01-15T12:00:00Z", source: "mediawiki-metadata", hidden: "" },
              ObjectName: { value: "Gap_exif", source: "mediawiki-metadata" },
            },
            mime: "image/jpeg",
            mediatype: "BITMAP",
            bitdepth: 8,
          },
        ],
      },
    ],
  },
} satisfies ApiQueryResponse;

expectTypeOf(exifFixture.query.pages[0]!.imageinfo).toExtend<unknown[]>();
expectTypeOf<
  ExtraKeys<(typeof exifFixture.query.pages)[number], keyof ApiPage>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    NonNullable<(typeof exifFixture.query.pages)[number]["imageinfo"]>[number],
    keyof ApiImageInfo
  >
>().toEqualTypeOf<never>();
