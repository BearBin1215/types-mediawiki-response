/**
 * Shared plumbing for the local-container capture scripts
 * (`capture-write-fixtures.ts`, `capture-core-gaps.ts`,
 * `capture-coverage-gaps.ts`, `capture-ext-gaps.ts`).
 *
 * These scripts talk to a throwaway MediaWiki install over `docker exec`
 * (bring-up, LocalSettings and the capture accounts: `scripts/container/README.md`).
 * Everything here is transport: a session, a shell hop and a JSON POST.
 */
import { execFileSync } from "node:child_process";

/** The wiki's API endpoint, reached from inside the container. */
export const API = "http://localhost/api.php";

/** Baseline container (MediaWiki 1.43). Override with `MW_CONTAINER`. */
export const CONTAINER = process.env.MW_CONTAINER ?? "mw-fixture";

/** Second container for 1.46-only modules. Override with `MW146_CONTAINER`. */
export const CONTAINER_146 = process.env.MW146_CONTAINER ?? "mw146";

/** Per-run suffix that keeps seeded titles unique across runs. */
export const SUF = String(Date.now());

/** A cookie-jar session; `user`/`pass` are empty for an anonymous jar. */
export interface Creds {
  jar: string;
  user: string;
  pass: string;
}

/** Run a shell snippet in `container`, forwarding `env` as variables. */
export function shIn(container: string, script: string, env: Record<string, string> = {}): string {
  const args = ["exec"];
  for (const [k, v] of Object.entries(env)) args.push("-e", `${k}=${v}`);
  args.push(container, "sh", "-lc", script);
  return execFileSync("docker", args, { encoding: "utf8" });
}

/** Run a shell snippet in the baseline container. */
export function sh(script: string, env: Record<string, string> = {}): string {
  return shIn(CONTAINER, script, env);
}

/**
 * POST to the API reusing a session's cookie jar. `SUF` is always forwarded so
 * titles can interpolate `$SUF` server-side; a non-JSON body (an HTML error
 * page) comes back as `{ RAW: text }` rather than throwing.
 */
export function call(
  s: Creds,
  post: string,
  env: Record<string, string> = {},
  container = CONTAINER,
): unknown {
  const out = shIn(
    container,
    `curl -s -c ${s.jar} -b ${s.jar} -d "formatversion=2" -d "format=json" ${post} "${API}"`,
    { SUF, ...env },
  );
  try {
    return JSON.parse(out);
  } catch {
    return { RAW: out };
  }
}

/**
 * Multipart variant of {@link call}: curl refuses to mix `-d` and `-F`, so the
 * two standard parameters travel as `-F` fields.
 */
export function callForm(
  s: Creds,
  post: string,
  env: Record<string, string> = {},
  container = CONTAINER,
): unknown {
  const out = shIn(
    container,
    `curl -s -c ${s.jar} -b ${s.jar} -F "formatversion=2" -F "format=json" ${post} "${API}"`,
    { SUF, ...env },
  );
  try {
    return JSON.parse(out);
  } catch {
    return { RAW: out };
  }
}

/** Fetch a token of `type` for a session. */
export function token(s: Creds, type: string, container = CONTAINER): string {
  const j = call(s, `-d "action=query" -d "meta=tokens" -d "type=${type}"`, {}, container) as {
    query?: { tokens?: Record<string, string> };
  };
  return j.query?.tokens?.[`${type}token`] ?? "";
}

/** Two-step login for a session's jar; throws on failure. */
export function login(s: Creds, container = CONTAINER): void {
  shIn(container, `rm -f ${s.jar}`);
  const lt = token(s, "login", container);
  const j = call(
    s,
    `-d "action=login" --data-urlencode "lgname=$LG" --data-urlencode "lgpassword=$PW" --data-urlencode "lgtoken=$LT"`,
    { LG: s.user, PW: s.pass, LT: lt },
    container,
  ) as { login?: { result?: string } };
  if (j.login?.result !== "Success")
    throw new Error(`login(${s.user}) failed: ${JSON.stringify(j)}`);
}
