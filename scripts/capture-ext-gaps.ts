/**
 * Capture real `formatversion=2` responses for commonly-used **extension** API
 * modules on the local 1.43 fixture wiki. Exploratory: dumps raw responses
 * under `.mw-scratch/ext/` for inspection before promotion into
 * `tests/fixtures/extensions/`.
 *
 * Groups (positional; no argument = every group):
 * - `legacy`: Thanks, Echo, TitleBlacklist, SpamBlacklist.
 * - `more`: SiteMatrix, CheckUser, OATHAuth, TimedMediaHandler, MassMessage,
 *   UrlShortener, GlobalPreferences, WikiLove.
 *
 * Local bring-up, config and accounts: `scripts/container/README.md`.
 * Run: `pnpm exec tsx scripts/capture-ext-gaps.ts [group...]`
 * Env: MW_CONTAINER (default `mw-fixture`).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { API, call, type Creds, login, sh, SUF, token } from "./capture-client";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", ".mw-scratch", "ext");
mkdirSync(OUT, { recursive: true });

const GROUPS = process.argv.slice(2);
const want = (group: string): boolean => GROUPS.length === 0 || GROUPS.includes(group);

const CAP: Creds = { jar: "/tmp/mwcap", user: "capx", pass: "CapXPass2026" };
const ED: Creds = { jar: "/tmp/mwed", user: "peerx", pass: "PeerXPass2026" };

function dump(name: string, body: unknown): void {
  writeFileSync(join(OUT, `${name}.json`), `${JSON.stringify(body, null, 2)}\n`, "utf8");
  console.log(`[ext] ${name}`);
}

login(CAP);
login(ED);
const CT = token(CAP, "csrf");
const EDT = token(ED, "csrf");

const edit = (s: Creds, title: string, text: string, tk: string): number | undefined => {
  call(
    s,
    `--data-urlencode "token=$T" -d "action=edit" --data-urlencode "title=$TI" --data-urlencode "text=$X"`,
    {
      T: tk,
      TI: title,
      X: text,
    },
  );
  const q = call(
    s,
    `-d "action=query" -d "prop=revisions" -d "rvprop=ids" --data-urlencode "titles=$TI"`,
    {
      TI: title,
    },
  ) as { query?: { pages?: { revisions?: { revid?: number }[] }[] } };
  return q.query?.pages?.[0]?.revisions?.[0]?.revid;
};

// ---------------------------------------------------------------------------
// legacy group
// ---------------------------------------------------------------------------

if (want("legacy")) {
  // --- Thanks: peerx edits a page; capx thanks that revision. ---
  const edRev = edit(ED, `Ext thank ed ${SUF}`, "content by peerx", EDT);
  if (edRev) {
    dump(
      "thank",
      call(CAP, `--data-urlencode "token=$CT" -d "action=thank" -d "rev=$R" -d "source=fixture"`, {
        CT,
        R: String(edRev),
      }),
    );
  } else console.log("[ext] thank skipped (no ed revid)");

  // --- Echo: capadmin marks notifications seen / read. ---
  dump(
    "echomarkseen",
    call(CAP, `-d "action=echomarkseen" -d "type=all" -d "timestampFormat=ISO_8601"`),
  );
  dump(
    "echomarkread",
    call(CAP, `--data-urlencode "token=$CT" -d "action=echomarkread" -d "all=1"`, { CT }),
  );

  // --- TitleBlacklist: define a rule, then test a matching + a clean title. ---
  edit(
    CAP,
    "MediaWiki:Titleblacklist",
    `.*GapBlocked.* <edit-abuse description="Gap fixture blacklist" />`,
    CT,
  );
  dump(
    "titleblacklist-matched",
    call(
      CAP,
      `-d "action=titleblacklist" --data-urlencode "tbtitle=GapBlockedPage" -d "tbaction=edit"`,
    ),
  );
  dump(
    "titleblacklist-ok",
    call(CAP, `-d "action=titleblacklist" --data-urlencode "tbtitle=FineTitle" -d "tbaction=edit"`),
  );

  // --- SpamBlacklist: $wgSpamBlacklistLines has 'spam[./]' (see mw-misc.php). ---
  dump(
    "spamblacklist-blacklisted",
    call(CAP, `-d "action=spamblacklist" -d "url=http://spam.example.com/x"`),
  );
  dump(
    "spamblacklist-ok",
    call(CAP, `-d "action=spamblacklist" -d "url=http://news.example.org/x"`),
  );
}

// ---------------------------------------------------------------------------
// more group
// ---------------------------------------------------------------------------

if (want("more")) {
  // --- SiteMatrix: fabricated farm matrix (mw-more2.php), anonymously readable. ---
  dump("sitematrix", call(CAP, `-d "action=sitematrix"`));

  // --- UrlShortener: shorten a stable external URL (id derives from the URL hash). ---
  dump(
    "shortenurl",
    call(
      CAP,
      `-d "action=shortenurl" --data-urlencode "url=https://www.mediawiki.org/wiki/Special:MyLanguage/API:Main_page"`,
    ),
  );

  // --- CheckUser: a fresh capx edit feeds the lookups (peerx is captcha-gated by
  // mw-more.php's ConfirmEdit triggers); every check appends cu_log, which in turn
  // feeds list=checkuserlog below. ---
  edit(CAP, `Ext cu ed ${SUF}`, "checkuser fixture edit", CT);
  dump(
    "checkuser-actions",
    call(
      CAP,
      `--data-urlencode "cutoken=$CT" -d "action=query" -d "list=checkuser" -d "curequest=actions" --data-urlencode "cutarget=Capx" --data-urlencode "cureason=fixture check"`,
      { CT },
    ),
  );
  dump(
    "checkuser-userips",
    call(
      CAP,
      `--data-urlencode "cutoken=$CT" -d "action=query" -d "list=checkuser" -d "curequest=userips" --data-urlencode "cutarget=Capx" --data-urlencode "cureason=fixture check"`,
      { CT },
    ),
  );
  dump(
    "checkuser-ipusers",
    call(
      CAP,
      `--data-urlencode "cutoken=$CT" -d "action=query" -d "list=checkuser" -d "curequest=ipusers" --data-urlencode "cutarget=127.0.0.1" --data-urlencode "cureason=fixture check"`,
      { CT },
    ),
  );
  dump(
    "checkuserlog",
    call(CAP, `-d "action=query" -d "list=checkuserlog" -d "culuser=Capx" -d "cullimit=5"`),
  );

  // --- OATHAuth: enroll a dedicated user (never logs in, so 2FA cannot wedge the
  // capture script), then query status + validate a freshly computed TOTP. ---
  // The account must exist (central id lookup); create it once.
  sh(
    `php /var/www/html/maintenance/createAndPromote.php --conf /var/www/html/LocalSettings.php Oathx OathXPass2026 2>&1 | grep -vE "exists|created" || true`,
  );
  const phpEnroll = `
		<?php
		use MediaWiki\\Extension\\OATHAuth\\Key\\TOTPKey;
		use MediaWiki\\Extension\\OATHAuth\\OATHAuthServices;
		use MediaWiki\\Extension\\OATHAuth\\OATHUser;
		use MediaWiki\\MediaWikiServices;
		class ApxOathEnroll extends Maintenance {
			public function execute() {
				$services = MediaWikiServices::getInstance();
				$user = $services->getUserFactory()->newFromName( 'Oathx' );
				$oathServices = OATHAuthServices::getInstance( $services );
				$repo = $oathServices->getUserRepository();
				$oathUser = $repo->findByUser( $user );
				if ( $oathUser === false ) {
					$centralId = $services->getCentralIdLookupFactory()->getLookup()
						->centralIdFromLocalUser( $user );
					$oathUser = new OATHUser( $user, $centralId );
				}
				$hasTotp = false;
				foreach ( $oathUser->getKeys() as $key ) {
					if ( $key instanceof TOTPKey ) {
						$hasTotp = true;
					}
				}
				if ( !$hasTotp ) {
					$oathUser->addKey( TOTPKey::newFromRandom() );
					$repo->persist( $oathUser, 'fixture-script' );
				}
				$oathUser = $repo->findByUser( $user );
				$secret = null;
				foreach ( $oathUser->getKeys() as $key ) {
					if ( $key instanceof TOTPKey ) {
						$secret = $key->getSecret();
					}
				}
				if ( $secret === null ) {
					$this->fatalError( 'no TOTP key found' );
				}
				$binary = Base32\\Base32::decode( $secret );
				$counter = (int)floor( time() / 30 );
				$hash = hash_hmac( 'sha1', pack( 'N', 0 ) . pack( 'N', $counter ), $binary, true );
				$offset = ord( substr( $hash, -1 ) ) & 0xF;
				$value = ( ( ord( $hash[$offset] ) & 0x7F ) << 24 )
					| ( ( ord( $hash[$offset + 1] ) & 0xFF ) << 16 )
					| ( ( ord( $hash[$offset + 2] ) & 0xFF ) << 8 )
					| ( ord( $hash[$offset + 3] ) & 0xFF );
				$this->output( str_pad( (string)( $value % 1000000 ), 6, '0', STR_PAD_LEFT ) . "\\n" );
			}
		}
		$maintClass = ApxOathEnroll::class;
	`;
  sh(`cat > /tmp/ApxOathEnroll.php << "PHPEOF"\n${phpEnroll}\nPHPEOF`);
  const totp = sh(
    `php /var/www/html/maintenance/run.php /tmp/ApxOathEnroll.php --conf /var/www/html/LocalSettings.php`,
  ).trim();
  if (!/^\d{6}$/.test(totp)) throw new Error(`TOTP computation failed: ${totp}`);
  dump("oath", call(CAP, `-d "action=query" -d "meta=oath" --data-urlencode "oathuser=Oathx"`));
  dump(
    "oathvalidate",
    call(
      CAP,
      `--data-urlencode "token=$CT" -d "action=oathvalidate" --data-urlencode "user=Oathx" --data-urlencode "data=$DATA"`,
      { CT, DATA: JSON.stringify({ token: totp }) },
    ),
  );

  // --- TimedMediaHandler: render a small webm, upload it, run the transcode
  // jobs, then capture the four read/reset modules (status before reset!). ---
  const videoFile = `ApxFixture${SUF}.webm`;
  sh(
    `ffmpeg -y -loglevel error -f lavfi -i testsrc=duration=2:size=160x120:rate=10 -c:v libvpx -b:v 100k "/tmp/${videoFile}"`,
  );
  sh(`printf '%s' "$CT" > /tmp/apx-ct.txt`, { CT });
  dump(
    "upload-video",
    JSON.parse(
      sh(
        `curl -s -c /tmp/mwcap -b /tmp/mwcap -F "action=upload" -F "format=json" -F "formatversion=2" --form-string "filename=${videoFile}" -F "file=@/tmp/${videoFile};type=video/webm" -F "token=</tmp/apx-ct.txt" -F "ignorewarnings=1" "${API}"`,
      ),
    ),
  );
  sh(
    `php /var/www/html/maintenance/runJobs.php --conf /var/www/html/LocalSettings.php --maxjobs=80 --nothrottle`,
  );
  // A TimedText subtitle page for the video, captured BEFORE videoinfo so its
  // `timedtext` prop shows a real track. action=timedtext itself returns the raw
  // subtitle text through ApiFormatRaw (no JSON body, nothing to model), so it
  // is only exercised here, not captured.
  edit(
    CAP,
    `TimedText:${videoFile}.en.srt`,
    "1\n00:00:00,000 --> 00:00:01,000\nFixture subtitle\n",
    CT,
  );
  sh(
    `curl -s -c /tmp/mwcap -b /tmp/mwcap -d "action=timedtext" --data-urlencode "title=File:${videoFile}" -d "trackformat=srt" -d "lang=en" "${API}" | head -c 120`,
  );
  dump(
    "videoinfo",
    call(
      CAP,
      `-d "action=query" -d "prop=videoinfo" --data-urlencode "titles=File:${videoFile}" -d "viprop=timestamp|user|userid|size|dimensions|url|mime|mediatype|sha1|bitdepth|canonicaltitle|derivatives|timedtext" -d "viurlwidth=320"`,
    ),
  );
  dump(
    "transcodestatus",
    call(
      CAP,
      `-d "action=query" -d "prop=transcodestatus" --data-urlencode "titles=File:${videoFile}"`,
    ),
  );
  dump(
    "transcodereset",
    call(
      CAP,
      `--data-urlencode "token=$CT" -d "action=transcodereset" --data-urlencode "title=File:${videoFile}"`,
      { CT },
    ),
  );

  // --- MassMessage: create a delivery list (MassMessageListContent), edit it via
  // the API, read it back with prop=mmcontent, then deliver to its targets. ---
  // User talk:Peerx is pre-created so the list shows one existing and one
  // missing local target (the `missing` marker), plus an invalid-site add
  // exercising `invalidadd`.
  edit(CAP, "User_talk:Peerx", "fixture setup", CT);
  const spamlist = `Project:Fixture delivery list ${SUF}`;
  call(
    CAP,
    `--data-urlencode "token=$CT" -d "action=edit" --data-urlencode "title=$TI" -d "contentmodel=MassMessageListContent" --data-urlencode "text=$X" -d "summary=fixture list"`,
    {
      CT,
      TI: spamlist,
      X: JSON.stringify({ description: "Fixture delivery list", targets: [] }),
    },
  );
  dump(
    "editmassmessagelist",
    call(
      CAP,
      // Multi values are pipe-separated; the bogus `@site` target exercises
      // `invalidadd` (which flips `result` to "Done"), the changed description
      // adds the `description` key, and the nonexistent local target gets `missing`.
      `--data-urlencode "token=$CT" -d "action=editmassmessagelist" --data-urlencode "spamlist=$TI" --data-urlencode "add=User talk:Peerx|User talk:Oathx|User talk:Fixture missing ${SUF}|User talk:MissingUser@example.org" --data-urlencode "description=Fixture delivery list (edited)"`,
      { CT, TI: spamlist },
    ),
  );
  dump(
    "mmcontent",
    call(CAP, `-d "action=query" -d "prop=mmcontent" --data-urlencode "titles=$TI"`, {
      TI: spamlist,
    }),
  );
  dump(
    "massmessage",
    call(
      CAP,
      `--data-urlencode "token=$CT" -d "action=massmessage" --data-urlencode "spamlist=$TI" --data-urlencode "subject=Fixture subject" --data-urlencode "message=Fixture message body."`,
      { CT, TI: spamlist },
    ),
  );

  // --- GlobalPreferences: globalize one pref, locally override it, read both back. ---
  dump(
    "globalpreferences-change",
    call(
      CAP,
      `--data-urlencode "token=$CT" -d "action=globalpreferences" -d "change=gender=male"`,
      { CT },
    ),
  );
  dump(
    "globalpreferenceoverrides-change",
    call(
      CAP,
      `--data-urlencode "token=$CT" -d "action=globalpreferenceoverrides" -d "change=gender=female"`,
      { CT },
    ),
  );
  dump(
    "globalpreferences",
    call(
      CAP,
      `-d "action=query" -d "meta=globalpreferences" -d "gprprop=preferences|localoverrides"`,
    ),
  );

  // --- WikiLove: leave a message on Oathx's talk page. ---
  dump(
    "wikilove",
    call(
      CAP,
      `--data-urlencode "token=$CT" -d "action=wikilove" --data-urlencode "title=User:Oathx" --data-urlencode "subject=Fixture love" --data-urlencode "text=Fixture wikilove message" -d "type=fixture" --data-urlencode "message=Fixture message"`,
      { CT },
    ),
  );
}

console.log("[ext] done — see .mw-scratch/ext/");
