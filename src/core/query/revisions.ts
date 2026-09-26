/**
 * `prop=revisions` — a page's revision history, merged into the shared
 * {@link ApiPage} shape via declaration merging.
 *
 * Which fields appear depends on `rvprop`; content-related fields come back in
 * the `slots` map when `rvslots=` is used (see {@link ApiRevision.slots}).
 * Under `formatversion=2`, `minor` is a real `boolean`, while `anon` / `temp`
 * are {@link Flag}s that appear only when true.
 *
 * @see https://www.mediawiki.org/wiki/API:Revisions
 */
import type { ContentFormat, ContentModel, Flag, Timestamp } from "../../common";
import type { ApiHiddenFlags } from "./shared";

/** One content slot of a revision (a revision may have multiple named slots). */
export interface ApiRevisionSlot {
  /** Content model of this slot, e.g. `wikitext`. `rvprop=contentmodel`. */
  contentmodel?: ContentModel;

  /** Serialization format of this slot, e.g. `text/x-wiki`. `rvprop=content`. */
  contentformat?: ContentFormat;

  /** Slot size in bytes. `rvprop=slotsize`. */
  size?: number;

  /** Slot content checksum (hex). `rvprop=slotsha1`. May be empty (`''`). */
  sha1?: string;

  /** The slot content is hidden (revision-deleted). `rvprop=content`; a {@link Flag}. */
  texthidden?: Flag;

  /** The slot checksum is hidden (revision-deleted). `rvprop=slotsha1`; a {@link Flag}. */
  sha1hidden?: Flag;

  /** The slot could not be read for this revision; a {@link Flag}. */
  missing?: Flag;

  /** The slot has no content to return (e.g. deleted text); a {@link Flag}. */
  textmissing?: Flag;

  /**
   * The requested `rvsection` does not exist in this slot; a {@link Flag}.
   * Without `rvslots=` the same condition surfaces as a `nosuchsection` API
   * error instead.
   */
  nosuchsection?: Flag;

  /** The requested content format is not supported by this slot's model. `rvprop=content`; a {@link Flag}. */
  badcontentformat?: Flag;

  /**
   * Slot body. `rvprop=content`. Absent when the text is suppressed
   * (see {@link ApiRevisionSlot.texthidden}) or not requested.
   */
  content?: string;
}

/**
 * The `slots` map, keyed by slot role. `main` is the default slot; extensions
 * may add others (e.g. `top`, `bottom`). The index signature keeps it open.
 */
export interface ApiRevisionSlots {
  /** The default slot. */
  main?: ApiRevisionSlot;

  /** Any other slot, keyed by its role. */
  [role: string]: ApiRevisionSlot | undefined;
}

/**
 * Diff output attached to a revision (`rvdiffto`/`rvdifftotext`; both request
 * parameters are deprecated — prefer `action=compare`).
 */
export interface ApiRevisionDiff {
  /** Revision id the diff starts from. */
  from?: number;

  /** Revision id the diff ends at. */
  to?: number;

  /** Rendered HTML diff table. */
  body?: string;

  /** The diff was not cached and was computed at request time; a {@link Flag}. */
  notcached?: Flag;

  /** The content format is not supported, so no diff was built; a {@link Flag}. */
  badcontentformat?: Flag;
}

/** A single revision entry in `pages[].revisions`. */
export interface ApiRevision extends ApiHiddenFlags {
  /** Revision id. `rvprop=ids`. */
  revid?: number;

  /** Previous revision id; `0` for the first revision of a page. `rvprop=ids`. */
  parentid?: number;

  /** Whether the edit was marked minor. `rvprop=flags`; a real `boolean` (present as `false`). */
  minor?: boolean;

  /** Made by an anonymous (IP) editor. `rvprop=user|userid`; a {@link Flag}. */
  anon?: Flag;

  /** Editor user name. `rvprop=user`. */
  user?: string;

  /** Editor user id; `0` for anonymous editors. `rvprop=userid`. */
  userid?: number;

  /** Revision timestamp. `rvprop=timestamp`. */
  timestamp?: Timestamp;

  /** Revision size in bytes. `rvprop=size`. */
  size?: number;

  /** SHA-1 of the revision content (hex). `rvprop=sha1`. May be empty (`''`). */
  sha1?: string;

  /**
   * Content model of the main slot at this revision. `rvprop=contentmodel`,
   * and also emitted alongside the legacy top-level {@link content} body
   * (`rvprop=content`). Top level only when `rvslots=` is not used; with
   * `rvslots=` the content model lives in each slot.
   */
  contentmodel?: ContentModel;

  /**
   * Legacy top-level content body. Only when `rvslots=` is **not** used,
   * together with `rvprop=content`; with `rvslots=` the body lives in each
   * slot.
   */
  content?: string;

  /**
   * Serialization format of the legacy top-level {@link content}. Only when
   * `rvslots=` is not used, with `rvprop=content`.
   */
  contentformat?: ContentFormat;

  /** Raw edit summary. `rvprop=comment`. */
  comment?: string;

  /** HTML-rendered edit summary. `rvprop=parsedcomment`. */
  parsedcomment?: string;

  /** Change tags applied to this revision. `rvprop=tags`. */
  tags?: string[];

  /** Slot roles present on this revision, e.g. `["main"]`. `rvprop=roles`. */
  roles?: string[];

  /**
   * Content slots. Requires `rvslots=` together with one of `rvprop=content`,
   * `contentmodel`, `slotsize`, `slotsha1`; with none of those `rvprop` values
   * no `slots` map is returned. Without `rvslots=` the content fields appear at
   * the top level instead (legacy).
   */
  slots?: ApiRevisionSlots;

  /**
   * The edit summary is hidden (revision-deleted). `rvprop=comment|parsedcomment`
   * on a suppressed revision; a {@link Flag}. Reviewers with the delete right
   * still see `comment` (often the empty string); other viewers see it withheld.
   */
  commenthidden?: Flag;

  /**
   * The revision content is hidden (revision-deleted); a {@link Flag}.
   * Top level only when `rvslots=` is not used; with `rvslots=` each slot
   * carries its own `texthidden`.
   */
  texthidden?: Flag;

  /**
   * The requested content format is not supported by this revision's model.
   * Top level only when `rvslots=` is not used; with `rvslots=` each slot
   * carries its own `badcontentformat`. A {@link Flag}.
   */
  badcontentformat?: Flag;

  /**
   * The editor is a temporary account. `rvprop=user|userid` on a temp-account
   * revision; a {@link Flag}.
   *
   * @since MediaWiki 1.42
   */
  temp?: Flag;

  /**
   * The SHA-1 (`sha1`) is withheld because the content is revision-deleted.
   * `rvprop=sha1`; a {@link Flag}.
   */
  sha1hidden?: Flag;

  /** Diff of this revision against `rvdiffto`/`rvdifftotext` (both deprecated; prefer `action=compare`). */
  diff?: ApiRevisionDiff;

  /** A slot could not be read for this revision (slot access failure); a {@link Flag}. */
  slotsmissing?: Flag;

  /**
   * The revision has no content to return (e.g. deleted text). Top level only
   * when `rvslots=` is not used; with `rvslots=` each slot carries its own
   * `textmissing`. A {@link Flag}.
   */
  textmissing?: Flag;
}

declare module "./index" {
  interface ApiPage {
    /** Revisions of the page (`prop=revisions`), newest first unless `rvdir=newer`. */
    revisions?: ApiRevision[];
  }
}
