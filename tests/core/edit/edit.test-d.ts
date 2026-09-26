/**
 * Type-level assertions for `action=edit`, checked against real fixtures
 * captured from a local MediaWiki 1.43 LTS. See `info.test-d.ts` for the recipe.
 */
import { expectTypeOf } from "expect-type";
import type { ApiEditCaptcha, ApiEditResponse, ApiEditResult } from "../../../src";
import type { ExtraKeys } from "../../typeutil";
import captchaFixture from "../../fixtures/core/edit/captcha-failure.json";
import createFixture from "../../fixtures/core/edit/create.json";
import nochangeFixture from "../../fixtures/core/edit/nochange.json";
import newsectionFixture from "../../fixtures/core/edit/newsection.json";

// create / nochange / changed outcomes all satisfy the declared type.
export const createSample = {
  edit: {
    new: true,
    result: "Success",
    pageid: 19,
    title: "Fixture edit target",
    contentmodel: "wikitext",
    oldrevid: 0,
    newrevid: 35,
    newtimestamp: "2026-09-25T18:45:35Z",
    watched: true,
  },
} satisfies ApiEditResponse;

export const nochangeSample = {
  edit: {
    result: "Success",
    pageid: 19,
    title: "Fixture edit target",
    contentmodel: "wikitext",
    nochange: true,
    watched: true,
  },
} satisfies ApiEditResponse;

// `new` / `nochange` / `watched` are `Flag`s (appear only when true).
expectTypeOf<ApiEditResult>().toHaveProperty("new").toEqualTypeOf<true | undefined>();
expectTypeOf<ApiEditResult>().toHaveProperty("result");

expectTypeOf(createFixture.edit).toExtend<Record<string, unknown>>();
expectTypeOf<ExtraKeys<typeof createFixture, keyof ApiEditResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof createFixture.edit, keyof ApiEditResult>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof nochangeFixture.edit, keyof ApiEditResult>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<typeof newsectionFixture.edit, keyof ApiEditResult>
>().toEqualTypeOf<never>();

// In-band failure branch (ConfirmEdit aborted the save): `result: "Failure"`
// plus the captcha challenge instead of revision ids.
export const captchaSample = {
  edit: {
    result: "Failure",
    captcha: {
      type: "simple",
      mime: "text/plain",
      id: "2982341811588035270",
      question: "36+3",
    },
  },
} satisfies ApiEditResponse;

expectTypeOf<ApiEditResult>().toHaveProperty("captcha").toEqualTypeOf<ApiEditCaptcha | undefined>();
expectTypeOf<ApiEditCaptcha>().toHaveProperty("type").toEqualTypeOf<string | undefined>();
expectTypeOf<ExtraKeys<typeof captchaFixture, keyof ApiEditResponse>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof captchaFixture.edit, keyof ApiEditResult>>().toEqualTypeOf<never>();
expectTypeOf<
  ExtraKeys<NonNullable<typeof captchaFixture.edit.captcha>, keyof ApiEditCaptcha>
>().toEqualTypeOf<never>();
