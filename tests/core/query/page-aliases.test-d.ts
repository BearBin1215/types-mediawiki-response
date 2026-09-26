/**
 * Type-level assertions for the per-module projection aliases (`InfoPage`
 * etc.): each derives its key set from the co-located field-group interface,
 * so it tracks the `declare module` augmentation without hand-listing keys.
 * See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiPageProtection,
  ContributorsPage,
  ContentModel,
  ImageInfoPage,
  InfoPage,
  SearchPage,
} from "../../../src";

// `InfoPage` covers every `prop=info` field; fields contributed by other prop
// modules are not part of the projection by construction.
export const infoPageSample = {
  pageid: 19,
  ns: 0,
  title: "Fixture edit target",
  contentmodel: "wikitext",
  protection: [],
} satisfies InfoPage;

expectTypeOf<InfoPage["contentmodel"]>().toEqualTypeOf<ContentModel | undefined>();
expectTypeOf<InfoPage["protection"]>().toEqualTypeOf<ApiPageProtection[] | undefined>();

// `ImageInfoPage`: the imageinfo array plus its page-level siblings.
expectTypeOf<ImageInfoPage["imageinfo"]>().toExtend<unknown[] | undefined>();
expectTypeOf<ImageInfoPage["imagerepository"]>().toExtend<string | undefined>();
expectTypeOf<ImageInfoPage["badfile"]>().toEqualTypeOf<boolean | undefined>();

// `ContributorsPage`.
expectTypeOf<ContributorsPage["contributors"]>().toExtend<unknown[] | undefined>();
expectTypeOf<ContributorsPage["anoncontributors"]>().toEqualTypeOf<number | undefined>();

// `SearchPage`: the `generator=search` hit fields plus the injected `index`.
expectTypeOf<SearchPage["index"]>().toEqualTypeOf<number | undefined>();
expectTypeOf<SearchPage["snippet"]>().toExtend<string | undefined>();
