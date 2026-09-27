/**
 * Opt-in extension pack: **Scribunto** (`action=scribunto-console`).
 *
 * Not in the default export. This is a standalone action response — import and use
 * it directly (no declaration merging needed):
 *
 * ```ts
 * import type { ApiScribuntoConsoleResponse } from 'types-mediawiki-response/ext/scribunto';
 * ```
 *
 * fv2 notes: `ApiScribuntoConsole` writes its result keys at the **root** of the
 * response (`addValue( null, $key, $value )`), not under a `scribunto-console`
 * wrapper. A Lua failure is reported **in band** — `type: "error"` with `html` /
 * `message` / `messagename` — rather than as an {@link ApiErrorResponse}; only
 * transport-level problems (missing `token`, oversized session …) surface as a
 * real error. `type: "normal"` carries `print` (captured `print()` output) and
 * `return` (the stringified returned value); a question with no `return` yields an
 * empty `return`. `sessionIsNew` is a valueless flag returned as the empty string
 * when the session was just created, and absent otherwise.
 *
 * @see https://www.mediawiki.org/wiki/Extension:Scribunto
 */
import type { ApiEnvelope } from "../envelope";

/** Console outcome. Scribunto reports `normal` / `error` in band; open for future kinds. */
export type ScribuntoConsoleType = "normal" | "error" | (string & {});

/** Session bookkeeping common to both `normal` and `error` results. */
interface ApiScribuntoConsoleBase {
  /** Whether the question evaluated cleanly (`normal`) or raised a Lua error (`error`). */
  type?: ScribuntoConsoleType;

  /** Opaque console session id; echo it back (via a stable cookie) to keep state across questions. */
  session?: number;

  /** Bytes used so far in the session (content plus accumulated questions). */
  sessionSize?: number;

  /** Byte ceiling before `scribunto-console-too-large` is raised. */
  sessionMaxSize?: number;

  /** Valueless flag: the empty string when this question started a new session, else absent. */
  sessionIsNew?: "";
}

/** The `type: "normal"` shape (`print` output plus the returned value). */
export interface ApiScribuntoConsoleNormal extends ApiScribuntoConsoleBase {
  /** Text emitted by `print()` calls (newline-terminated); empty when nothing printed. */
  print?: string;

  /** Stringified value from a `return` statement; empty when the question returned nothing. */
  return?: string;
}

/** The `type: "error"` shape (a Lua error reported in band). */
export interface ApiScribuntoConsoleError extends ApiScribuntoConsoleBase {
  /** Rendered error plus backtrace HTML (`<ol class="scribunto-trace">…`). */
  html?: string;

  /** Plain-text error message. */
  message?: string;

  /** i18n key of {@link message}. */
  messagename?: string;
}

/**
 * Response of `action=scribunto-console`. Discriminated on {@link type}: a
 * {@link ApiScribuntoConsoleNormal} result or an {@link ApiScribuntoConsoleError}
 * one, both merged onto the envelope at the root.
 */
export type ApiScribuntoConsoleResponse = ApiEnvelope &
  (ApiScribuntoConsoleNormal | ApiScribuntoConsoleError);
