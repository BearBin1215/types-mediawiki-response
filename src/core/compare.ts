/**
 * `action=compare` response — compares two pages/revisions/texts and returns
 * the result under a top-level `compare` object.
 *
 * The rendered diff HTML is `compare.body`, or `compare.bodies` keyed by slot
 * role when comparing specific slots. Which `from*` / `to*` metadata appear
 * depends on `prop`; the `*hidden` markers do not.
 *
 * @see https://www.mediawiki.org/wiki/API:Compare_pages
 */
import type { Flag, Timestamp } from "../common";
import type { ApiEnvelope } from "../envelope";

/** The `compare` object of a successful `action=compare` response. */
export interface ApiCompareResult {
  /** Diff HTML. `prop=diff`; only when the diff is not split per slot. */
  body?: string;

  /**
   * Per-slot diff bodies, keyed by slot role. `prop=diff` when comparing
   * specific slots (`fromslots`/`toslots`); takes the place of {@link body}.
   */
  bodies?: Record<string, string>;

  /** Size of the diff HTML in bytes. `prop=diffsize`. */
  diffsize?: number;

  /** Revision id preceding the `from` side. `prop=rel`. */
  prev?: number;
  /** Revision id following the `to` side. `prop=rel`. */
  next?: number;

  /** Page id of the `from` side. `prop=ids`. */
  fromid?: number;
  /** Revision id of the `from` side. `prop=ids`. */
  fromrevid?: number;
  /** Namespace index of the `from` side. `prop=title`. */
  fromns?: number;
  /** Page title of the `from` side. `prop=title`. */
  fromtitle?: string;
  /** Revision size in bytes of the `from` side. `prop=size`. */
  fromsize?: number;
  /** Timestamp of the `from` revision. `prop=timestamp`. */
  fromtimestamp?: Timestamp;
  /** Editor of the `from` revision. `prop=user`. */
  fromuser?: string;
  /** Editor user id of the `from` revision. `prop=user`. */
  fromuserid?: number;
  /** Edit summary of the `from` revision. `prop=comment`. */
  fromcomment?: string;
  /** HTML-rendered summary of the `from` revision. `prop=comment` or `prop=parsedcomment`. */
  fromparsedcomment?: string;

  /** The `from` revision's content is hidden (revision-deleted). A {@link Flag}. */
  fromtexthidden?: Flag;

  /** The `from` revision's author is hidden. A {@link Flag}. */
  fromuserhidden?: Flag;

  /** The `from` revision's summary is hidden. A {@link Flag}. */
  fromcommenthidden?: Flag;

  /** Suppression (oversight) applies to the `from` revision, alongside the `*hidden` flags. A {@link Flag}. */
  fromsuppressed?: Flag;

  /** The `from` revision was read from the archive (deleted since it was referenced). A {@link Flag}. */
  fromarchive?: Flag;

  /** Page id of the `to` side. `prop=ids`. */
  toid?: number;
  /** Revision id of the `to` side. `prop=ids`. */
  torevid?: number;
  /** Namespace index of the `to` side. `prop=title`. */
  tons?: number;
  /** Page title of the `to` side. `prop=title`. */
  totitle?: string;
  /** Revision size in bytes of the `to` side. `prop=size`. */
  tosize?: number;
  /** Timestamp of the `to` revision. `prop=timestamp`. */
  totimestamp?: Timestamp;
  /** Editor of the `to` revision. `prop=user`. */
  touser?: string;
  /** Editor user id of the `to` revision. `prop=user`. */
  touserid?: number;
  /** Edit summary of the `to` revision. `prop=comment`. */
  tocomment?: string;
  /** HTML-rendered summary of the `to` revision. `prop=comment` or `prop=parsedcomment`. */
  toparsedcomment?: string;

  /** The `to` revision's content is hidden (revision-deleted). A {@link Flag}. */
  totexthidden?: Flag;

  /** The `to` revision's author is hidden. A {@link Flag}. */
  touserhidden?: Flag;

  /** The `to` revision's summary is hidden. A {@link Flag}. */
  tocommenthidden?: Flag;

  /** Suppression (oversight) applies to the `to` revision, alongside the `*hidden` flags. A {@link Flag}. */
  tosuppressed?: Flag;

  /** The `to` revision was read from the archive (deleted since it was referenced). A {@link Flag}. */
  toarchive?: Flag;
}

/** Response of `action=compare`. */
export interface ApiCompareResponse extends ApiEnvelope {
  /** Result of `action=compare`. */
  compare: ApiCompareResult;
}
