/**
 * Opt-in extension pack: **CentralAuth** (`meta=globaluserinfo`). Only that
 * meta module is covered; CentralAuth's other API surfaces (`list=globalallusers`,
 * `list=globalgroups`, `list=wikisets`, `meta=globalrenamestatus`, and the
 * `centralauthtoken`/`createlocalaccount`/`deleteglobalaccount`/
 * `setglobalaccountstatus`/`globaluserrights` actions) are out of scope.
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/globaluserinfo';
 * ```
 *
 * @see https://www.mediawiki.org/wiki/API:Globaluserinfo
 */
import type { Expiry, Flag, Timestamp } from "../common";

/** Local block details on an attached or unattached account entry. */
export interface ApiGlobalUserLocalBlock {
  /** Local block expiry, or `infinity`. */
  expiry?: Expiry;

  /** Local block reason. */
  reason?: string;
}

/** One attached (merged) local account under `guiprop=merged`. */
export interface ApiGlobalUserMerge {
  /** Wiki id, e.g. `mediawikiwiki`. */
  wiki?: string;

  /** Base URL of the wiki. */
  url?: string;

  /** Local user id on that wiki. */
  id?: number;

  /** When the local account was attached. */
  timestamp?: Timestamp;

  /** How the account was attached, e.g. `password`, `login`, `create`. */
  method?: string;

  /** Local edit count. `guiprop=editcount`. */
  editcount?: number;

  /** Local registration timestamp. */
  registration?: Timestamp;

  /** Local groups on that wiki. */
  groups?: string[];

  /** Local block, when the local account is blocked. */
  blocked?: ApiGlobalUserLocalBlock;
}

/** One unattached (not yet merged) local account under `guiprop=unattached`. */
export interface ApiGlobalUserUnattached {
  /** Wiki id, e.g. `mediawikiwiki`. */
  wiki?: string;

  /** Local edit count. */
  editcount?: number;

  /** Local registration timestamp. */
  registration?: Timestamp;

  /** Local groups on that wiki. */
  groups?: string[];

  /** Local block, when the local account is blocked. */
  blocked?: ApiGlobalUserLocalBlock;
}

/** The `globaluserinfo` object of a `meta=globaluserinfo` response. */
export interface ApiGlobalUserInfo {
  /** Global user id. */
  id?: number;

  /** Normalized user name. */
  name?: string;

  /** Wiki the account originated on, e.g. `mediawikiwiki`. */
  home?: string;

  /** Global registration timestamp. */
  registration?: Timestamp;

  /** Aggregated edit count. `guiprop=editcount`. */
  editcount?: number;

  /** Global groups. `guiprop=groups`. */
  groups?: string[];

  /** Global rights. `guiprop=rights`. */
  rights?: string[];

  /** Per-wiki attached accounts. `guiprop=merged`. */
  merged?: ApiGlobalUserMerge[];

  /** Unattached local accounts. `guiprop=unattached`. */
  unattached?: ApiGlobalUserUnattached[];

  /** Whether the account is locked. A {@link Flag}. */
  locked?: Flag;

  /** Whether the account is hidden. A {@link Flag}. */
  hidden?: Flag;

  /**
   * Replaces the basic fields when the account does not exist (or is hidden
   * from view). A {@link Flag}.
   */
  missing?: Flag;
}

declare module "types-mediawiki-response" {
  interface ApiQueryResult {
    /** Global account of the queried user (`meta=globaluserinfo`). */
    globaluserinfo?: ApiGlobalUserInfo;
  }
}
