/**
 * Type-level assertions for the Scribunto ext pack (`action=scribunto-console`).
 */
import { expectTypeOf } from "expect-type";
import type {
  ApiScribuntoConsoleError,
  ApiScribuntoConsoleNormal,
} from "../../src/extensions/scribunto";
import type { ExtraKeys } from "../typeutil";
import normalFixture from "../fixtures/extensions/scribunto-console.json";
import errorFixture from "../fixtures/extensions/scribunto-console-error.json";

// The result keys are merged at the response root; assert every key a sample
// carries is modeled by the normal|error union (their intersection exposes all).
type AllKeys = keyof (ApiScribuntoConsoleNormal & ApiScribuntoConsoleError);

export const normal = {
  type: "normal",
  print: "hi there\n",
  return: "",
  session: 1838806907,
  sessionSize: 17,
  sessionMaxSize: 500000,
  sessionIsNew: "",
} satisfies ApiScribuntoConsoleNormal;

export const error = {
  type: "error",
  html: "<p>…</p>",
  message: "boom",
  messagename: "scribunto-lua-error-location",
  session: 591160567,
  sessionSize: 13,
  sessionMaxSize: 500000,
  sessionIsNew: "",
} satisfies ApiScribuntoConsoleError;

expectTypeOf<ExtraKeys<typeof normalFixture, AllKeys>>().toEqualTypeOf<never>();
expectTypeOf<ExtraKeys<typeof errorFixture, AllKeys>>().toEqualTypeOf<never>();
