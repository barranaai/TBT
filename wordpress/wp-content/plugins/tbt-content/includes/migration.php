<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'admin_menu', static function () { add_management_page( 'TBT Content Setup', 'TBT Content Setup', 'manage_options', 'tbt-content-setup', 'tbt_content_setup_page' ); } );

function tbt_content_migrate() {
	if ( ! current_user_can( 'manage_options' ) || ! function_exists( 'tbt_cms_export' ) ) { return new WP_Error( 'unavailable', 'Administrator access and the compatible Teeth by Trev theme are required.' ); }
	if ( get_option( 'tbt_content_migrated' ) ) { update_option( 'tbt_content_enabled', '1', false ); tbt_content_clear_cache(); return 'Existing content preserved; CMS display enabled.'; }
	if ( ! add_option( 'tbt_content_migration_lock', time(), '', false ) ) { return new WP_Error( 'locked', 'A migration is already running. Do not submit again. An administrator can inspect the migration lock if a request was interrupted.' ); }
	try {
		$source = tbt_cms_export();
		if ( is_wp_error( $source ) ) { return $source; }
		$backup = get_option( 'tbt_content_migration_backup' );
		if ( ! $backup ) {
			$backup = array( 'date' => gmdate( 'c' ), 'source' => $source, 'menus' => get_theme_mod( 'nav_menu_locations', array() ) );
			if ( ! add_option( 'tbt_content_migration_backup', $backup, '', false ) ) { return new WP_Error( 'backup', 'Could not save the migration backup. Nothing was switched.' ); }
		}
		// A partial retry reuses the captured source and any already-created records.
		$source = $backup['source'];
		$created = array();
		foreach ( $source['records'] as $seed => $record ) {
			$existing = get_posts( array( 'post_type' => $record['type'], 'post_status' => array( 'publish', 'draft', 'pending', 'private', 'future', 'trash' ), 'numberposts' => 1, 'meta_key' => '_tbt_seed_key', 'meta_value' => $seed ) );
			if ( $existing ) { $created[] = $existing[0]->ID; continue; }
			$id = wp_insert_post( wp_slash( array( 'post_type' => $record['type'], 'post_title' => $record['title'], 'post_status' => 'publish', 'menu_order' => $record['order'], 'meta_input' => array_merge( $record['meta'], array( '_tbt_seed_key' => $seed ) ) ) ), true );
			if ( is_wp_error( $id ) ) { return $id; }
			$created[] = $id;
		}
		$locations = get_theme_mod( 'nav_menu_locations', array() );
		$owned = get_option( 'tbt_content_owned_menus', array() );
		foreach ( $source['menus'] as $location => $items ) {
			$menu_id = absint( $owned[ $location ] ?? 0 );
			if ( ! $menu_id ) {
				$menu_id = wp_create_nav_menu( 'TBT ' . ucfirst( $location ) . ' — CMS ' . gmdate( 'Y-m-d H:i:s' ) );
				if ( is_wp_error( $menu_id ) ) { return $menu_id; }
				$owned[ $location ] = $menu_id;
				update_option( 'tbt_content_owned_menus', $owned, false );
			}
			$existing = wp_get_nav_menu_items( $menu_id ) ?: array();
			foreach ( $items as $index => $item ) {
				$seed = $location . '-' . $index;
				if ( array_filter( $existing, static function ( $entry ) use ( $seed ) { return get_post_meta( $entry->ID, '_tbt_seed_key', true ) === $seed; } ) ) { continue; }
				$url = $item['url'];
				$page_id = url_to_postid( $url );
				if ( untrailingslashit( $url ) === untrailingslashit( home_url() ) ) { $page_id = (int) get_option( 'page_on_front' ); }
				$args = array( 'menu-item-title' => wp_slash( $item['title'] ), 'menu-item-status' => 'publish', 'menu-item-position' => $index + 1, 'menu-item-type' => 'custom', 'menu-item-url' => esc_url_raw( $url ) );
				if ( $page_id && 'page' === get_post_type( $page_id ) && ! wp_parse_url( $url, PHP_URL_QUERY ) && ! wp_parse_url( $url, PHP_URL_FRAGMENT ) ) { $args['menu-item-type'] = 'post_type'; $args['menu-item-object'] = 'page'; $args['menu-item-object-id'] = $page_id; }
				$item_id = wp_update_nav_menu_item( $menu_id, 0, $args );
				if ( is_wp_error( $item_id ) ) { return $item_id; }
				update_post_meta( $item_id, '_tbt_seed_key', $seed );
			}
			$locations[ $location ] = $menu_id;
		}
		set_theme_mod( 'nav_menu_locations', $locations );
		update_option( 'tbt_content_migrated', array( 'version' => 1, 'date' => gmdate( 'c' ), 'records' => $created ), false );
		update_option( 'tbt_content_enabled', '1', false );
		tbt_content_clear_cache();
		return count( $created ) . ' content records and 3 native menus prepared. Original Elementor documents and previous menu assignments are preserved.';
	} finally { delete_option( 'tbt_content_migration_lock' ); }
}

