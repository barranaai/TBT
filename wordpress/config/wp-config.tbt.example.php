<?php
/**
 * Copy only the needed definitions into wp-config.php above the
 * "That's all, stop editing" line. Never commit real values.
 */

define( 'AIRTABLE_TOKEN', 'replace-on-server' );
define( 'AIRTABLE_BASE_ID', 'replace-on-server' );
define( 'AIRTABLE_TABLE_NAME', 'Leads' );
define( 'AIRTABLE_DEPOSITS_TABLE', 'Deposits' );

define( 'SQUARE_ACCESS_TOKEN', 'replace-on-server' );
define( 'SQUARE_APPLICATION_ID', 'replace-on-server' );
define( 'SQUARE_LOCATION_ID', 'replace-on-server' );
define( 'SQUARE_ENVIRONMENT', 'sandbox' ); // Change to production only at approved cutover.
define( 'SQUARE_VERSION', '2026-05-20' );

define( 'META_CAPI_ACCESS_TOKEN', 'replace-on-server' );
define( 'META_GRAPH_API_VERSION', 'v24.0' );
// Optional during Meta Events Manager verification only:
// define( 'META_CAPI_TEST_EVENT_CODE', 'TEST00000' );

define( 'WP_ENVIRONMENT_TYPE', 'staging' );
define( 'WP_DEBUG', false );
define( 'DISALLOW_FILE_EDIT', true );
