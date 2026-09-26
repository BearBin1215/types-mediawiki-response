/**
 * `list=protectedtitles` — titles protected against creation (pre-emptive
 * protection of pages that do not exist yet), merged into {@link ApiQueryResult}.
 *
 * @see https://www.mediawiki.org/wiki/API:Protectedtitles
 */
import type { Expiry, NamespaceIndex, Timestamp } from "../../common";

/**
 * Create-protection level of a protected title — an entry of
 * `$wgRestrictionLevels` (core default: `autoconfirmed`, `sysop`). **Open
 * union**: `sreview` comes from FlaggedRevs, so the set is site-dependent.
 */
export type ProtectedTitleLevel = "autoconfirmed" | "sysop" | (string & {});

/** One protected title. `ptprop` controls which fields appear. */
export interface ApiProtectedTitle {
  /** Namespace index. */
  ns: NamespaceIndex;

  /** The protected (non-existent) title. */
  title: string;

  /** Restriction level applied, e.g. `sysop`. `ptprop=level`. */
  level?: ProtectedTitleLevel;

  /** When the protection was applied. `ptprop=timestamp`. */
  timestamp?: Timestamp;

  /** Name of the protecting user. `ptprop=user`. */
  user?: string;

  /**
   * Id of the protecting user. `ptprop=userid`; also emitted with
   * `ptprop=user` (B/C).
   */
  userid?: number;

  /** Raw protection reason. `ptprop=comment`. */
  comment?: string;

  /** HTML-rendered protection reason. `ptprop=parsedcomment`. */
  parsedcomment?: string;

  /** When the protection lapses, or `infinity`. `ptprop=expiry`. */
  expiry?: Expiry;
}

declare module "./index" {
  interface ApiQueryResult {
    /** Titles protected against creation (`list=protectedtitles`). */
    protectedtitles?: ApiProtectedTitle[];
  }
}
