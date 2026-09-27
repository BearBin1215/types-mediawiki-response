/**
 * Type-level assertions for the VisualEditor opt-in pack, checked against real
 * MediaWiki 1.43 responses from a wiki with VisualEditor loaded.
 * See `info.test-d.ts` for the assertion recipe.
 */
import { expectTypeOf } from "expect-type";
import type { Flag } from "../../src";
import type { ApiBlockInfo } from "../../src/core/query/users";
import type { ExtraKeys } from "../typeutil";
import parseFixture from "../fixtures/extensions/visualeditor.json";
import type {
  ApiEditCheckReferenceUrlResponse,
  ApiVisualEditorCheckboxDef,
  ApiVisualEditorEditResponse,
  ApiVisualEditorParseFragmentResponse,
  ApiVisualEditorResponse,
  ApiVisualEditorTemplatesUsedResponse,
} from "../../src/extensions/visualeditor";

// `paction=metadata`: the edit-form frame. `blockinfo` is null (not absent) for
// an unblocked user, and `notices` is an empty PHP map, so `[]`.
export const metadataSample = {
  batchcomplete: true,
  visualeditor: {
    result: "success",
    notices: [],
    copyrightWarning: "",
    checkboxesDef: {
      wpMinoredit: {
        id: "wpMinoredit",
        "label-message": "minoredit",
        "label-id": "wpMinoredit",
        "legacy-name": "wpMinoredit",
        tooltip: "minoredit",
        default: false,
      },
    },
    checkboxesMessages: { minoredit: "Minor edit", "tooltip-minoredit": "…" },
    protectedClasses: "",
    basetimestamp: "2026-09-27T18:40:00Z",
    starttimestamp: "2026-09-27T18:41:00Z",
    oldid: 540,
    blockinfo: null,
    wouldautocreate: false,
    canEdit: true,
  },
} satisfies ApiVisualEditorResponse;

// A not-yet-created page turns `notices` into a message-keyed map.
export const newPageSample = {
  batchcomplete: true,
  visualeditor: {
    result: "success",
    notices: { newarticletext: "You have followed a link to a page that does not exist yet." },
    copyrightWarning: "",
    checkboxesDef: {},
    checkboxesMessages: {},
    protectedClasses: "",
    basetimestamp: "+00:00:00:00:00:00",
    starttimestamp: "2026-09-27T18:41:00Z",
    oldid: 0,
    blockinfo: null,
    wouldautocreate: false,
    canEdit: true,
    etag: "uuid",
  },
} satisfies ApiVisualEditorResponse;

// `paction=save` returns the page frame with the saved-revision fields.
export const saveSample = {
  batchcomplete: true,
  visualeditoredit: {
    result: "success",
    content: '<div class="mw-content-ltr">…</div>',
    contentSub: '<div class="…">Latest comment: …</div>',
    displayTitleHtml: '<span class="mw-page-title-namespace">VE</span>',
    categorieshtml: '<div id="catlinks" class="catlinks"></div>',
    sections: [],
    modules: [],
    jsconfigvars: { wgEchoSeenTime: { alert: "1970-01-01T00:00:01Z" } },
    isRedirect: "",
    lastModified: {
      date: "27 September 2026",
      time: "18:34",
      message: "This page was last edited …",
    },
    newrevid: 555,
    watched: true,
    watchlistexpiry: null,
  },
} satisfies ApiVisualEditorEditResponse;

export const diffSample = {
  batchcomplete: true,
  visualeditoredit: { result: "success", diff: '<div class="mw-diff-insert">added</div>' },
} satisfies ApiVisualEditorEditResponse;

// `paction=templatesused` writes an HTML string, not an object.
export const templatesUsedSample = {
  batchcomplete: true,
  visualeditor: '<div class="templatesUsed"></div>',
} satisfies ApiVisualEditorTemplatesUsedResponse;

// `action=editcheckreferenceurl`: always exactly one entry — the checked URL
// mapped to its verdict.
export const referenceUrlSample = {
  batchcomplete: true,
  editcheckreferenceurl: { "https://example.org/": "allowed" },
} satisfies ApiEditCheckReferenceUrlResponse;

// The parse/wikitext/metadata branch builds one array literal, so these are
// required there (unlike the `visualeditoredit` frame fields below).
expectTypeOf<ApiVisualEditorResponse["visualeditor"]>()
  .toHaveProperty("blockinfo")
  .toEqualTypeOf<ApiBlockInfo | null>();
expectTypeOf<ApiVisualEditorResponse["visualeditor"]>()
  .toHaveProperty("canEdit")
  .toEqualTypeOf<boolean>();
// `""` when no warning applies.
expectTypeOf<ApiVisualEditorResponse["visualeditor"]>()
  .toHaveProperty("copyrightWarning")
  .toEqualTypeOf<string>();
expectTypeOf<ApiVisualEditorResponse["visualeditor"]>()
  .toHaveProperty("starttimestamp")
  .toEqualTypeOf<string>();
// `paction=parsefragment` is a separate, minimal shape.
expectTypeOf<ApiVisualEditorParseFragmentResponse["visualeditor"]>()
  .toHaveProperty("content")
  .toEqualTypeOf<string>();
expectTypeOf<ApiVisualEditorEditResponse["visualeditoredit"]>()
  .toHaveProperty("isRedirect")
  .toEqualTypeOf<string | undefined>();
// Save-only extras on the page frame.
expectTypeOf<ApiVisualEditorEditResponse["visualeditoredit"]>()
  .toHaveProperty("nocontent")
  .toEqualTypeOf<Flag | undefined>();
expectTypeOf<ApiVisualEditorEditResponse["visualeditoredit"]>()
  .toHaveProperty("cachekey")
  .toEqualTypeOf<string | undefined>();
expectTypeOf<ApiVisualEditorEditResponse["visualeditoredit"]>()
  .toHaveProperty("tempusercreated")
  .toEqualTypeOf<Flag | undefined>();
expectTypeOf<ApiVisualEditorEditResponse["visualeditoredit"]>()
  .toHaveProperty("tempusercreatedredirect")
  .toEqualTypeOf<string | undefined>();
// The edit form fields include the `wpWatchlistExpiry` dropdown, whose fields
// differ from the plain checkboxes.
expectTypeOf<ApiVisualEditorCheckboxDef>()
  .toHaveProperty("default")
  .toEqualTypeOf<boolean | string | undefined>();
expectTypeOf<ApiVisualEditorCheckboxDef>()
  .toHaveProperty("title-message")
  .toEqualTypeOf<string | undefined>();
expectTypeOf<ApiVisualEditorCheckboxDef>()
  .toHaveProperty("options")
  .toEqualTypeOf<{ data?: string; label?: string }[] | undefined>();

// --- real fixture (fixtures/extensions/visualeditor.json, paction=parse) ---

// The captured `parse` response: `checkboxesDef` entries carry the full
// label/tooltip/legacy-name set, `oldid`/`etag` are populated and `content`
// holds the Parsoid HTML.
expectTypeOf(parseFixture.visualeditor.content).toExtend<string>();
expectTypeOf<
  ExtraKeys<typeof parseFixture, keyof ApiVisualEditorResponse>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof parseFixture.visualeditor, keyof ApiVisualEditorResponse["visualeditor"]>
>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<
    NonNullable<
      NonNullable<ApiVisualEditorResponse["visualeditor"]>["checkboxesDef"]
    >["wpMinoredit"],
    keyof ApiVisualEditorCheckboxDef
  >
>().toEqualTypeOf<never>();
