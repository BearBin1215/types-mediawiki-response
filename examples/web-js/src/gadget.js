// @ts-check
// Plain-JS gadget: response types come from JSDoc alone — hover over `res` or
// any field access below in your IDE, no build step required. Use a JSDoc cast
// (`/** @type {X} */ (expr)`) to narrow the loose value `mw.Api` resolves to;
// a plain `@type` annotation on the variable is an assignment, not a cast.

/**
 * @typedef {import("types-mediawiki-response").ApiParseResponse} ApiParseResponse
 * @typedef {import("types-mediawiki-response").ApiQueryResponse} ApiQueryResponse
 */

/**
 * Fetch the wikitext of a page.
 *
 * @param {string} title
 * @returns {Promise<string>}
 */
export async function getWikitext(title) {
  const api = new mw.Api();
  const res = /** @type {ApiParseResponse} */ (
    await api.get({
      action: "parse",
      page: title,
      prop: "wikitext",
      formatversion: "2",
    })
  );
  return res.parse.wikitext ?? "";
}

/**
 * Collect titles linking to a page. `mw.Api` rejects on API errors, so a
 * resolved value is always a success shape — no error narrowing needed.
 *
 * @param {string} from Full title to look up, e.g. "Project:Script"
 * @returns {Promise<string[]>}
 */
export async function whatLinksHere(from) {
  const api = new mw.Api();
  const res = /** @type {ApiQueryResponse} */ (
    await api.get({
      action: "query",
      list: "backlinks",
      bltitle: from,
      formatversion: "2",
    })
  );
  return (res.query.backlinks ?? []).map((backlink) => backlink.title);
}
