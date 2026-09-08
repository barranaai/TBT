<?php
/**
 * Plugin Name: TBT Content Manager
 * Description: Services, testimonials, locations, public smile transformations and page SEO for Teeth by Trev. Separate from enquiries and payments.
 * Version: 1.1.0
 * Requires at least: 6.6
 * Requires PHP: 8.1
 * Author: Barrana AI
 * Text Domain: tbt-content
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
define( 'TBT_CONTENT_VERSION', '1.1.0' );
require_once __DIR__ . '/includes/content.php';
require_once __DIR__ . '/includes/migration.php';

register_activation_hook( __FILE__, static function () {
	tbt_content_init();
	$result = tbt_content_seed_locations();
	if ( is_wp_error( $result ) ) { set_transient( 'tbt_content_schema_error', $result->get_error_message(), 300 ); return; }
	update_option( 'tbt_content_schema_version', 2, false );
} );

/** The renderer only switches sources after an explicit successful migration. */
function tbt_content_enabled(): bool { return '1' === (string) get_option( 'tbt_content_enabled' ); }

function tbt_content_fields( string $type ): array {
	$image = array( 'image' => array( 'Public picture', 'image' ), 'alt' => array( 'Picture description (accessibility)', 'text' ) );
	if ( 'tbt_service' === $type ) {
		return array_merge( array( 'description' => array( 'Service description', 'textarea' ), 'features' => array( 'Service highlights — one per line', 'textarea' ) ), $image, array(
			'position' => array( 'Picture crop', 'select', array( 'center' => 'Centre', 'top' => 'Top', 'bottom' => 'Bottom' ) ),
			'home_featured' => array( 'Show this service in Selected Work on the home page', 'checkbox' ),
			'home_order' => array( 'Home page order (lowest first)', 'number' ),
			'home_title' => array( 'Home page title — blank uses service name', 'text' ),
			'home_description' => array( 'Home page description — blank uses service description', 'textarea' ),
			'home_eyebrow' => array( 'Home page short label', 'text' ),
			'home_image' => array( 'Home page picture — blank uses service picture', 'image' ),
			'home_alt' => array( 'Home page picture description — blank uses main description', 'text' ),
			'number' => array( 'Service number label — blank numbers automatically', 'text' ),
			'home_number' => array( 'Home number label — blank numbers automatically', 'text' ),
		) );
	}
	if ( 'tbt_testimonial' === $type ) { return array( 'quote' => array( 'Patient quote (include quotation marks if desired)', 'textarea' ), 'treatment' => array( 'Treatment / attribution subtitle', 'text' ) ); }
	if ( 'tbt_smile' === $type ) {
		return array_merge( array( 'placement' => array( 'Display as', 'select', array( 'card' => 'Gallery picture card', 'comparison' => 'Before-and-after comparison' ) ), 'caption' => array( 'Caption / comparison instructions', 'text' ) ), $image, array(
			'before_image' => array( 'Before picture — required for comparisons', 'image' ),
			'before_alt' => array( 'Before picture description', 'text' ),
			'before_label' => array( 'Before label', 'text' ), 'after_label' => array( 'After label', 'text' ),
		) );
	}
	if ( 'tbt_location' === $type ) { return array(
		'city' => array( 'City — locations with the same city are grouped in one pop-up', 'text' ),
		'area' => array( 'Area / neighborhood (optional)', 'text' ),
		'practice' => array( 'Practice name (optional)', 'text' ),
		'mode' => array( 'Visit details', 'select', array( 'physical' => 'Show physical address and directions', 'appointment' => 'By appointment — show text-message contact' ) ),
		'address' => array( 'Public address — one line per line', 'textarea' ),
		'map_query' => array( 'Google Maps search text — blank uses the public address', 'text' ),
		'appointment_intro' => array( 'Appointment message before text link', 'text' ),
		'sms_label' => array( 'Text-message link label', 'text' ),
		'sms_number' => array( 'SMS number in international format', 'tel' ),
		'appointment_outro' => array( 'Appointment message after text link', 'text' ),
	); }
	if ( 'page' === $type ) { return array(
		'seo_title' => array( 'Search title — blank keeps the current default', 'text' ),
		'seo_description' => array( 'Search description — blank keeps the current default', 'textarea' ),
		'social_title' => array( 'Sharing title — blank uses search title', 'text' ),
		'social_description' => array( 'Sharing description — blank uses search description', 'textarea' ),
		'social_image' => array( 'Social sharing picture — recommended 1200 × 630 px', 'image' ),
	); }
	return array();
}

