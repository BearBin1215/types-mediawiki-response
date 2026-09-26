/**
 * `list=pageswithprop` — pages carrying a given page property, merged into
 * {@link ApiQueryResult}. The reverse lookup of `prop=pageprops`; enumerate the
 * usable property names with `list=pagepropnames`.
 *
 * @see https://www.mediawiki.org/wiki/API:Pageswithprop
 */
import type { NamespaceIndex } from "../../common";

/** One page that defines the requested property. */
export interface ApiPagesWithProp {
  /** Page id. `pwpprop=ids`. */
  pageid?: number;

  /** Namespace index. `pwpprop=title` (default). */
  ns?: NamespaceIndex;

  /** Full page title. */
  title?: string;

  /**
   * Property value. `pwpprop=value` — a string, empty for switch-like
   * properties (`__DISAMBIG__`), same as `prop=pageprops`.
   */
  value?: string;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Pages defining `pwppropname` (`list=pageswithprop`). */
    pageswithprop?: ApiPagesWithProp[];
  }
}
