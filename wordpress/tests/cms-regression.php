<?php
// Local-only blueprint test, never included in a deployment archive.
function cms_assert( $condition, string $message ): void { if ( ! $condition ) { echo 'FAIL ' . $message . "\n"; throw new Exception( $message ); } echo 'PASS ' . $message . "\n"; }
wp_set_current_user( 1 );
tbt_editor_prepare_pages();
$page = get_page_by_path( 'services' );
$data = json_decode( get_post_meta( $page->ID, '_elementor_data', true ), true );
$original = $data;
foreach ( $data as &$widget ) {
	if ( 'tbt-services-2' === ( $widget['widgetType'] ?? '' ) ) { $widget['settings']['content_013'] = 'Client-edited "description" with a ' . chr(92) . 'backslash & apostrophe\'s.'; }
}
unset( $widget );
update_post_meta( $page->ID, '_elementor_data', wp_slash( wp_json_encode( $data ) ) );
$expected_source = get_post_meta( $page->ID, '_elementor_data', true );
$result = tbt_content_migrate(); cms_assert( ! is_wp_error( $result ), 'Migration succeeded' );
$services = tbt_content_records( 'tbt_service' );
cms_assert( count( $services ) === 5, 'Five services migrated' );
$locations = tbt_content_records( 'tbt_location' );
cms_assert( count( $locations ) === 9 && tbt_content_locations_ready(), 'Nine locations seeded and ready' );
cms_assert( 2 === count( array_filter( tbt_content_location_rows(), static function ( $row ) { return 'New York' === $row['city']; } ) ), 'Two New York records group under one city' );
cms_assert( tbt_content_value( $services[0]->ID, 'description' ) === 'Client-edited "description" with a ' . chr(92) . 'backslash & apostrophe\'s.', 'Current client copy preserved including quotes and backslash' );
cms_assert( get_post_meta( $page->ID, '_elementor_data', true ) === $expected_source, 'Source Elementor document not modified' );
$backup = get_option( 'tbt_content_migration_backup' );
cms_assert( $backup['source']['documents'][$page->ID]['elementor'] === $data, 'Exact source captured in backup' );
update_post_meta( $services[0]->ID, '_tbt_description', 'A later client edit' );
tbt_content_migrate();
cms_assert( tbt_content_value( $services[0]->ID, 'description' ) === 'A later client edit' && count( tbt_content_records( 'tbt_service' ) ) === 5, 'Repeated setup preserves edits without duplicates' );

// Save handlers enforce both nonce and object-level edit capability.
$_POST = array( 'tbt_content_nonce' => 'invalid', 'tbt_content' => array( 'description' => 'Unauthorized change' ) );
tbt_content_save_fields( $services[0]->ID, $services[0] );
cms_assert( tbt_content_value( $services[0]->ID, 'description' ) === 'A later client edit', 'Invalid nonce cannot alter content' );
$author = wp_insert_user( array( 'user_login' => 'cms-author', 'user_pass' => wp_generate_password(), 'role' => 'author' ) );
wp_set_current_user( $author );
$_POST['tbt_content_nonce'] = wp_create_nonce( 'tbt_content_save_' . $services[0]->ID );
tbt_content_save_fields( $services[0]->ID, $services[0] );
cms_assert( tbt_content_value( $services[0]->ID, 'description' ) === 'A later client edit', 'Author cannot alter shared CMS records' );
cms_assert( is_wp_error( tbt_content_migrate() ), 'Non-administrator cannot run migration' );
wp_set_current_user(1);
$_POST = array( 'tbt_content_nonce' => wp_create_nonce( 'tbt_content_save_' . $services[0]->ID ), 'tbt_content' => array( 'description' => '<script>alert(1)</script>Safe text', 'image' => 'javascript:alert(1)', 'image_id' => 0 ) );
tbt_content_save_fields( $services[0]->ID, $services[0] );
cms_assert( ! str_contains( tbt_content_value( $services[0]->ID, 'description' ), '<script>' ) && '' === tbt_content_value( $services[0]->ID, 'image' ), 'Text and image URL sanitization enforced' );
$_POST = array();

// Quick Edit and bulk publishing cannot bypass required public content.
$incomplete = wp_insert_post( array( 'post_type' => 'tbt_testimonial', 'post_title' => 'Incomplete local test', 'post_status' => 'publish' ) );
cms_assert( 'draft' === get_post_status( $incomplete ), 'Incomplete programmatic publication stays Draft' );
wp_update_post( array( 'ID' => $incomplete, 'post_status' => 'publish' ) );
cms_assert( 'draft' === get_post_status( $incomplete ), 'Quick/bulk status changes cannot bypass required fields' );
wp_delete_post( $incomplete, true );

// Registered metadata participates in WordPress revisions and restoration.
update_post_meta( $services[0]->ID, '_tbt_description', 'Revision A' ); wp_save_post_revision( $services[0]->ID );
$revisions = wp_get_post_revisions( $services[0]->ID ); $revision = reset( $revisions );
update_post_meta( $services[0]->ID, '_tbt_description', 'Revision B' ); wp_save_post_revision( $services[0]->ID );
wp_restore_post_revision( $revision->ID );
cms_assert( 'Revision A' === tbt_content_value( $services[0]->ID, 'description' ), 'Content metadata restored through WordPress revisions' );
$about = get_page_by_path( 'about' );
update_post_meta( $about->ID, '_tbt_seo_title', 'SEO revision A' ); wp_save_post_revision( $about->ID );
$revisions = wp_get_post_revisions( $about->ID ); $revision = reset( $revisions );
update_post_meta( $about->ID, '_tbt_seo_title', 'SEO revision B' ); wp_save_post_revision( $about->ID );
wp_restore_post_revision( $revision->ID );
cms_assert( 'SEO revision A' === tbt_content_value( $about->ID, 'seo_title' ), 'SEO metadata restored through WordPress revisions' );
$location = $locations[0];
update_post_meta( $location->ID, '_tbt_practice', 'Location revision A' ); wp_save_post_revision( $location->ID );
$revisions = wp_get_post_revisions( $location->ID ); $revision = reset( $revisions );
update_post_meta( $location->ID, '_tbt_practice', 'Location revision B' ); wp_save_post_revision( $location->ID );
wp_restore_post_revision( $revision->ID );
cms_assert( 'Location revision A' === tbt_content_value( $location->ID, 'practice' ), 'Location metadata restored through WordPress revisions' );

foreach ( array( 'tbt_service', 'tbt_testimonial', 'tbt_smile', 'tbt_location' ) as $type ) {
	$obj = get_post_type_object( $type );
	cms_assert( ! $obj->publicly_queryable && ! $obj->show_in_rest && ! $obj->has_archive, $type . ' has no unintended public endpoint or archive' );
}
cms_assert( count( wp_get_nav_menu_items( get_nav_menu_locations()['primary'] ) ) === 6, 'Native primary menu contains six migrated entries' );
echo "ALL CMS BACKEND REGRESSIONS PASSED\n";