function tbt_content_init(): void {
	foreach ( array( 'tbt_service' => array( 'Services', 'Service', 'dashicons-heart' ), 'tbt_testimonial' => array( 'Testimonials', 'Testimonial', 'dashicons-format-quote' ), 'tbt_smile' => array( 'Smile Transformations', 'Transformation', 'dashicons-format-gallery' ), 'tbt_location' => array( 'Locations', 'Location', 'dashicons-location-alt' ) ) as $type => $labels ) {
		register_post_type( $type, array(
			'labels' => array( 'name' => $labels[0], 'singular_name' => $labels[1], 'add_new_item' => 'Add ' . $labels[1], 'edit_item' => 'Edit ' . $labels[1], 'new_item' => 'New ' . $labels[1], 'all_items' => 'All ' . $labels[0], 'search_items' => 'Search ' . $labels[0], 'not_found' => 'No items found.' ),
			'public' => false, 'publicly_queryable' => false, 'exclude_from_search' => true, 'show_ui' => true, 'show_in_menu' => true,
			'show_in_nav_menus' => false, 'show_in_rest' => false, 'has_archive' => false, 'rewrite' => false, 'query_var' => false,
			'menu_icon' => $labels[2], 'menu_position' => 22, 'supports' => array( 'title', 'revisions', 'page-attributes' ),
			'capability_type' => 'page', 'map_meta_cap' => true,
		) );
	}
	foreach ( array( 'tbt_service', 'tbt_testimonial', 'tbt_smile', 'tbt_location', 'page' ) as $type ) {
		foreach ( tbt_content_fields( $type ) as $name => $field ) {
			register_post_meta( $type, '_tbt_' . $name, array( 'type' => 'string', 'single' => true, 'show_in_rest' => false, 'revisions_enabled' => true,
				'sanitize_callback' => static function ( $value ) use ( $field ) { return tbt_content_sanitize( $value, $field ); },
				'auth_callback' => static function ( $allowed, $key, $id ) { return current_user_can( 'edit_post', $id ); },
			) );
			if ( 'image' === $field[1] ) {
				register_post_meta( $type, '_tbt_' . $name . '_id', array( 'type' => 'integer', 'single' => true, 'show_in_rest' => false, 'revisions_enabled' => true, 'sanitize_callback' => 'absint', 'auth_callback' => static function ( $allowed, $key, $id ) { return current_user_can( 'edit_post', $id ); } ) );
			}
		}
	}
}
add_action( 'init', 'tbt_content_init' );

/** Existing installations gain the location collection without replacing edits. */
function tbt_content_upgrade_schema(): void {
	if ( (int) get_option( 'tbt_content_schema_version', 1 ) >= 2 || ! current_user_can( 'manage_options' ) ) { return; }
	$result = tbt_content_seed_locations();
	if ( is_wp_error( $result ) ) { set_transient( 'tbt_content_schema_error', $result->get_error_message(), 300 ); return; }
	delete_transient( 'tbt_content_schema_error' );
	update_option( 'tbt_content_schema_version', 2, false );
}
add_action( 'admin_init', 'tbt_content_upgrade_schema' );

function tbt_content_sanitize( $value, array $field ): string {
	$value = is_scalar( $value ) ? (string) $value : '';
	if ( 'image' === $field[1] ) { return esc_url_raw( $value, array( 'http', 'https' ) ); }
	if ( 'number' === $field[1] ) { return (string) max( 0, (int) $value ); }
	if ( 'checkbox' === $field[1] ) { return '1' === $value ? '1' : '0'; }
	if ( 'select' === $field[1] ) { return array_key_exists( $value, $field[2] ) ? $value : (string) array_key_first( $field[2] ); }
	if ( 'tel' === $field[1] ) { $digits = preg_replace( '/\D/', '', $value ); return '' === $digits ? '' : '+' . $digits; }
	return 'textarea' === $field[1] ? sanitize_textarea_field( $value ) : sanitize_text_field( $value );
}

function tbt_content_value( int $id, string $field ): string {
	$attachment = absint( get_post_meta( $id, '_tbt_' . $field . '_id', true ) );
	if ( $attachment ) {
		$url = wp_get_attachment_image_url( $attachment, 'full' );
		if ( $url ) { return $url; }
	}
	return (string) get_post_meta( $id, '_tbt_' . $field, true );
}

function tbt_content_records( string $type ): array {
	return get_posts( array( 'post_type' => $type, 'post_status' => 'publish', 'numberposts' => -1, 'orderby' => array( 'menu_order' => 'ASC', 'ID' => 'ASC' ), 'suppress_filters' => false ) );
}

function tbt_content_locations_ready(): bool { return '1' === (string) get_option( 'tbt_location_records_ready' ); }
function tbt_content_location_rows(): array {
	$rows = array();
	foreach ( tbt_content_records( 'tbt_location' ) as $post ) {
		$row = array( 'city' => tbt_content_value( $post->ID, 'city' ), 'subtitle' => tbt_content_value( $post->ID, 'area' ), 'venue' => tbt_content_value( $post->ID, 'practice' ), 'mode' => tbt_content_value( $post->ID, 'mode' ), 'address' => tbt_content_value( $post->ID, 'address' ), 'maps_query' => tbt_content_value( $post->ID, 'map_query' ), 'appointment_intro' => tbt_content_value( $post->ID, 'appointment_intro' ), 'sms_label' => tbt_content_value( $post->ID, 'sms_label' ), 'sms_number' => tbt_content_value( $post->ID, 'sms_number' ), 'appointment_outro' => tbt_content_value( $post->ID, 'appointment_outro' ) );
		if ( '' !== $row['city'] ) { $rows[] = $row; }
	}
	return $rows;
}

/** Content edits invalidate rendered Elementor/host caches, never integration settings. */
function tbt_content_clear_cache(): void {
	if ( class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->files_manager ) && \Elementor\Plugin::$instance->files_manager ) { \Elementor\Plugin::$instance->files_manager->clear_cache(); }
	do_action( 'litespeed_purge_all' );
}
add_action( 'wp_update_nav_menu', 'tbt_content_clear_cache' );
add_action( 'save_post', static function ( $id ) {
	if ( in_array( get_post_type( $id ), array( 'tbt_service', 'tbt_testimonial', 'tbt_smile', 'tbt_location', 'page' ), true ) && ! wp_is_post_revision( $id ) ) { tbt_content_clear_cache(); }
}, 100 );
add_action( 'trashed_post', static function ( $id ) { if ( str_starts_with( (string) get_post_type( $id ), 'tbt_' ) ) { tbt_content_clear_cache(); } } );
