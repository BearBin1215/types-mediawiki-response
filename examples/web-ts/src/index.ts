// Gadget/user-script style: `mw` globals come from `types-mediawiki`, response
// types from `types-mediawiki-response`. Every import below is type-only —
// the bundler erases them; only the `mw.Api` calls remain at runtime.
//
// Note on extension fields: importing anything from a pack file activates it —
// here the GlobalUsage pack, which merges `globalusage` onto `ApiPage`. Under
// the native TS compiler (TS ≥ 7 / tsgo) the merged field is visible on types
// referenced in this file — hence the local `ApiPage[]` annotation in
// `findGlobalUsages`; under classic tsc the augmentation is program-wide.
import type { ApiGlobalUsage } from "types-mediawiki-response/ext/globalusage";
import type {
  ApiEditResponse,
  ApiParseResponse,
  ApiQueryResponse,
  ApiPage,
} from "types-mediawiki-response";

export async function getWikitext(title: string): Promise<string | undefined> {
  const api = new mw.Api();
  const res = (await api.get({
    action: "parse",
    page: title,
    prop: "wikitext",
    formatversion: "2",
  })) as ApiParseResponse;
  return res.parse.wikitext;
}

export async function findGlobalUsages(file: string): Promise<string[]> {
  const api = new mw.Api();
  const res = (await api.get({
    action: "query",
    prop: "globalusage",
    titles: file,
    formatversion: "2",
  })) as ApiQueryResponse;
  const pages: ApiPage[] = res.query.pages ?? [];
  return (pages[0]?.globalusage ?? []).map(
    (usage: ApiGlobalUsage) => `${usage.wiki}:${usage.title}`,
  );
}

export async function replaceWikitext(title: string, text: string): Promise<void> {
  const api = new mw.Api();
  const res = (await api.postWithToken("csrf", {
    action: "edit",
    title,
    text,
    formatversion: "2",
  })) as ApiEditResponse;
  if (res.edit.result !== "Success") {
    throw new Error(`Edit failed: ${res.edit.result}`);
  }
}
