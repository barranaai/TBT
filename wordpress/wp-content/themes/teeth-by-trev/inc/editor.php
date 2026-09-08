<?php
/** Elementor content ownership and explicit, reversible page conversion.
 * @package TeethByTrev
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function tbt_editor_layouts(): array {
	static $layouts;
	if ( null === $layouts ) {
		$path = __DIR__ . '/editor-layouts.json';
		$layouts = is_readable( $path ) ? json_decode( file_get_contents( $path ), true ) : array();
	}
	return is_array( $layouts ) ? $layouts : array();
}

function tbt_editor_resolve( string $value ): string {
	return strtr( $value, array( '{{site}}' => untrailingslashit( home_url() ), '{{theme}}' => get_template_directory_uri() ) );
}

function tbt_editor_register_widgets( $manager ): void {
	require_once __DIR__ . '/elementor-section.php';
	foreach ( tbt_editor_layouts()['sections'] ?? array() as $key => $layout ) {
		$manager->register( new TBT_Elementor_Section( array(), null, $key ) );
	}
}
add_action( 'elementor/widgets/register', 'tbt_editor_register_widgets' );
/** Keep historical site's kit styles off the replica; never modify that kit. */
add_action( 'wp', static function () {
	if ( ! class_exists( '\\Elementor\\Plugin' ) || ! get_post_meta( get_queried_object_id(), '_tbt_editor_prepared', true ) ) { return; }
	$kits = \Elementor\Plugin::$instance->kits_manager;
	remove_action( 'elementor/frontend/after_enqueue_styles', array( $kits, 'frontend_before_enqueue_styles' ), 0 );
	remove_action( 'elementor/preview/enqueue_styles', array( $kits, 'preview_enqueue_styles' ), 0 );
}, 20 );
add_action( 'wp_enqueue_scripts', static function () {
	if ( class_exists( '\Elementor\Plugin' ) ) {
		wp_enqueue_style( 'tbt-editor-layout', get_template_directory_uri() . '/assets/dist/editor.css', array( 'tbt-theme' ), TBT_THEME_VERSION );
	}
}, 100 );
add_action( 'elementor/elements/categories_registered', static function ( $manager ) {
	$manager->add_category( 'tbt', array( 'title' => __( 'Teeth by Trev', 'teeth-by-trev' ), 'icon' => 'eicon-site-identity' ) );
} );

function tbt_editor_template( string $template ): string {
	if ( is_singular() && class_exists( '\Elementor\Plugin' ) ) {
		$id = get_queried_object_id();
		if ( ! get_post_meta( $id, '_tbt_editor_prepared', true ) && 'page-elementor.php' !== get_post_meta( $id, '_wp_page_template', true ) ) { return $template; }
		$document = \Elementor\Plugin::$instance->documents->get( get_queried_object_id() );
		if ( $document && $document->is_built_with_elementor() ) {
			return get_template_directory() . '/page-elementor.php';
		}
	}
	return $template;
}
add_filter( 'template_include', 'tbt_editor_template', 99 );

/** Render global documents only when explicitly assigned by the setup action. */
function tbt_editor_global( string $area ): bool {
	$id = absint( get_option( 'tbt_editor_' . $area ) );
	if ( ! $id || ! class_exists( '\Elementor\Plugin' ) || 'publish' !== get_post_status( $id ) ) { return false; }
	$html = \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $id );
	if ( ! $html ) { return false; }
	echo '<div class="tbt-editor-global">' . $html . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Elementor renders escaped widget output.
	return true;
}

