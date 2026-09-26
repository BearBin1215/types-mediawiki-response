/**
 * Contract test for the fields MediaWiki's writers emit unconditionally on a
 * `list=`/`meta=` row, a `prop=` sub-item, or an `action=` result object.
 *
 * The per-module tests use `satisfies` samples, which cannot prove a field is
 * *required* (an optional field accepts a value just as well). These assertions
 * pin the requiredness itself: each `toEqualTypeOf` fails if the field ever
 * regains `| undefined`.
 *
 * Requiredness was established by the triple-evidence review — the per-version
 * core source writes the key outside any conditional, and 1.39–1.46 responses
 * agree. Rows whose identity is gated by a `*prop` value (alllinks family,
 * categorymembers, pageswithprop, exturlusage, logevents, blocks, users,
 * watchlist, search) are deliberately excluded and stay optional.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiAllCategory,
  ApiAllDeletedRevisions,
  ApiAllImage,
  ApiAllMessage,
  ApiAllPage,
  ApiAllRevisions,
  ApiAllusersEntry,
  ApiBacklink,
  ApiCategory,
  ApiCategoryInfo,
  ApiContributor,
  ApiDeletedRev,
  ApiDeletedRevs,
  ApiDuplicateFile,
  ApiEmbeddedIn,
  ApiExternalLink,
  ApiFileArchiveEntry,
  ApiImageUsage,
  ApiInterwikiLink,
  ApiIwbacklink,
  ApiLangbacklink,
  ApiLangLink,
  ApiPageLink,
  ApiPagePropName,
  ApiPatrolResult,
  ApiPrefixSearchResult,
  ApiProtectedTitle,
  ApiQueryInterwikiTitle,
  ApiQueryPage,
  ApiQueryPageResult,
  ApiRandomPage,
  ApiRecentChange,
  ApiRevision,
  ApiSearchHit,
  ApiStashedFile,
  ApiBlockResult,
  ApiChangeAuthenticationDataResponse,
  ApiChangeContentModelResponse,
  ApiDeleteResult,
  ApiEditResult,
  ApiEmailUserResponse,
  ApiExpandTemplatesCategory,
  ApiFileRevertResponse,
  ApiLoginResponse,
  ApiManageTagsResponse,
  ApiMergeHistoryResponse,
  ApiMoveResult,
  ApiPasswordValidity,
  ApiProtectResult,
  ApiProtectionEntry,
  ApiRemoveAuthenticationDataResponse,
  ApiResetPasswordResponse,
  ApiRollbackResult,
  ApiSetNotificationTimestampEntry,
  ApiSetPageLanguageResponse,
  ApiStashEditResponse,
  ApiTag,
  ApiTagEntry,
  ApiTemplate,
  ApiTrackingCategory,
  ApiUnblockResult,
  ApiUndeleteResult,
  ApiUploadResponse,
  ApiUsedImage,
  ApiUserContrib,
  ApiUserrightsResponse,
  ApiValidatePasswordResponse,
  ApiWatchEntry,
  ApiWatchlistRawEntry,
  ContentModel,
  RecentChangeType,
} from "../../../src";

// list=allpages
expectTypeOf<ApiAllPage>().toHaveProperty("pageid").toEqualTypeOf<number>();
expectTypeOf<ApiAllPage>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiAllPage>().toHaveProperty("title").toEqualTypeOf<string>();

// list=allcategories / list=trackingcategories
expectTypeOf<ApiAllCategory>().toHaveProperty("category").toEqualTypeOf<string>();
expectTypeOf<ApiTrackingCategory>().toHaveProperty("category").toEqualTypeOf<string>();
expectTypeOf<ApiTrackingCategory>().toHaveProperty("catid").toEqualTypeOf<string>();

// list=backlinks / list=embeddedin / list=imageusage
expectTypeOf<ApiBacklink>().toHaveProperty("pageid").toEqualTypeOf<number>();
expectTypeOf<ApiBacklink>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiBacklink>().toHaveProperty("title").toEqualTypeOf<string>();

expectTypeOf<ApiEmbeddedIn>().toHaveProperty("pageid").toEqualTypeOf<number>();
expectTypeOf<ApiEmbeddedIn>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiEmbeddedIn>().toHaveProperty("title").toEqualTypeOf<string>();

expectTypeOf<ApiImageUsage>().toHaveProperty("pageid").toEqualTypeOf<number>();
expectTypeOf<ApiImageUsage>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiImageUsage>().toHaveProperty("title").toEqualTypeOf<string>();

// list=iwbacklinks / list=langbacklinks
expectTypeOf<ApiIwbacklink>().toHaveProperty("pageid").toEqualTypeOf<number>();
expectTypeOf<ApiIwbacklink>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiIwbacklink>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiLangbacklink>().toHaveProperty("pageid").toEqualTypeOf<number>();
expectTypeOf<ApiLangbacklink>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiLangbacklink>().toHaveProperty("title").toEqualTypeOf<string>();

// list=random — the id key is `id`, not `pageid`
expectTypeOf<ApiRandomPage>().toHaveProperty("id").toEqualTypeOf<number>();
expectTypeOf<ApiRandomPage>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiRandomPage>().toHaveProperty("title").toEqualTypeOf<string>();

// list=watchlistraw
expectTypeOf<ApiWatchlistRawEntry>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiWatchlistRawEntry>().toHaveProperty("title").toEqualTypeOf<string>();

// list=pagepropnames
expectTypeOf<ApiPagePropName>().toHaveProperty("propname").toEqualTypeOf<string>();

// list=allusers
expectTypeOf<ApiAllusersEntry>().toHaveProperty("userid").toEqualTypeOf<number>();
expectTypeOf<ApiAllusersEntry>().toHaveProperty("name").toEqualTypeOf<string>();

// list=usercontribs
expectTypeOf<ApiUserContrib>().toHaveProperty("userid").toEqualTypeOf<number>();
expectTypeOf<ApiUserContrib>().toHaveProperty("user").toEqualTypeOf<string>();

// meta=allmessages
expectTypeOf<ApiAllMessage>().toHaveProperty("name").toEqualTypeOf<string>();
expectTypeOf<ApiAllMessage>().toHaveProperty("normalizedname").toEqualTypeOf<string>();

// list=tags
expectTypeOf<ApiTag>().toHaveProperty("name").toEqualTypeOf<string>();

// list=prefixsearch — `pageid` is replaced by `special` on special-page hits
expectTypeOf<ApiPrefixSearchResult>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiPrefixSearchResult>().toHaveProperty("title").toEqualTypeOf<string>();

// list=protectedtitles
expectTypeOf<ApiProtectedTitle>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiProtectedTitle>().toHaveProperty("title").toEqualTypeOf<string>();

// list=querypage
expectTypeOf<ApiQueryPage>().toHaveProperty("name").toEqualTypeOf<string>();
expectTypeOf<ApiQueryPageResult>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiQueryPageResult>().toHaveProperty("title").toEqualTypeOf<string>();

// list=allrevisions / list=alldeletedrevisions
expectTypeOf<ApiAllRevisions>().toHaveProperty("pageid").toEqualTypeOf<number>();
expectTypeOf<ApiAllRevisions>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiAllRevisions>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiAllRevisions>().toHaveProperty("revisions").toEqualTypeOf<ApiRevision[]>();
expectTypeOf<ApiAllDeletedRevisions>().toHaveProperty("pageid").toEqualTypeOf<number>();
expectTypeOf<ApiAllDeletedRevisions>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiAllDeletedRevisions>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiAllDeletedRevisions>().toHaveProperty("revisions").toEqualTypeOf<ApiRevision[]>();

// list=filearchive
expectTypeOf<ApiFileArchiveEntry>().toHaveProperty("id").toEqualTypeOf<number>();
expectTypeOf<ApiFileArchiveEntry>().toHaveProperty("name").toEqualTypeOf<string>();
expectTypeOf<ApiFileArchiveEntry>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiFileArchiveEntry>().toHaveProperty("title").toEqualTypeOf<string>();

// list=allimages
expectTypeOf<ApiAllImage>().toHaveProperty("name").toEqualTypeOf<string>();
expectTypeOf<ApiAllImage>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiAllImage>().toHaveProperty("title").toEqualTypeOf<string>();

// list=mystashedfiles
expectTypeOf<ApiStashedFile>().toHaveProperty("filekey").toEqualTypeOf<string>();
expectTypeOf<ApiStashedFile>()
  .toHaveProperty("status")
  .toEqualTypeOf<"finished" | "chunks" | (string & {})>();

// list=deletedrevs
expectTypeOf<ApiDeletedRev>().toHaveProperty("timestamp").toEqualTypeOf<string>();
expectTypeOf<ApiDeletedRevs>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiDeletedRevs>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiDeletedRevs>().toHaveProperty("revisions").toEqualTypeOf<ApiDeletedRev[]>();

// list=recentchanges — only `type` is unconditional; the rest are `rcprop`-gated
expectTypeOf<ApiRecentChange>().toHaveProperty("type").toEqualTypeOf<RecentChangeType>();

// prop=langlinks / prop=iwlinks — `lang`/`title` and `prefix`/`title` are written
// unconditionally; the `llprop`/`iwprop` values only add `url`/`langname`/`autonym`.
expectTypeOf<ApiLangLink>().toHaveProperty("lang").toEqualTypeOf<string>();
expectTypeOf<ApiLangLink>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiInterwikiLink>().toHaveProperty("prefix").toEqualTypeOf<string>();
expectTypeOf<ApiInterwikiLink>().toHaveProperty("title").toEqualTypeOf<string>();

// prop=categories / links / templates / images — `addTitleInfo` is called before
// any `*prop` value is considered, so `ns`/`title` are always written.
expectTypeOf<ApiCategory>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiCategory>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiPageLink>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiPageLink>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiTemplate>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiTemplate>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiUsedImage>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiUsedImage>().toHaveProperty("title").toEqualTypeOf<string>();

// prop=extlinks — the row is `setContentValue(…, 'url', …)`, written unconditionally.
expectTypeOf<ApiExternalLink>().toHaveProperty("url").toEqualTypeOf<string>();

// prop=categoryinfo — the whole object is written unconditionally (no `*prop`).
expectTypeOf<ApiCategoryInfo>().toHaveProperty("size").toEqualTypeOf<number>();
expectTypeOf<ApiCategoryInfo>().toHaveProperty("pages").toEqualTypeOf<number>();
expectTypeOf<ApiCategoryInfo>().toHaveProperty("files").toEqualTypeOf<number>();
expectTypeOf<ApiCategoryInfo>().toHaveProperty("subcats").toEqualTypeOf<number>();
expectTypeOf<ApiCategoryInfo>().toHaveProperty("hidden").toEqualTypeOf<boolean>();

// prop=contributors — `{ userid, name }` is written per row unconditionally.
expectTypeOf<ApiContributor>().toHaveProperty("userid").toEqualTypeOf<number>();
expectTypeOf<ApiContributor>().toHaveProperty("name").toEqualTypeOf<string>();

// prop=duplicatefiles — `name`/`timestamp`/`shared` are unconditional; `user`
// needs a visible uploader.
expectTypeOf<ApiDuplicateFile>().toHaveProperty("name").toEqualTypeOf<string>();
expectTypeOf<ApiDuplicateFile>().toHaveProperty("timestamp").toEqualTypeOf<string>();
expectTypeOf<ApiDuplicateFile>().toHaveProperty("shared").toEqualTypeOf<boolean>();
expectTypeOf<ApiDuplicateFile>().toHaveProperty("user").toEqualTypeOf<string | undefined>();

// list=search — identity is written before any `srprop` value; the generator
// form merges the same shape into `ApiPage`, hence the separate hit type.
expectTypeOf<ApiSearchHit>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiSearchHit>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiSearchHit>().toHaveProperty("pageid").toEqualTypeOf<number>();

// action=patrol — the result object is `['rcid' => …]` + `addTitleInfo`.
expectTypeOf<ApiPatrolResult>().toHaveProperty("rcid").toEqualTypeOf<number>();
expectTypeOf<ApiPatrolResult>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiPatrolResult>().toHaveProperty("title").toEqualTypeOf<string>();

// query.interwiki — `{ title, iw }` per entry; `url` only with `iwurl=1`.
expectTypeOf<ApiQueryInterwikiTitle>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiQueryInterwikiTitle>().toHaveProperty("iw").toEqualTypeOf<string>();
expectTypeOf<ApiQueryInterwikiTitle>().toHaveProperty("url").toEqualTypeOf<string | undefined>();

// --- action= result objects: the module writes these keys on every non-dying path ---

// A single `result`/`status` sentinel is set before any branch is taken. The
// sentinel is an open union (`'x' | (string & {})`), so pin it with
// `toMatchTypeOf` (exact-match would need the full union spelled out).
expectTypeOf<ApiFileRevertResponse["filerevert"]>()
  .toHaveProperty("result")
  .toMatchTypeOf<string>();
expectTypeOf<ApiEmailUserResponse["emailuser"]>().toHaveProperty("result").toMatchTypeOf<string>();
expectTypeOf<ApiEditResult>().toHaveProperty("result").toMatchTypeOf<string>();
expectTypeOf<ApiResetPasswordResponse["resetpassword"]>()
  .toHaveProperty("status")
  .toEqualTypeOf<"success">();
expectTypeOf<ApiStashEditResponse["stashedit"]>().toHaveProperty("status").toMatchTypeOf<string>();
expectTypeOf<ApiValidatePasswordResponse["validatepassword"]>()
  .toHaveProperty("validity")
  .toEqualTypeOf<ApiPasswordValidity>();
expectTypeOf<ApiLoginResponse["login"]>().toHaveProperty("result").toMatchTypeOf<string>();
expectTypeOf<ApiRemoveAuthenticationDataResponse["removeauthenticationdata"]>()
  .toHaveProperty("status")
  .toMatchTypeOf<string>();
expectTypeOf<ApiChangeAuthenticationDataResponse["changeauthenticationdata"]>()
  .toHaveProperty("status")
  .toMatchTypeOf<string>();

// Whole result objects built from a single array literal.
expectTypeOf<ApiDeleteResult>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiDeleteResult>().toHaveProperty("reason").toEqualTypeOf<string>();
expectTypeOf<ApiUndeleteResult>().toHaveProperty("revisions").toEqualTypeOf<number>();
expectTypeOf<ApiUndeleteResult>().toHaveProperty("fileversions").toEqualTypeOf<number>();
expectTypeOf<ApiChangeContentModelResponse["changecontentmodel"]>()
  .toHaveProperty("contentmodel")
  .toEqualTypeOf<ContentModel>();
expectTypeOf<ApiChangeContentModelResponse["changecontentmodel"]>()
  .toHaveProperty("revid")
  .toEqualTypeOf<number>();
expectTypeOf<ApiMoveResult>().toHaveProperty("reason").toEqualTypeOf<string>();
expectTypeOf<ApiProtectResult>()
  .toHaveProperty("protections")
  .toEqualTypeOf<ApiProtectionEntry[]>();
expectTypeOf<ApiMergeHistoryResponse["mergehistory"]>()
  .toHaveProperty("from")
  .toEqualTypeOf<string>();
expectTypeOf<ApiManageTagsResponse["managetags"]>().toHaveProperty("tag").toEqualTypeOf<string>();
expectTypeOf<ApiSetPageLanguageResponse["setpagelanguage"]>()
  .toHaveProperty("oldlanguage")
  .toEqualTypeOf<string>();
expectTypeOf<ApiUserrightsResponse["userrights"]>()
  .toHaveProperty("removed")
  .toEqualTypeOf<string[]>();
expectTypeOf<ApiRollbackResult>().toHaveProperty("old_revid").toEqualTypeOf<number>();
expectTypeOf<ApiBlockResult>().toHaveProperty("hidename").toEqualTypeOf<boolean>();
expectTypeOf<ApiUnblockResult>().toHaveProperty("reason").toEqualTypeOf<string>();

// Row/sub-object types written per iteration.
expectTypeOf<ApiWatchEntry>().toHaveProperty("title").toEqualTypeOf<string>();
expectTypeOf<ApiTagEntry>().toHaveProperty("status").toMatchTypeOf<string>();
expectTypeOf<ApiSetNotificationTimestampEntry>().toHaveProperty("ns").toEqualTypeOf<number>();
expectTypeOf<ApiExpandTemplatesCategory>().toHaveProperty("sortkey").toEqualTypeOf<string>();
expectTypeOf<ApiUploadResponse["upload"]>().toHaveProperty("result").toMatchTypeOf<string>();
