/**
 * Capture real `formatversion=2` responses for modules whose types are declared
 * but had no committed fixture, on the local 1.43 fixture wiki. Complements
 * `capture-write-fixtures.ts` (auth-gated write actions) and
 * `capture-ext-gaps.ts` (extension modules) — this one closes the remaining
 * "typed but never evidenced" gaps.
 *
 * Groups (positional; no argument = every group): `tempuser`, `import`,
 * `stashinfo`, `dt-activity` (1.46), `sbom` (1.46), `echo`, `blacklist`,
 * `edit-captcha`, `ext`, `authdata`, `exif`, `exif-gps`. Raw responses land in
 * `.mw-scratch/gaps/` for inspection before promotion into `tests/fixtures/`.
 *
 * Local bring-up, config and accounts: `scripts/container/README.md`.
 * Run: `pnpm exec tsx scripts/capture-coverage-gaps.ts [group...]`
 * Env: MW_CONTAINER / MW146_CONTAINER.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  call,
  callForm,
  CONTAINER,
  CONTAINER_146,
  type Creds,
  login,
  shIn as sh,
  SUF,
  token,
} from "./capture-client";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", ".mw-scratch", "gaps");
mkdirSync(OUT, { recursive: true });

const GROUPS = process.argv.slice(2);
const want = (group: string): boolean => GROUPS.length === 0 || GROUPS.includes(group);

const CAP: Creds = { jar: "/tmp/mwcap", user: "capadmin", pass: "CapAdminPass2026" };
const AUTH: Creds = { jar: "/tmp/mwauth", user: "authchg2", pass: "AuthChg2Pass2026" };
/** Documented starting password for authchg2. */
const AUTH_ORIG_PASS = AUTH.pass;
/** The new password set by the changeauthenticationdata flow. */
const AUTH_PASS_2 = "AuthChgNew2026x";
const CAP_146: Creds = { jar: "/tmp/mw146cap", user: "cap146", pass: "Cap146Pass2026" };

/** Write a raw response under .mw-scratch/gaps/ and echo a short summary. */
function emit(name: string, body: unknown): void {
  writeFileSync(join(OUT, name), JSON.stringify(body, null, 2));
  console.log(`[capture] ${name}:`, JSON.stringify(body).slice(0, 220));
}

/** Edit or create a wiki page; the content travels as a docker env var so
 * quoting stays intact. */
function editPage(s: Creds, title: string, text: string, container = CONTAINER): unknown {
  const t = token(s, "csrf", container);
  const r = call(
    s,
    `-d "action=edit" --data-urlencode "title=$TITLE" --data-urlencode "text=$TEXT" --data-urlencode "token=$TK" --data-urlencode "summary=fixture seed"`,
    { TITLE: title, TEXT: text, TK: t },
    container,
  ) as { edit?: { result?: string }; error?: unknown };
  if (r.edit?.result !== "Success") console.log(`  [seed] ${title} FAILED:`, JSON.stringify(r));
  return r;
}

/** Seed only when the current revision differs: re-saving identical content is
 * a no-change edit that does not bump the revision, so downstream caches (the
 * title blacklist message cache) would keep serving the pre-seed value. */
function ensurePage(s: Creds, title: string, text: string): unknown {
  const cur = call(
    s,
    `-d "action=query" --data-urlencode "titles=$TITLE" -d "prop=revisions" -d "rvprop=content" -d "rvslots=main" -d "rvlimit=1"`,
    { TITLE: title },
  ) as {
    query?: { pages?: { revisions?: { slots?: { main?: { content?: string } } }[] }[] };
  };
  const content = cur.query?.pages?.[0]?.revisions?.[0]?.slots?.main?.content;
  if (content === text) return undefined;
  return editPage(s, title, text);
}