/** Explicit setup; never changes existing Elementor documents or runs on updates. */
function tbt_editor_prepare_pages( bool $archive_legacy = false ): array {
	if ( ! current_user_can( 'manage_options' ) || ! class_exists( '\Elementor\Plugin' ) ) {
		return array( 'error' => 'Administrator access and Elementor are required.' );
	}
	$layouts = tbt_editor_layouts();
	$definitions = $layouts['pages'];
	$definitions['tbt-site-header'] = array( 'title' => 'Site Header', 'sections' => array( 'site-header' ) );
	$definitions['tbt-site-footer'] = array( 'title' => 'Site Footer', 'sections' => array( 'site-footer' ) );
	$result = array();
	foreach ( $definitions as $slug => $definition ) {
		$is_global = str_starts_with( $slug, 'tbt-site-' );
		$type = $is_global ? 'elementor_library' : 'page';
		$post = get_page_by_path( $slug, OBJECT, $type );
		if ( ! $post ) {
			if ( ! $is_global ) { $result[ $slug ] = 'Missing page; skipped'; continue; }
			$id = wp_insert_post( array( 'post_title' => $definition['title'], 'post_name' => $slug, 'post_type' => $type, 'post_status' => 'publish' ), true );
			if ( is_wp_error( $id ) ) { $result[ $slug ] = $id->get_error_message(); continue; }
			$post = get_post( $id );
		}
		$id = $post->ID;
		if ( ! current_user_can( 'edit_post', $id ) ) { continue; }
		if ( get_post_meta( $id, '_tbt_editor_prepared', true ) ) {
			$result[ $slug ] = 'Already editable; preserved'; continue;
		}
		if ( get_post_meta( $id, '_elementor_data', true ) && ! $archive_legacy ) {
			$result[ $slug ] = 'Older Elementor layout exists; use archive-and-prepare to preserve it and convert the current replica'; continue;
		}
		$original_meta = array();
		foreach ( get_post_meta( $id ) as $key => $values ) {
			if ( str_starts_with( $key, '_elementor_' ) || '_wp_page_template' === $key ) { $original_meta[ $key ] = get_post_meta( $id, $key, true ); }
		}
		add_post_meta( $id, '_tbt_before_elementor', wp_slash( array( 'content' => $post->post_content, 'meta' => $original_meta ) ), true );
		wp_save_post_revision( $id );
		delete_post_meta( $id, '_elementor_page_settings' );
		update_post_meta( $id, '_wp_page_template', 'default' );
		update_post_meta( $id, '_elementor_edit_mode', 'builder' );
		update_post_meta( $id, '_elementor_template_type', $is_global ? 'section' : 'wp-page' );
		$elements = array();
		foreach ( $definition['sections'] as $key ) {
			$layout = $layouts['sections'][ $key ];
			$settings = array( '_title' => $layout['title'] );
			foreach ( $layout['controls'] as $name => $control ) {
				$value = tbt_editor_resolve( $control['default'] );
				$settings[ $name ] = in_array( $control['type'], array( 'media', 'video', 'url' ), true ) ? array( 'url' => $value, 'id' => 0 ) : $value;
			}
			if ( isset( $layout['gallery'] ) ) {
				$settings['gallery_items'] = array_map( static function ( $item ) {
					$item['_id'] = substr( str_replace( '-', '', wp_generate_uuid4() ), 0, 7 );
					$item['image']['url'] = tbt_editor_resolve( $item['image']['url'] );
					return $item;
				}, $layout['gallery'] );
			}
			$elements[] = array( 'id' => substr( md5( $slug . $key ), 0, 7 ), 'elType' => 'widget', 'widgetType' => 'tbt-' . $key, 'settings' => $settings, 'elements' => array() );
		}
		$document = \Elementor\Plugin::$instance->documents->get( $id, false );
		if ( ! $document || ! $document->save( array( 'elements' => $elements, 'settings' => array( 'post_status' => 'publish' ) ) ) ) {
			$result[ $slug ] = 'Save failed; original template preserved';
			tbt_editor_restore_page( $id );
			continue;
		}
		update_post_meta( $id, '_tbt_editor_prepared', 1 );
		if ( $is_global ) { update_option( 'tbt_editor_' . substr( $slug, 9 ), $id, false ); }
		$result[ $slug ] = 'Ready';
	}
	return $result;
}

