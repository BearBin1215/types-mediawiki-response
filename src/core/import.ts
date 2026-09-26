/**
 * `action=import` response — imports pages from an XML dump (uploaded file or an
 * interwiki source); needs CSRF and the `import` (and `importupload` for file
 * uploads) right. The result is a top-level `import` **array**, one entry per
 * imported page.
 *
 * A successful page carries `ns`/`title` plus a `revisions` count; an
 * un-importable title carries `title` + an `invalid` flag.
 *
 * @see https://www.mediawiki.org/wiki/API:Import
 */
import type { Flag, NamespaceIndex } from "../common";
import type { ApiEnvelope } from "../envelope";

/** One imported page reported by `action=import`. */
export interface ApiImportEntry {
  /** Target namespace the page was imported into. */
  ns?: NamespaceIndex;

  /** Imported page title. */
  title?: string;

  /** Number of revisions successfully imported. */
  revisions?: number;

  /** The title was invalid or non-importable. A {@link Flag}. */
  invalid?: Flag;
}

/** Response of `action=import`. */
export interface ApiImportResponse extends ApiEnvelope {
  /** Result of `action=import`; one entry per imported page. */
  import: ApiImportEntry[];
}
