/**
 * `list=random` — a random selection of pages, merged into
 * {@link ApiQueryResult}. Entries carry no `prop=` data; pair the module with
 * `generator=random` to feed the selection into other modules instead.
 *
 * Note the id key is `id`, not the `pageid` other modules use.
 *
 * @see https://www.mediawiki.org/wiki/API:Random
 */
import type { NamespaceIndex } from "../../common";

/** One randomly selected page. */
export interface ApiRandomPage {
  /** Page id — keyed `id` here, unlike the `pageid` elsewhere. */
  id: number;

  /** Namespace index. */
  ns: NamespaceIndex;

  /** Full page title. */
  title: string;

  /**
   * The page is a redirect. A real `boolean` (explicitly `false` too);
   * present only with `rnfilterredir=all`.
   */
  redirect?: boolean;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Randomly selected pages (`list=random`). */
    random?: ApiRandomPage[];
  }
}