/** Retain both versions before restoring; only the exact converted posts qualify. */
function tbt_editor_restore_page( int $id ): bool {
	if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'edit_post', $id ) ) { return false; }
	$backup = get_post_meta( $id, '_tbt_before_elementor', true );
	if ( ! is_array( $backup ) ) { return false; }
	$current = array();
	foreach ( get_post_meta( $id ) as $key => $values ) {
		if ( str_starts_with( $key, '_elementor_' ) || '_wp_page_template' === $key ) { $current[ $key ] = get_post_meta( $id, $key, true ); }
	}
	add_post_meta( $id, '_tbt_editor_archived_revision', wp_slash( array( 'created' => gmdate( 'c' ), 'content' => get_post_field( 'post_content', $id ), 'meta' => $current ) ) );
	foreach ( array_keys( $current ) as $key ) { delete_post_meta( $id, $key ); }
	foreach ( $backup['meta'] ?? array() as $key => $value ) { update_post_meta( $id, $key, wp_slash( $value ) ); }
	wp_update_post( wp_slash( array( 'ID' => $id, 'post_content' => $backup['content'] ) ) );
	delete_post_meta( $id, '_tbt_editor_prepared' );
	return true;
}

add_action( 'admin_menu', static function () {
	add_management_page( __( 'TBT Page Editor', 'teeth-by-trev' ), __( 'TBT Page Editor', 'teeth-by-trev' ), 'manage_options', 'tbt-page-editor', 'tbt_editor_admin' );
} );
function tbt_editor_admin(): void {
	if ( ! current_user_can( 'manage_options' ) ) { return; }
	echo '<div class="wrap"><h1>' . esc_html__( 'TBT Page Editor', 'teeth-by-trev' ) . '</h1>';
	if ( ! class_exists( '\Elementor\Plugin' ) ) {
		echo '<p>' . esc_html__( 'Install and activate the free Elementor plugin to enable visual editing.', 'teeth-by-trev' ) . '</p></div>'; return;
	}
	if ( isset( $_POST['tbt_prepare'] ) || isset( $_POST['tbt_archive_prepare'] ) ) {
		check_admin_referer( 'tbt_prepare_editor' );
		foreach ( tbt_editor_prepare_pages( isset( $_POST['tbt_archive_prepare'] ) ) as $slug => $status ) { echo '<p>' . esc_html( $slug . ': ' . $status ) . '</p>'; }
	}
	echo '<p>' . esc_html__( 'Prepare the existing pages for Elementor. Existing Elementor edits are preserved. Original page content is backed up. Test this on staging first.', 'teeth-by-trev' ) . '</p><form method="post">';
	wp_nonce_field( 'tbt_prepare_editor' );
	submit_button( __( 'Prepare editable pages', 'teeth-by-trev' ), 'primary', 'tbt_prepare' );
	echo '<p>' . esc_html__( 'If these exact pages contain layouts from an older website, archive them before preparing the current replica. Only the ten replica pages are eligible; unrelated pages and completed conversions are preserved.', 'teeth-by-trev' ) . '</p>';
	submit_button( __( 'Archive older layouts and prepare replica', 'teeth-by-trev' ), 'secondary', 'tbt_archive_prepare' );
	echo '</form><h2>' . esc_html__( 'Edit your website', 'teeth-by-trev' ) . '</h2><p>' . esc_html__( 'Open a page, select a section, edit text or choose an image from the Media Library, then Publish. Gallery cards can be added, reordered or removed. Use Elementor History to undo changes.', 'teeth-by-trev' ) . '</p><ul>';
	foreach ( array_merge( array_keys( tbt_editor_layouts()['pages'] ?? array() ), array( 'tbt-site-header', 'tbt-site-footer' ) ) as $slug ) {
		$post = get_page_by_path( $slug, OBJECT, str_starts_with( $slug, 'tbt-site-' ) ? 'elementor_library' : 'page' );
		if ( $post ) { echo '<li><a href="' . esc_url( admin_url( 'post.php?post=' . $post->ID . '&action=elementor' ) ) . '">' . esc_html( $post->post_title ) . '</a></li>'; }
	}
	echo '</ul></div>';
}
