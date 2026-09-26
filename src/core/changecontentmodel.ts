/**
 * `action=changecontentmodel` response — changes a page's content model (e.g.
 * wikitext → JavaScript); requires CSRF and `edit` + `editcontentmodel` rights
 * (on the page under both the current and the new model). The result keys under
 * `changecontentmodel`.
 *
 * @see https://www.mediawiki.org/wiki/API:Changecontentmodel
 */
import type { ContentModel, SuccessResult } from "../common";
import type { ApiEnvelope } from "../envelope";

/** Response of `action=changecontentmodel`. */
export interface ApiChangeContentModelResponse extends ApiEnvelope {
  /** Result of `action=changecontentmodel`. */
  changecontentmodel: {
    /** `Success` when the model was changed. */
    result: SuccessResult;

    /** Page title. */
    title: string;

    /** Page id. */
    pageid: number;

    /** The content model now in effect. */
    contentmodel: ContentModel;

    /** New revision id created by the change. */
    revid: number;

    /** Log entry id recorded for the change. */
    logid: number;
  };
}
