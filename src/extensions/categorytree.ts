/**
 * Opt-in extension pack: **CategoryTree** (`action=categorytree`).
 *
 * Not in the default export. Standalone action response — import it directly:
 *
 * ```ts
 * import type { ApiCategoryTreeResponse } from 'types-mediawiki-response/ext/categorytree';
 * ```
 *
 * The module returns **pre-rendered HTML**, not structured rows: `html` holds
 * the tree markup, and is `""` when the category is empty or does not exist.
 * Everything you would expect as data (page list, subcategories, sort keys) has
 * to be parsed out of the markup, so prefer `list=allpages`/`prop=categories`
 * when you need structure.
 *
 * @see https://www.mediawiki.org/wiki/Extension:CategoryTree
 * @see https://www.mediawiki.org/wiki/Extension:CategoryTree/API
 */
import type { ApiEnvelope } from "../envelope";

/** Response of `action=categorytree`. */
export interface ApiCategoryTreeResponse extends ApiEnvelope {
  /**
   * The module's only output is a content value: `html` holds the rendered tree.
   * The requested category is **not** echoed back.
   */
  categorytree: {
    /** Rendered tree markup; `""` for an empty or non-existent category. */
    html?: string;
  };
}
