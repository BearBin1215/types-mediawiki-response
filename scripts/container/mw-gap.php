<?php
// Coverage-gap capture toggles (see scripts/capture-coverage-gaps.ts).
// Require'd from LocalSettings.php AFTER the other mw-*.php files.
// Temp accounts must be the 1.42+ array form; the boolean form previously set
// in LocalSettings.php is not read by this MediaWiki version. All keys are
// required here: RealTempUserConfig does not merge partial specs.
$wgAutoCreateTempUser = [
	'enabled' => true,
	'actions' => [ 'edit' ],
	'genPattern' => '~$1',
	'serialProvider' => [ 'type' => 'local', 'useYear' => true ],
	'serialMapping' => [ 'type' => 'plain-numeric' ],
];
// Echo: action=echocreateevent gate (the EchoCustomEventEnable key set in
// mw-more.php is not read by this Echo version).
$wgEchoEnableApiEvents = true;
// SpamBlacklist: $wgSpamBlacklistLines (mw-misc.php) matches no config; the
// real knob is $wgBlacklistSettings['spam']['files'] with a local file.
$wgBlacklistSettings = [
	'spam' => [ 'files' => [ '/var/www/html/spam-blacklist.txt' ] ],
];
// TitleBlacklist: read the on-wiki MediaWiki:Titleblacklist message page.
$wgTitleBlacklistSources = [
	[ 'type' => 'message' ],
];
// Editing MediaWiki: JS/CSS pages (gadget fixtures) — the image's sysop group
// ships without the site-* editing rights.
$wgGroupPermissions['sysop']['editsitejs'] = true;
$wgGroupPermissions['sysop']['editsitecss'] = true;
$wgGroupPermissions['sysop']['editsitejson'] = true;
// Parsoid linting is off by default outside Wikimedia production; Linter
// receives no lint output at all without it.
$wgParsoidSettings['linting'] = true;
// Default blacklist forbids removing the local password via
// action=removeauthenticationdata (self-lockout protection); empty it for the
// throwaway authdata capture account only (its password is restored by the
// capture script via createAndPromote.php).
$wgRemoveCredentialsBlacklist = [];
