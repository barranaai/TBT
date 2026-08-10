<?php
/**
 * Plugin Name: TBT Core
 * Description: Operational features for the Teeth by Trev WordPress site.
 * Version: 0.2.2
 * Requires at least: 6.6
 * Requires PHP: 8.1
 * Author: Barrana AI
 * Text Domain: tbt-core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TBT_CORE_VERSION', '0.2.2' );
define( 'TBT_CORE_PATH', plugin_dir_path( __FILE__ ) );
define( 'TBT_CORE_URL', plugin_dir_url( __FILE__ ) );

require_once TBT_CORE_PATH . 'includes/class-tbt-core-schema.php';
require_once TBT_CORE_PATH . 'includes/class-tbt-core-rest.php';
require_once TBT_CORE_PATH . 'includes/class-tbt-core-ui.php';

function tbt_core_boot(): void {
	if ( get_option( 'tbt_core_schema_version' ) !== TBT_CORE_VERSION ) {
		TBT_Core_Schema::install();
	}
	TBT_Core_REST::register();
	TBT_Core_UI::register();
}
add_action( 'plugins_loaded', 'tbt_core_boot' );

function tbt_core_seed_pages(): void {
	$pages = array(
		'home'         => 'Home',
		'about'        => 'About',
		'services'     => 'Services',
		'gallery'      => 'Gallery',
		'financing'    => 'Financing',
		'contact'      => 'Contact',
		'consultation' => 'Consultation',
		'reserve'      => 'Reserve',
		'privacy'      => 'Privacy',
	);
	$ids = array();
	foreach ( $pages as $slug => $title ) {
		$page = get_page_by_path( $slug );
		if ( ! $page ) {
			$id = wp_insert_post(
				array(
					'post_title'   => $title,
					'post_name'    => $slug,
					'post_status'  => 'publish',
					'post_type'    => 'page',
					'post_content' => '',
				),
				true
			);
			if ( ! is_wp_error( $id ) ) {
				$ids[ $slug ] = (int) $id;
			}
		} else {
			$ids[ $slug ] = (int) $page->ID;
		}
	}
	if ( isset( $ids['home'] ) ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $ids['home'] );
	}
}

function tbt_core_activate(): void {
	TBT_Core_Schema::install();
	tbt_core_seed_pages();
	TBT_Core_REST::photo_rewrites();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'tbt_core_activate' );

function tbt_core_deactivate(): void {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'tbt_core_deactivate' );
