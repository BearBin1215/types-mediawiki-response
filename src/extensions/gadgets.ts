/**
 * Opt-in extension pack: **Gadgets** (`list=gadgets`, `list=gadgetcategories`).
 *
 * Not in the default export: importing anything from this file — even just the
 * field-group type you are about to use — activates the augmentation shipped at
 * the bottom, which merges the field groups into the root package automatically
 * (no manual `declare module`):
 *
 * ```ts
 * import type {} from 'types-mediawiki-response/ext/gadgets';
 * ```
 *
 * `gaprop` selects `id` / `metadata` / `desc`; `metadata` mirrors the gadget
 * definition line, split into a `settings` block (what the definition encodes)
 * and a `module` block (the ResourceLoader modules it declares). Both are PHP
 * maps, so an empty list inside them arrives as `[]` under `formatversion=2`.
 * `gacategories`/`gaids` filter the list, and `gaallowedonly`/`gaenabledonly`
 * narrow it to what the requesting user may use or has switched on.
 *
 * @see https://www.mediawiki.org/wiki/Extension:Gadgets
 */

/** The `metadata.settings` block of a gadget definition. */
export interface ApiGadgetSettings {
  /** Interface actions the gadget needs, e.g. `edit`. */
  actions: string[];

  /**
   * Categories the gadget needs the page to be in.
   *
   * @since MediaWiki 1.42
   */
  categories?: string[];

  /**
   * Definition category this gadget was declared under (`""` when none).
   *
   * @deprecated since MediaWiki 1.44; superseded by {@link categories}.
   */
  category?: string;

  /**
   * Content models the gadget applies to.
   *
   * @since MediaWiki 1.41
   */
  contentModels?: string[];

  /** Whether the gadget is on by default. */
  default: boolean;

  /** Whether the gadget is hidden from the preferences list. */
  hidden: boolean;

  /**
   * Whether legacy (non-ResourceLoader) scripts are used.
   *
   * @deprecated since MediaWiki 1.47; the key is no longer emitted.
   */
  legacyscripts?: boolean;

  /**
   * Namespace indexes the gadget applies to.
   *
   * @since MediaWiki 1.41
   */
  namespaces?: number[];

  /** Whether the gadget is packaged with the extension. */
  package: boolean;

  /**
   * Whether the gadget requires ES6.
   *
   * @since MediaWiki 1.40
   * @deprecated since MediaWiki 1.47; the key is no longer emitted.
   */
  requiresES6?: boolean;

  /** Rights the user must hold. */
  rights: string[];

  /**
   * Definition section this gadget was declared under (`""` when none).
   *
   * @since MediaWiki 1.44
   */
  section?: string;

  /**
   * Whether the gadget comes from a shared/common repo. The API module reports
   * `false` for every gadget.
   */
  shared: boolean;

  /** Skins the gadget applies to. */
  skins: string[];

  /** Whether the gadget can be loaded via `load.php` gadget URLs. */
  supportsUrlLoad: boolean;
}

/** The `metadata.module` block: the ResourceLoader definition of the gadget. */
export interface ApiGadgetModule {
  /**
   * Codex icons the gadget needs.
   *
   * @since MediaWiki 1.45
   */
  codexIcons?: string[];

  /** Names of `MediaWiki:Gadget-*.json` data pages. */
  datas: string[];

  /** ResourceLoader dependencies. */
  dependencies: string[];

  /** Message keys the gadget needs. */
  messages: string[];

  /** Gadgets that must be enabled together with this one. */
  peers: string[];

  /** Script module names. */
  scripts: string[];

  /** Style module names. */
  styles: string[];

  /**
   * Vue single-file components the gadget registers.
   *
   * @since MediaWiki 1.45
   */
  vues?: string[];
}

/** A gadget's `metadata` value (`gaprop=metadata`). */
export interface ApiGadgetMetadata {
  /** What the definition line encodes. */
  settings: ApiGadgetSettings;

  /** The ResourceLoader modules the gadget registers. */
  module: ApiGadgetModule;
}

/** One gadget row (`list=gadgets`). */
export interface ApiGadget {
  /** Internal gadget id, as written in `MediaWiki:Gadgets-definition`. `gaprop=id`. */
  id?: string;

  /** Definition metadata. `gaprop=metadata`. */
  metadata?: ApiGadgetMetadata;

  /** Parsed HTML description. `gaprop=desc` (documented as potentially slow). */
  desc?: string;
}

/** One gadget category (`list=gadgetcategories`, `gcprop`). */
export interface ApiGadgetCategory {
  /** Internal category name as used in definitions. `gcprop=name`. */
  name?: string;

  /**
   * Parsed section description (`gadget-section-<name>` message).
   * Selected by `gcprop=title` but **keyed as `desc`**; omitted for the unnamed
   * (default) category, which has no message to parse.
   */
  desc?: string;

  /** Number of gadgets in the category. `gcprop=members`. */
  members?: number;
}

declare module "types-mediawiki-response" {
  interface ApiQueryResult {
    /** Gadgets used on this wiki (`list=gadgets`). */
    gadgets?: ApiGadget[];

    /** Gadget categories (`list=gadgetcategories`). */
    gadgetcategories?: ApiGadgetCategory[];
  }
}
