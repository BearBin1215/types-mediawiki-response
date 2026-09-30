<?php
// Record Parsoid lint errors for a page: core-parser edits never lint, so
// re-render the current revision through ParsoidParser (logLinterData enabled)
// and let the ParserLogLinterData hook enqueue a RecordLintJob.
if ( PHP_SAPI !== 'cli' ) { exit( 1 ); }
require_once __DIR__ . '/maintenance/Maintenance.php';

use MediaWiki\Parser\ParserOptions;
use MediaWiki\Revision\SlotRecord;

class MwLintGap extends Maintenance {
	public function execute() {
		$title = Title::newFromText( $this->getArg( 0 ) );
		if ( !$title || !$title->getArticleID() ) { $this->fatalError( 'no page' ); }
		$services = MediaWiki\MediaWikiServices::getInstance();
		$factory = $services->get( 'ParsoidParserFactory' );
		$parser = $factory->create();
		$page = $services->getWikiPageFactory()->newFromTitle( $title );
		$content = $page->getRevisionRecord()->getContent( SlotRecord::MAIN );
		$pout = $parser->parse( $content->getText(), $title, ParserOptions::newFromAnon(),
			true, true, $page->getLatest() );
		$lints = $pout->getExtensionData( 'linters' );
		echo 'latest=', $page->getLatest(), ' lints=',
			json_encode( $lints === null ? [] : $lints ), PHP_EOL;
	}
}

$maintClass = MwLintGap::class;
require_once RUN_MAINTENANCE_IF_MAIN;