async function main(): Promise<void> {
  // ------------------------------------------------------------- tempuser
  if (want("tempuser")) {
    sh(CONTAINER, "rm -f /tmp/anon-gap");
    const anon: Creds = { jar: "/tmp/anon-gap", user: "", pass: "" };
    const first = call(anon, `-d "action=acquiretempusername"`);
    emit("acquiretempusername.json", first);
    const second = call(anon, `-d "action=acquiretempusername"`);
    console.log("  repeat returns the stashed name:", JSON.stringify(second));
  }

  // --------------------------------------------------------------- import
  if (want("import")) {
    login(CAP);
    // Two pages in one dump: the valid one exercises ns/title/revisions, the
    // invalid title exercises the `invalid` flag branch.
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mediawiki xmlns="http://www.mediawiki.org/xml/export-0.11/" xml:lang="en">
  <siteinfo><sitename>FixtureWiki</sitename></siteinfo>
  <page>
    <title>Gap imported page</title>
    <ns>0</ns>
    <revision>
      <contributor><username>CapAdmin</username></contributor>
      <comment>fixture import</comment>
      <model>wikitext</model>
      <format>text/x-wiki</format>
      <text xml:space="preserve">Imported via action=import for fixture capture.</text>
    </revision>
  </page>
  <page>
    <title>Bad [title]</title>
    <ns>0</ns>
    <revision>
      <contributor><username>CapAdmin</username></contributor>
      <comment>fixture import</comment>
      <text xml:space="preserve">Not importable: invalid title.</text>
    </revision>
  </page>
</mediawiki>`;
    sh(CONTAINER, `cat > /tmp/import-gap.xml <<'XMLEOF'\n${xml}\nXMLEOF`);
    sh(CONTAINER, `printf '%s' "$TK" > /tmp/ct-gap.txt`, { TK: token(CAP, "csrf") });
    const body = callForm(
      CAP,
      // Upload imports require an interwikiprefix (attribution marker); it does
      // not rename the imported pages.
      `-F "action=import" -F "summary=fixture import" -F "interwikiprefix=fixture" -F "token=</tmp/ct-gap.txt" -F "xml=@/tmp/import-gap.xml"`,
    );
    emit("import.json", body);
  }

  // ------------------------------------------------------------- stashinfo
  if (want("stashinfo")) {
    login(CAP);
    // 1x1 PNG as base64 — same bytes capture-write-fixtures uses.
    const png =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    sh(CONTAINER, `printf '%s' "$PNG" | base64 -d > /tmp/fixture-gap.png`, { PNG: png });
    sh(CONTAINER, `printf '%s' "$TK" > /tmp/ct-gap.txt`, { TK: token(CAP, "csrf") });
    const up = callForm(
      CAP,
      `-F "action=upload" -F "filename=Gap stash $SUF.png" -F "comment=fixture stash" -F "stash=1" -F "token=</tmp/ct-gap.txt" -F "file=@/tmp/fixture-gap.png"`,
    ) as { upload?: { filekey?: string; result?: string } };
    console.log("  stash upload:", up.upload?.result, up.upload?.filekey);
    const key = up.upload?.filekey;
    if (key) {
      // Full siiprop set; siiurlwidth triggers the thumbnail keys (thumburl family).
      const sii = call(
        CAP,
        `-d "action=query" -d "prop=stashimageinfo" -d "siifilekey=$KEY" -d "siiprop=timestamp|canonicaltitle|url|size|dimensions|sha1|mime|thumbmime|bitdepth|badfile|metadata|commonmetadata|extmetadata" -d "siiurlwidth=16"`,
        { KEY: key },
      );
      emit("stashimageinfo-url.json", sii);
    }
  }

  // ------------------------------------------------------------ dt-activity
  if (want("dt-activity")) {
    // `prop=threaditemshtml` activity fields (@1.45/@1.46): heading
    // commentCount / authorCount / latestReplyTimestamp / latestReply /
    // oldestReply. Needs a talk page with comments from two authors — CAP_146
    // seeds the topic, the dtpeer account (createAndPromote on mw146) appends
    // the second comment, and PST expands each `~~~~` at save time.
    login(CAP_146, CONTAINER_146);
    const topic = "Talk:Thread activity probe";
    editPage(CAP_146, topic, "== Fixture topic ==\n\nFirst comment here. --~~~~\n", CONTAINER_146);
    // The peer must append on its own paragraph (a single newline would merge
    // both lines into one comment item), and the first comment's signature was
    // already expanded by PST — so carry the stored wikitext verbatim and
    // normalize its trailing newlines into a paragraph break.
    const cur = call(
      CAP_146,
      `-d "action=query" -d "prop=revisions" -d "rvprop=content" -d "rvslots=main" --data-urlencode "titles=$TITLE"`,
      { TITLE: topic },
      CONTAINER_146,
    ) as {
      query?: {
        pages?: { revisions?: { slots?: { main?: { content?: string } } }[] }[];
      };
    };
    const wikitext = cur.query?.pages?.[0]?.revisions?.[0]?.slots?.main?.content ?? "";
    if (wikitext.includes("User:Dtpeer")) {
      console.log("  [seed] dt-activity already has both authors; skipping");
    } else {
      const peer: Creds = { jar: "/tmp/mw146peer", user: "dtpeer", pass: "DtPeerPass2026" };
      login(peer, CONTAINER_146);
      editPage(
        peer,
        topic,
        `${wikitext.replace(/\n*$/, "\n\n")}Second comment from another author. --~~~~\n`,
        CONTAINER_146,
      );
    }
    emit(
      "discussiontoolspageinfo-activity.json",
      call(
        CAP_146,
        `-d "action=discussiontoolspageinfo" --data-urlencode "page=$TITLE" -d "prop=threaditemshtml" -d "threaditemsflags=activity"`,
        { TITLE: topic },
        CONTAINER_146,
      ),
    );
  }

  // ------------------------------------------------------------------ sbom
  if (want("sbom")) {
    login(CAP_146, CONTAINER_146);
    const r = call(
      CAP_146,
      `-d "action=query" -d "meta=siteinfo" -d "siprop=sbom"`,
      {},
      CONTAINER_146,
    );
    emit("siteinfo-sbom.json", r);
  }

  // ------------------------------------------------------------------ echo
  if (want("echo")) {
    login(CAP);
    const r = call(
      CAP,
      `-d "action=echocreateevent" --data-urlencode "user=$ECUSER" --data-urlencode "header=Fixture event $SUF" --data-urlencode "content=Created by capture-coverage-gaps.ts." --data-urlencode "page=Main Page" -d "section=notice" --data-urlencode "token=$TK"`,
      { ECUSER: CAP.user, TK: token(CAP, "csrf") },
    );
    emit("echocreateevent.json", r);
  }

  // -------------------------------------------------------------- blacklist
  if (want("blacklist")) {
    login(CAP);
    // Seed the on-wiki title blacklist (message source per mw-gap.php).
    ensurePage(CAP, "MediaWiki:Titleblacklist", ".*[Bb]adtitle.* # fixture capture line\n");
    // Probe anonymously: sysops hold `tboverride`, and the module reports `ok`
    // for them regardless of the blacklist.
    const anon: Creds = { jar: "/tmp/anon-blacklist", user: "", pass: "" };
    sh(CONTAINER, "rm -f /tmp/anon-blacklist");
    emit(
      "spamblacklist-hit.json",
      call(anon, `-d "action=spamblacklist" -d "url=http://badhost.example/wiki/Fixture"`),
    );
    // The message cache can lag behind a fresh seed; retry until the hit shows.
    for (let i = 0; ; i++) {
      const tb = call(
        anon,
        `-d "action=titleblacklist" --data-urlencode "tbtitle=Foo badtitle" --data-urlencode "tbaction=create"`,
      ) as { titleblacklist?: { result?: string } };
      if (tb.titleblacklist?.result === "blacklisted" || i >= 5) {
        emit("titleblacklist-hit.json", tb);
        break;
      }
      sh(CONTAINER, "sleep 3");
    }
  }

  // ---------------------------------------------------------- edit-captcha
  if (want("edit-captcha")) {
    // In-band `result: "Failure"`: ConfirmEdit aborts an anonymous edit with a
    // captcha challenge (`AS_HOOK_ERROR_EXPECTED` + statusData, which
    // ApiEditPage serializes as the whole `edit` object). Sysops hold
    // `skipcaptcha`, so this must go through an anonymous session. The captcha
    // id/question are random per request; the fixture pins a capture-time sample.
    const anon: Creds = { jar: "/tmp/anon-captcha", user: "", pass: "" };
    sh(CONTAINER, "rm -f /tmp/anon-captcha");
    const t = token(anon, "csrf");
    emit(
      "edit-captcha-failure.json",
      call(
        anon,
        `-d "action=edit" --data-urlencode "title=$TITLE" --data-urlencode "text=$TEXT" --data-urlencode "token=$TK"`,
        { TITLE: `Captcha failure probe ${SUF}`, TEXT: "captcha probe content", TK: t },
      ),
    );
  }

  // -------------------------------------------------------------------- ext
  if (want("ext")) {
    login(CAP);
    // Seed pages whose content drives the module shapes.
    editPage(
      CAP,
      "Template:Gap template",
      `<templatedata>
{
  "description": "Fixture template for templatedata capture.",
  "format": "inline",
  "params": {
    "name": {
      "label": "Name",
      "description": "First name of the subject.",
      "type": "string",
      "required": true,
      "suggested": true,
      "aliases": ["first"],
      "example": "Ada"
    },
    "count": {
      "label": "Count",
      "type": "number",
      "default": "1",
      "deprecated": true
    }
  },
  "maps": { "thingy": { "name": "name" } }
}
</templatedata>`,
    );
    // Section titles cannot contain spaces (Gadgets' section regex is
    // `[^*:\s|]+`); a spaced title silently lands in the "" category.
    editPage(
      CAP,
      "MediaWiki:Gadgets-definition",
      "== gapsection ==\n* gaptools[ResourceLoader|default|package|rights=edit]|gaptools.js\n* gapsecret[ResourceLoader|hidden]|gapsecret.js\n",
    );
    editPage(CAP, "MediaWiki:Gadget-gaptools.js", "/* fixture gadget */\n");
    editPage(CAP, "MediaWiki:Gadget-gapsecret.js", "/* hidden fixture gadget */\n");
    // A mix of enabled Linter categories: self-closed-tag, fostered,
    // duplicate-ids, missing-end-tag. (obsolete-tag no longer records in 1.43.)
    editPage(
      CAP,
      "Gap lint page",
      '<div/>self closed\n<table><span>fostered content</span><tr><td>cell</td></tr></table>\n<span id="gapdup">one</span>\n<span id="gapdup">two</span>\n<div><span>missing end</div>\n',
    );
    editPage(CAP, "Category:Gap category", "Fixture category.\n");
    editPage(CAP, "Gap member one", "[[Category:Gap category]]\n");
    editPage(CAP, "Gap member two", "[[Category:Gap category]]\n");
    editPage(CAP, "Gap discuss", "Fixture subject page.\n");
    editPage(
      CAP,
      "Talk:Gap discuss",
      "== Fixture topic ==\nA signed comment. --~~~~\n: A reply. --~~~~\n",
    );
    // Core-parser edits never lint: re-render through ParsoidParser so the
    // ParserLogLinterData hook enqueues RecordLintJob, then drain the queue.
    // (scripts/container/mw-lint-gap.php is docker-cp'd in on first use.)
    try {
      sh(CONTAINER, `test -f /var/www/html/mw-lint-gap.php`);
    } catch {
      execFileSync("docker", [
        "cp",
        join(dirname(fileURLToPath(import.meta.url)), "container", "mw-lint-gap.php"),
        "mw-fixture:/var/www/html/mw-lint-gap.php",
      ]);
    }
    sh(CONTAINER, `php /var/www/html/mw-lint-gap.php "Gap lint page"`);
    sh(CONTAINER, `php maintenance/runJobs.php --maxjobs 20 --nothrottle`);

    emit(
      "templatedata.json",
      call(CAP, `-d "action=templatedata" --data-urlencode "titles=Template:Gap template"`),
    );
    emit(
      "gadgets.json",
      call(CAP, `-d "action=query" -d "list=gadgets" -d "gaprop=id|metadata|desc"`),
    );
    emit(
      "gadgetcategories.json",
      call(CAP, `-d "action=query" -d "list=gadgetcategories" -d "gcprop=name|title|members"`),
    );
    emit(
      "linterrors.json",
      call(
        CAP,
        `-d "action=query" -d "list=linterrors" -d "lntcategories=self-closed-tag" -d "lntlimit=10"`,
      ),
    );
    emit("linterstats.json", call(CAP, `-d "action=query" -d "meta=linterstats"`));
    emit(
      "categorytree.json",
      call(
        CAP,
        `-d "action=categorytree" --data-urlencode "category=$CAT" --data-urlencode "options=$OPTS"`,
        { CAT: "Gap category", OPTS: '{"mode":"all","depth":2}' },
      ),
    );
    emit(
      "discussiontoolspageinfo.json",
      call(
        CAP,
        `-d "action=discussiontoolspageinfo" --data-urlencode "page=Talk:Gap discuss" -d "prop=threaditemshtml|transcludedfrom"`,
      ),
    );
    emit(
      "visualeditor.json",
      call(CAP, `-d "action=visualeditor" --data-urlencode "page=Gap discuss" -d "paction=parse"`),
    );
  }

  // --------------------------------------------------------------- authdata
  if (want("authdata")) {
    // Throwaway account: the change below invalidates its sessions and the
    // removal blanks its password. Both responses share the generic
    // {<module>:{status:"success"}} shape.
    //
    // Runs from the HOST (port 8080), not inside the container: the in-container
    // source IP was throttled by LoginThrottle after repeated failed debug
    // logins, and the throttle disguises itself as "Incorrect username or
    // password" — see the dev-docs pitfall list. Host-side requests come from a
    // different source IP with its own bucket.
    const { request: httpRequest } = await import("node:http");
    const cookies = new Map<string, string>();
    const hostCall = (post: string) =>
      new Promise<unknown>((resolve, reject) => {
        const body = new URLSearchParams(post).toString();
        const req = httpRequest(
          {
            host: "localhost",
            port: 8080,
            path: "/api.php",
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Content-Length": Buffer.byteLength(body),
              Cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join("; "),
            },
          },
          (res) => {
            for (const h of res.headers["set-cookie"] ?? []) {
              const [kv] = h.split(";");
              if (kv === undefined) continue;
              const i = kv.indexOf("=");
              cookies.set(kv.slice(0, i), kv.slice(i + 1));
            }
            let data = "";
            res.on("data", (c) => (data += c));
            res.on("end", () => {
              try {
                resolve(JSON.parse(data));
              } catch {
                resolve({ RAW: data });
              }
            });
          },
        );
        req.on("error", reject);
        req.end(body);
      });
    const hostToken = async (type: string): Promise<string> => {
      const j = (await hostCall(
        `action=query&meta=tokens&type=${type}&format=json&formatversion=2`,
      )) as {
        query?: { tokens?: Record<string, string> };
      };
      return j.query?.tokens?.[`${type}token`] ?? "";
    };
    const hostLogin = async (): Promise<void> => {
      cookies.clear();
      const lt = await hostToken("login");
      const j = (await hostCall(
        `action=login&format=json&formatversion=2&lgname=${encodeURIComponent(AUTH.user)}&lgpassword=${encodeURIComponent(AUTH.pass)}&lgtoken=${encodeURIComponent(lt)}`,
      )) as { login?: { result?: string } };
      if (j.login?.result !== "Success")
        throw new Error(`login(${AUTH.user}) failed: ${JSON.stringify(j)}`);
    };

    await hostLogin();
    const authRequest = "MediaWiki\\Auth\\PasswordAuthenticationRequest";
    // The modules do not override ApiBase::getToken(), so despite the
    // `changeauthtoken`/`removeauthtoken` parameter names the value is a plain
    // csrf token (`meta=tokens&type=changeauth` returns nothing).
    const csrf = await hostToken("csrf");
    const changed = (await hostCall(
      `action=changeauthenticationdata&format=json&formatversion=2&changeauthrequest=${encodeURIComponent(authRequest)}` +
        `&password=${encodeURIComponent(AUTH_PASS_2)}&retype=${encodeURIComponent(AUTH_PASS_2)}` +
        `&changeauthtoken=${encodeURIComponent(csrf)}`,
    )) as { changeauthenticationdata?: { status?: string } };
    emit("changeauthenticationdata.json", changed);
    if (changed.changeauthenticationdata?.status !== "success") {
      throw new Error("changeauthenticationdata did not succeed; skipping removal");
    }
    // The password change drops this session; re-login with the new password.
    AUTH.pass = AUTH_PASS_2;
    await hostLogin();
    // Unlike changeauthenticationdata, this module's parameters are unprefixed.
    const removed = await hostCall(
      `action=removeauthenticationdata&format=json&formatversion=2&request=${encodeURIComponent(authRequest)}` +
        `&token=${encodeURIComponent(await hostToken("csrf"))}`,
    );
    emit("removeauthenticationdata.json", removed);
    // The throwaway account now has its password removed; restore the
    // documented original via maintenance so the flow stays re-runnable.
    sh(
      CONTAINER,
      `php maintenance/createAndPromote.php --force authchg2 "$PW" authchg2@example.invalid`,
      { PW: AUTH_ORIG_PASS },
    );
  }
}

main();

// -------------------------------------------------------------------- exif
if (want("exif")) {
  login(CAP);
  // A 64x48 JPEG with a real IFD0 EXIF block (System.Drawing template bytes +
  // a hand-built APP1/Exif segment). The Exif sub-IFD is left out: hand-built
  // sub-IFD pointers trip php-ext-exif's "Illegal IFD size" validation, while
  // IFD0 alone already carries the Make/Model/Software/DateTime tag set.
  // Needs the exif PHP extension in the container (`docker-php-ext-install exif`).
  const template = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "container", "gap-template.jpg"),
  );

  const ascii = (s: string): Buffer => Buffer.concat([Buffer.from(s, "latin1"), Buffer.from([0])]);
  const rational = (num: number, den: number): Buffer => {
    const b = Buffer.alloc(8);
    b.writeUInt32LE(num, 0);
    b.writeUInt32LE(den, 4);
    return b;
  };
  const short = (n: number): Buffer => {
    const b = Buffer.alloc(2);
    b.writeUInt16LE(n, 0);
    return b;
  };
  const TYPE_SIZE: Record<number, number> = { 2: 1, 3: 2, 5: 8 };
  function buildIfd(entries: [number, number, Buffer][], ifdOffset: number): Buffer {
    const tableSize = 2 + entries.length * 12 + 4;
    let heapOffset = ifdOffset + tableSize;
    const rows: Buffer[] = [];
    const heap: Buffer[] = [];
    for (const [tag, type, value] of entries) {
      const row = Buffer.alloc(12);
      row.writeUInt16LE(tag, 0);
      row.writeUInt16LE(type, 2);
      row.writeUInt32LE(value.length / TYPE_SIZE[type]!, 4);
      if (value.length <= 4) {
        value.copy(row, 8);
      } else {
        row.writeUInt32LE(heapOffset, 8);
        heap.push(value);
        if (value.length % 2) heap.push(Buffer.alloc(1)); // pad to even, or later offsets drift
        heapOffset += value.length + (value.length % 2);
      }
      rows.push(row);
    }
    const count = Buffer.alloc(2);
    count.writeUInt16LE(entries.length, 0);
    return Buffer.concat([count, ...rows, Buffer.alloc(4), ...heap]);
  }
  const tiffHeader = Buffer.alloc(8);
  tiffHeader.write("II*\0", 0, "latin1");
  tiffHeader.writeUInt32LE(8, 4);
  const tiff = Buffer.concat([
    tiffHeader,
    buildIfd(
      [
        [0x010f, 2, ascii("FixtureCam")], // Make
        [0x0110, 2, ascii("Model X-1")], // Model
        [0x0112, 3, short(1)], // Orientation
        [0x011a, 5, rational(72, 1)], // XResolution
        [0x011b, 5, rational(72, 1)], // YResolution
        [0x0128, 3, short(2)], // ResolutionUnit inch
        [0x0131, 2, ascii("capture-coverage-gaps 1.0")], // Software
        [0x0132, 2, ascii("2024:01:15 12:00:00")], // DateTime
        [0x0213, 3, short(1)], // YCbCrPositioning centered
      ],
      8,
    ),
  ]);
  const exifPayload = Buffer.concat([Buffer.from("Exif\0\0", "latin1"), tiff]);
  const app1 = Buffer.alloc(4 + exifPayload.length);
  app1.writeUInt16BE(0xffe1, 0);
  app1.writeUInt16BE(exifPayload.length + 2, 2);
  exifPayload.copy(app1, 4);
  let insertAt = 2;
  if (template[2] === 0xff && template[3] === 0xe0) insertAt = 2 + 2 + template.readUInt16BE(4);
  const withExif = Buffer.concat([
    template.subarray(0, insertAt),
    app1,
    template.subarray(insertAt),
  ]);

  sh(CONTAINER, `printf '%s' "$JPG" | base64 -d > /tmp/gap-exif.jpg`, {
    JPG: withExif.toString("base64"),
  });
  sh(CONTAINER, `printf '%s' "$TK" > /tmp/ct-gap.txt`, { TK: token(CAP, "csrf") });
  // File metadata is extracted once at upload time; delete a previous run's
  // version so the (now exif-enabled) handler re-reads it.
  const del = call(
    CAP,
    `-d "action=delete" --data-urlencode "title=File:Gap exif.jpg" --data-urlencode "token=$TK"`,
    { TK: token(CAP, "csrf") },
  ) as { error?: unknown; delete?: unknown };
  if (del.error) console.log("  delete note:", JSON.stringify(del).slice(0, 160));
  const up = callForm(
    CAP,
    `-F "action=upload" -F "filename=Gap exif.jpg" -F "comment=fixture exif" -F "ignorewarnings=1" -F "token=</tmp/ct-gap.txt" -F "file=@/tmp/gap-exif.jpg"`,
  ) as { upload?: { result?: string } };
  console.log("  exif upload:", JSON.stringify(up).slice(0, 300));
  const info = call(
    CAP,
    `-d "action=query" -d "prop=imageinfo" --data-urlencode "titles=File:Gap exif.jpg" -d "iiprop=timestamp|user|userid|canonicaltitle|url|size|dimensions|sha1|mime|mediatype|bitdepth|metadata|commonmetadata|extmetadata"`,
  );
  emit("imageinfo-exif.json", info);
}

// --------------------------------------------------------------- exif-gps
if (want("exif-gps")) {
  login(CAP);
  // Rich EXIF sample: exiftool (installed in the container via
  // `apt-get install libimage-exiftool-perl`) writes proper GPS / Exif
  // sub-IFDs that php-ext-exif accepts, which the hand-built APP1 in the
  // `exif` group cannot (sub-IFD pointers trip its "Illegal IFD size"
  // validation). File metadata is extracted once at upload time, so a
  // previous run's version is deleted first.
  sh(CONTAINER, "rm -f /tmp/gap-exif-gps.jpg");
  execFileSync("docker", [
    "cp",
    join(dirname(fileURLToPath(import.meta.url)), "container", "gap-template.jpg"),
    `${CONTAINER}:/tmp/gap-exif-gps.jpg`,
  ]);
  sh(
    CONTAINER,
    `exiftool -overwrite_original ` +
      `-DateTimeOriginal="2024:01:15 12:00:00" -CreateDate="2024:01:15 12:00:00" ` +
      `-ExposureTime="1/250" -FNumber=2.8 -ISO=200 -FocalLength=24 -FocalLengthIn35mmFormat=36 ` +
      `-LensInfo="24-70mm f/2.8" -LensMake=FixtureCam -LensModel="Fixture 24-70mm f/2.8" ` +
      `-GPSLatitude=48.8566 -GPSLatitudeRef=N -GPSLongitude=2.3522 -GPSLongitudeRef=E ` +
      `-GPSAltitude=35 -GPSAltitudeRef="Above Sea Level" -GPSImgDirection=180 -GPSImgDirectionRef=M ` +
      `-Artist="Fixture Author" -Copyright="Fixture Copyright" -ImageDescription="Fixture GPS sample" ` +
      `/tmp/gap-exif-gps.jpg`,
  );
  sh(CONTAINER, `printf '%s' "$TK" > /tmp/ct-gap-gps.txt`, { TK: token(CAP, "csrf") });
  const delGps = call(
    CAP,
    `-d "action=delete" --data-urlencode "title=File:Gap exif gps.jpg" --data-urlencode "token=$TK"`,
    { TK: token(CAP, "csrf") },
  ) as { error?: unknown; delete?: unknown };
  if (delGps.error) console.log("  delete note:", JSON.stringify(delGps).slice(0, 160));
  const upGps = callForm(
    CAP,
    `-F "action=upload" -F "filename=Gap exif gps.jpg" -F "comment=fixture exif gps" -F "ignorewarnings=1" -F "token=</tmp/ct-gap-gps.txt" -F "file=@/tmp/gap-exif-gps.jpg"`,
  ) as { upload?: { result?: string } };
  console.log("  exif-gps upload:", JSON.stringify(upGps).slice(0, 300));
  const infoGps = call(
    CAP,
    `-d "action=query" -d "prop=imageinfo" --data-urlencode "titles=File:Gap exif gps.jpg" -d "iiprop=timestamp|user|userid|canonicaltitle|url|size|dimensions|sha1|mime|mediatype|bitdepth|metadata|commonmetadata|extmetadata"`,
  );
  emit("imageinfo-exif-gps.json", infoGps);
}
