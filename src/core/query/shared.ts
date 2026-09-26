/**
 * Field groups shared by several `query` modules.
 */
import type { Flag, NamespaceIndex } from "../../common";

/** The `pageid`/`ns`/`title` page identity triple shared by `list=` module rows. */
export interface ApiPageRef {
  /** Page id. */
  pageid: number;

  /** Namespace index. */
  ns: NamespaceIndex;

  /** Full page title. */
  title: string;
}

/**
 * Suppression ("RevisionDelete") visibility flags shared by the modules that
 * report hidden users, comments and whole entries; each appears as a
 * {@link Flag} when that part of the record is hidden.
 */
export interface ApiHiddenFlags {
  /** The acting user is hidden. A {@link Flag}. */
  userhidden?: Flag;

  /** The comment is hidden. A {@link Flag}. */
  commenthidden?: Flag;

  /**
   * Oversight/suppression applies to the entry (set together with the
   * `*hidden` flags). A {@link Flag}.
   */
  suppressed?: Flag;
}
