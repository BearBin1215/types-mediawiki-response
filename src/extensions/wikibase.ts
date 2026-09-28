/**
 * Opt-in extension pack: **Wikibase** (`meta=wikibase`, `prop=pageterms`,
 * `prop=wbentityusage`, `list=wblistentityusage`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/wikibase';
 * ```
 *
 * These are the **client-side** Wikibase modules (a wiki linked to a repo wiki);
 * the entity read/write actions (`wbgetentities`, …) live on the repo
 * and are out of scope. fv2 notes:
 *
 * * `prop=pageterms` (`wbpt`) puts `terms` on each page, keyed by term type and
 *   holding a `string[]` (aliases always plural, label/description a one-element
 *   list). Only the three known types occur; a page without a linked entity gets
 *   no `terms`.
 * * `prop=wbentityusage` (`wbeu`) and the per-row `wblistentityusage` both return
 *   a **map keyed by entity id** (`{ "Q84": { … } }`), not an array. An `aspects`
 *   entry is an opaque code, often compound — `"CQR"`, `"D.en"`, `"S"`, `"T"`,
 *   `"O"` — so it is modeled as an open `string[]`, not the `S|L|D|T|C|X|O` the
 *   `wbleuaspect`/`wbeuaspect` *filter* accepts. `url` appears only with `…prop=url`.
 * * `list=wblistentityusage` (`wbleu`) lands under **`query.entityusage`** (not a
 *   `wblistentityusage` key); each row is a page carrying the usage map under the
 *   `wblistentityusage` key. Continuation uses `wbleucontinue` (covered by the
 *   core continuation index signature).
 *
 * @see https://www.mediawiki.org/wiki/Wikibase/API
 */
import type { NamespaceIndex } from "../common";

/** A single entity's usage record: which aspects were used, and an optional repo link. */
export interface ApiEntityUsage {
  /**
   * Usage aspects, as opaque codes — often compound (`"CQR"` = statements +
   * qualifiers + references, `"D.en"` = English description). Open string list.
   */
  aspects?: string[];

  /** Link to the entity page on the repo. Only with `wbeuprop=url` / `wbleuprop=url`. */
  url?: string;
}

/** Entity id → usage. Each row carries at least one entity; an empty map does not occur. */
export type ApiEntityUsageMap = Record<string, ApiEntityUsage>;

/** Terms of the entity linked to a page (`prop=pageterms`). */
export interface ApiPageTerms {
  /** Label(s) in the requested language. */
  label?: string[];

  /** Description(s) in the requested language. */
  description?: string[];

  /** Alias(es) in the requested language. */
  alias?: string[];
}

/** Repo location info (`meta=wikibase`, `wbprop=url`). */
export interface ApiWikibaseRepoUrl {
  /** Repo base URL. */
  base?: string;

  /** Repo script path, e.g. `/w`. */
  scriptpath?: string;

  /** Repo article path with the `$1` placeholder. */
  articlepath?: string;
}

/** The `repo` object of `meta=wikibase`. */
export interface ApiWikibaseRepo {
  /** Repo addresses, as `base`/`scriptpath`/`articlepath`. */
  url?: ApiWikibaseRepoUrl;
}

/** The `wikibase` object of a `meta=wikibase` response. */
export interface ApiWikibaseInfo {
  /** Repo URL info. `wbprop=url`. */
  repo?: ApiWikibaseRepo;

  /** This wiki's global site id, e.g. `mediawikiwiki`. `wbprop=siteid`. */
  siteid?: string;
}

/** One row of `list=wblistentityusage` (a local page using the queried entity). */
export interface ApiEntityUsageRow {
  /** Namespace index. */
  ns?: NamespaceIndex;

  /** Page title, prefixed for non-main namespaces. */
  title?: string;

  /** Local page id. */
  pageid?: number;

  /** Entities used by this page and their usage (the queried entities). */
  wblistentityusage?: ApiEntityUsageMap;
}

declare module "types-mediawiki-response" {
  interface ApiPage {
    /** `prop=pageterms`: terms of the entity linked to this page. */
    terms?: ApiPageTerms;

    /** `prop=wbentityusage`: entities used by this page, keyed by entity id. */
    wbentityusage?: ApiEntityUsageMap;
  }

  interface ApiQueryResult {
    /** `meta=wikibase`: info about the associated repo. */
    wikibase?: ApiWikibaseInfo;

    /** `list=wblistentityusage`: pages using the requested entities. */
    entityusage?: ApiEntityUsageRow[];
  }
}