function tbt_content_setup_page(): void {
	if ( ! current_user_can( 'manage_options' ) ) { return; }
	$result = null;
	if ( 'POST' === ( $_SERVER['REQUEST_METHOD'] ?? '' ) && isset( $_POST['tbt_content_action'] ) ) {
		check_admin_referer( 'tbt_content_setup' );
		if ( 'prepare' === $_POST['tbt_content_action'] ) { $result = tbt_content_migrate(); }
		if ( 'pause' === $_POST['tbt_content_action'] ) { update_option( 'tbt_content_enabled', '0', false ); tbt_content_clear_cache(); $result = 'Original Elementor display restored. CMS records and menus remain saved; no content was deleted.'; }
	}
	echo '<div class="wrap"><h1>TBT Content Setup</h1>';
	if ( $result ) { echo '<div class="notice ' . ( is_wp_error( $result ) ? 'notice-error' : 'notice-success' ) . '"><p>' . esc_html( is_wp_error( $result ) ? $result->get_error_message() : $result ) . '</p></div>'; }
	echo '<p><strong>CMS display: ' . ( tbt_content_enabled() ? 'Enabled' : 'Original Elementor content' ) . '</strong></p><p>This explicit migration imports the currently saved replica content into Services, Testimonials and Smile Transformations, and creates Primary, Footer and Legal menus. It does not change existing Elementor documents, SEO defaults, enquiries, payment settings or other websites. Run on staging first.</p>';
	echo '<form method="post">'; wp_nonce_field( 'tbt_content_setup' );
	echo '<button class="button button-primary" name="tbt_content_action" value="prepare">' . ( get_option( 'tbt_content_migrated' ) ? 'Enable CMS display — preserve all edits' : 'Back up and prepare CMS content' ) . '</button> ';
	if ( tbt_content_enabled() ) { echo '<button class="button" name="tbt_content_action" value="pause">Use original Elementor content</button>'; }
	echo '</form><h2>Manage content</h2><ul>';
	foreach ( array( 'edit.php?post_type=tbt_service' => 'Services', 'edit.php?post_type=tbt_testimonial' => 'Testimonials', 'edit.php?post_type=tbt_smile' => 'Smile Transformations', 'nav-menus.php' => 'Navigation Menus', 'edit.php?post_type=page' => 'Pages — SEO & Sharing' ) as $url => $label ) { echo '<li><a href="' . esc_url( admin_url( $url ) ) . '">' . esc_html( $label ) . '</a></li>'; }
	echo '</ul><p>Content remains in WordPress when themes change. Menu assignment backups and the captured Elementor source are stored in the non-autoloaded tbt_content_migration_backup option. Re-running completed setup never replaces client edits. A full WordPress backup must include the database and media.</p></div>';
}
