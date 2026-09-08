<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

add_filter( 'wp_insert_post_data', static function ( $data, $postarr ) {
	if ( ! in_array( $data['post_type'], array( 'tbt_service', 'tbt_testimonial', 'tbt_smile', 'tbt_location' ), true ) || ! in_array( $data['post_status'], array( 'publish', 'future' ), true ) ) { return $data; }
	$id = absint( $postarr['ID'] ?? 0 );
	$fields = array();
	// Quick Edit, bulk status changes and programmatic publishing must also
	// validate stored/incoming metadata; they do not submit our editor nonce.
	foreach ( tbt_content_fields( $data['post_type'] ) as $name => $definition ) {
		foreach ( 'image' === $definition[1] ? array( $name, $name . '_id' ) : array( $name ) as $key ) {
			$meta_key = '_tbt_' . $key;
			$fields[ $key ] = array_key_exists( $meta_key, $postarr['meta_input'] ?? array() ) ? wp_unslash( $postarr['meta_input'][ $meta_key ] ) : get_post_meta( $id, $meta_key, true );
		}
	}
	if ( ! empty( $_POST['tbt_content_nonce'] ) && isset( $_POST['tbt_content'] ) && is_array( $_POST['tbt_content'] ) && current_user_can( 'edit_post', $id ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['tbt_content_nonce'] ) ), 'tbt_content_save_' . $id ) ) {
		$fields = array_replace( $fields, wp_unslash( $_POST['tbt_content'] ) );
	}
	$missing = array();
	if ( '' === trim( wp_strip_all_tags( wp_unslash( $data['post_title'] ) ) ) ) { $missing[] = 'title'; }
	$required = 'tbt_service' === $data['post_type'] ? array( 'description' ) : ( 'tbt_testimonial' === $data['post_type'] ? array( 'quote' ) : ( 'tbt_smile' === $data['post_type'] ? array( 'image' ) : array( 'city' ) ) );
	if ( 'tbt_smile' === $data['post_type'] && 'comparison' === ( $fields['placement'] ?? '' ) ) { $required[] = 'before_image'; }
	if ( 'tbt_location' === $data['post_type'] ) {
		$required = array_merge( $required, 'appointment' === ( $fields['mode'] ?? '' ) ? array( 'appointment_intro', 'sms_label', 'sms_number', 'appointment_outro' ) : array( 'address' ) );
	}
	$definitions = tbt_content_fields( $data['post_type'] );
	foreach ( $required as $field ) {
		$value = tbt_content_sanitize( $fields[ $field ] ?? '', $definitions[ $field ] );
		$attachment = absint( $fields[ $field . '_id' ] ?? 0 );
		if ( '' === trim( $value ) || ( 'image' === $definitions[ $field ][1] && $attachment && ! wp_attachment_is_image( $attachment ) ) ) { $missing[] = str_replace( '_', ' ', $field ); }
	}
	if ( 'tbt_location' === $data['post_type'] && 'appointment' === ( $fields['mode'] ?? '' ) ) {
		$digits = preg_replace( '/\D/', '', (string) ( $fields['sms_number'] ?? '' ) );
		if ( strlen( $digits ) < 7 || strlen( $digits ) > 15 ) { $missing[] = 'valid SMS number'; }
	}
	if ( $missing ) { $data['post_status'] = 'draft'; set_transient( 'tbt_content_notice_' . get_current_user_id(), 'Saved as a draft. Complete these fields before publishing: ' . implode( ', ', $missing ) . '.', 120 ); }
	return $data;
}, 10, 2 );
add_action( 'admin_notices', static function () {
	$key = 'tbt_content_notice_' . get_current_user_id(); $message = get_transient( $key );
	if ( $message ) { echo '<div class="notice notice-warning"><p>' . esc_html( $message ) . '</p></div>'; delete_transient( $key ); }
	$schema = get_transient( 'tbt_content_schema_error' );
	if ( $schema && current_user_can( 'manage_options' ) ) { echo '<div class="notice notice-error"><p>Location setup could not complete: ' . esc_html( $schema ) . '</p></div>'; delete_transient( 'tbt_content_schema_error' ); }
} );

add_filter( 'enter_title_here', static function ( $placeholder, $post ) {
	return 'tbt_location' === $post->post_type ? 'Internal location label, e.g. New York — Manhattan' : $placeholder;
}, 10, 2 );

add_action( 'add_meta_boxes', static function () {
	foreach ( array( 'tbt_service', 'tbt_testimonial', 'tbt_smile', 'tbt_location', 'page' ) as $type ) {
		add_meta_box( 'tbt-content-fields', 'page' === $type ? 'Search & Social Sharing' : 'Website content', 'tbt_content_box', $type, 'normal', 'high', array( '__block_editor_compatible_meta_box' => true ) );
	}
} );

function tbt_content_box( WP_Post $post ): void {
	wp_nonce_field( 'tbt_content_save_' . $post->ID, 'tbt_content_nonce' );
	if ( 'page' === $post->post_type ) {
		echo '<p>These fields change search results and link previews, not the visible page heading. Blank fields keep the existing defaults. Search engines may choose a different snippet. Staging remains noindex; these fields cannot make it public.</p>';
	} else {
		echo '<p>Published items appear automatically on the website. Drafts and trashed items are hidden. Use the Order field (lowest first) to change their position. The title is an administrator-facing label.</p>';
		if ( 'tbt_smile' === $post->post_type ) { echo '<p><strong>Public website media only:</strong> publish only pictures and patient details approved for public use. Private visitor enquiry uploads are not imported here. For comparisons, Public picture is the after picture.</p>'; }
		if ( 'tbt_location' === $post->post_type ) { echo '<p><strong>Footer and pre-footer:</strong> the internal title is for administrators. The City field is the public button label; records with an identical City are grouped into one pop-up. Choose By appointment to show the editable SMS message instead of an address.</p>'; }
	}
	echo '<div class="tbt-content-fields">';
	foreach ( tbt_content_fields( $post->post_type ) as $name => $field ) {
		$value = tbt_content_value( $post->ID, $name );
		$id = 'tbt-field-' . $name;
		echo '<div class="tbt-field" data-tbt-field="' . esc_attr( $name ) . '"><label for="' . esc_attr( $id ) . '"><strong>' . esc_html( $field[0] ) . '</strong></label>';
		if ( 'textarea' === $field[1] ) {
			echo '<textarea id="' . esc_attr( $id ) . '" name="tbt_content[' . esc_attr( $name ) . ']" rows="4" class="large-text">' . esc_textarea( $value ) . '</textarea>';
		} elseif ( 'select' === $field[1] ) {
			echo '<select id="' . esc_attr( $id ) . '" name="tbt_content[' . esc_attr( $name ) . ']">';
			foreach ( $field[2] as $key => $label ) { echo '<option value="' . esc_attr( $key ) . '" ' . selected( $value, $key, false ) . '>' . esc_html( $label ) . '</option>'; }
			echo '</select>';
		} elseif ( 'checkbox' === $field[1] ) {
			echo '<input type="hidden" name="tbt_content[' . esc_attr( $name ) . ']" value="0"><input type="checkbox" id="' . esc_attr( $id ) . '" name="tbt_content[' . esc_attr( $name ) . ']" value="1" ' . checked( $value, '1', false ) . '>';
		} elseif ( 'image' === $field[1] ) {
			echo '<div class="tbt-image-field"><input type="url" readonly class="large-text tbt-image-url" id="' . esc_attr( $id ) . '" name="tbt_content[' . esc_attr( $name ) . ']" value="' . esc_attr( $value ) . '">';
			echo '<input class="tbt-image-id" type="hidden" name="tbt_content[' . esc_attr( $name ) . '_id]" value="' . absint( get_post_meta( $post->ID, '_tbt_' . $name . '_id', true ) ) . '">';
			echo '<p><button disabled type="button" class="button tbt-choose-image">Choose picture</button> <button disabled type="button" class="button tbt-clear-image">Clear picture</button></p><img class="tbt-image-preview" ' . ( $value ? 'src="' . esc_url( $value ) . '"' : 'hidden' ) . ' alt="Selected picture preview"></div>';
		} else {
			echo '<input class="large-text" type="' . esc_attr( 'number' === $field[1] ? 'number' : 'text' ) . '" ' . ( 'number' === $field[1] ? 'min="0" step="1"' : '' ) . ' id="' . esc_attr( $id ) . '" name="tbt_content[' . esc_attr( $name ) . ']" value="' . esc_attr( $value ) . '">';
		}
		echo '</div>';
	}
	echo '</div>';
}

add_action( 'save_post', 'tbt_content_save_fields', 10, 2 );
function tbt_content_save_fields( int $id, WP_Post $post ): void {
	if ( wp_is_post_revision( $id ) || wp_is_post_autosave( $id ) || ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) ) { return; }
	if ( ! current_user_can( 'edit_post', $id ) || ! isset( $_POST['tbt_content_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['tbt_content_nonce'] ) ), 'tbt_content_save_' . $id ) ) { return; }
	$input = isset( $_POST['tbt_content'] ) && is_array( $_POST['tbt_content'] ) ? wp_unslash( $_POST['tbt_content'] ) : array();
	foreach ( tbt_content_fields( $post->post_type ) as $name => $field ) {
		if ( ! array_key_exists( $name, $input ) ) { continue; }
		$value = tbt_content_sanitize( $input[ $name ], $field );
		if ( 'image' === $field[1] ) {
			$attachment = absint( $input[ $name . '_id' ] ?? 0 );
			if ( $attachment && ! wp_attachment_is_image( $attachment ) ) { continue; }
			if ( $attachment ) { $value = (string) wp_get_attachment_image_url( $attachment, 'full' ); }
			update_post_meta( $id, '_tbt_' . $name . '_id', $attachment );
		}
		update_post_meta( $id, '_tbt_' . $name, wp_slash( $value ) );
	}
}

add_action( 'admin_enqueue_scripts', static function ( $hook ) {
	$screen = get_current_screen();
	$seo = str_contains( $hook, 'tbt-page-seo' );
	if ( ! $seo && ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) || ! $screen || ! tbt_content_fields( (string) $screen->post_type ) ) ) { return; }
	wp_enqueue_media();
	wp_enqueue_script( 'tbt-content-admin', plugins_url( 'assets/admin.js', dirname( __DIR__ ) . '/tbt-content.php' ), array( 'media-views' ), TBT_CONTENT_VERSION, true );
	wp_enqueue_style( 'tbt-content-admin', plugins_url( 'assets/admin.css', dirname( __DIR__ ) . '/tbt-content.php' ), array(), TBT_CONTENT_VERSION );
} );

add_filter( 'page_row_actions', static function ( $actions, $post ) {
	if ( 'page' === $post->post_type && current_user_can( 'edit_post', $post->ID ) ) { $actions['tbt_seo'] = '<a href="' . esc_url( admin_url( 'edit.php?post_type=page&page=tbt-page-seo&post=' . $post->ID ) ) . '">SEO &amp; Sharing</a>'; }
	return $actions;
}, 10, 2 );

add_action( 'admin_menu', static function () { add_submenu_page( 'edit.php?post_type=page', 'SEO & Sharing', 'SEO & Sharing', 'edit_pages', 'tbt-page-seo', 'tbt_content_seo_page' ); } );
function tbt_content_seo_page(): void {
	if ( ! current_user_can( 'edit_pages' ) ) { return; }
	$id = absint( $_GET['post'] ?? 0 );
	$post = $id ? get_post( $id ) : null;
	echo '<div class="wrap"><h1>SEO &amp; Sharing</h1>';
	if ( ! $post ) {
		echo '<p>Choose a page to edit its search title, description and sharing picture.</p><ul>';
		foreach ( get_pages( array( 'post_status' => array( 'publish', 'draft', 'private' ) ) ) as $page ) {
			if ( current_user_can( 'edit_post', $page->ID ) ) { echo '<li><a href="' . esc_url( admin_url( 'edit.php?post_type=page&page=tbt-page-seo&post=' . $page->ID ) ) . '">' . esc_html( $page->post_title ) . '</a></li>'; }
		}
		echo '</ul></div>'; return;
	}
	if ( 'page' !== $post->post_type || ! current_user_can( 'edit_post', $id ) ) { wp_die( 'You cannot edit this page.' ); }
	wp_enqueue_media();
	wp_enqueue_script( 'tbt-content-admin', plugins_url( 'assets/admin.js', dirname( __DIR__ ) . '/tbt-content.php' ), array( 'media-views' ), TBT_CONTENT_VERSION, true );
	wp_enqueue_style( 'tbt-content-admin', plugins_url( 'assets/admin.css', dirname( __DIR__ ) . '/tbt-content.php' ), array(), TBT_CONTENT_VERSION );
	echo '<h2>' . esc_html( $post->post_title ) . '</h2>';
	if ( isset( $_GET['saved'] ) ) { echo '<div class="notice notice-success"><p>Search and sharing settings saved.</p></div>'; }
	echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '"><input type="hidden" name="action" value="tbt_save_seo"><input type="hidden" name="post_ID" value="' . $id . '">';
	tbt_content_box( $post ); submit_button( 'Save Search & Sharing' );
	echo '</form><p><a href="' . esc_url( get_permalink( $id ) ) . '" target="_blank" rel="noopener">View page</a> · <a href="' . esc_url( admin_url( 'edit.php?post_type=page' ) ) . '">Back to Pages</a></p></div>';
}
add_action( 'admin_post_tbt_save_seo', static function () {
	$id = absint( $_POST['post_ID'] ?? 0 ); $post = get_post( $id );
	if ( ! $post || 'page' !== $post->post_type || ! current_user_can( 'edit_post', $id ) ) { wp_die( 'You cannot edit this page.', '', array( 'response' => 403 ) ); }
	check_admin_referer( 'tbt_content_save_' . $id, 'tbt_content_nonce' );
	wp_save_post_revision( $id ); tbt_content_save_fields( $id, $post ); wp_save_post_revision( $id ); tbt_content_clear_cache();
	wp_safe_redirect( admin_url( 'edit.php?post_type=page&page=tbt-page-seo&post=' . $id . '&saved=1' ) ); exit;
} );

foreach ( array( 'tbt_service', 'tbt_testimonial', 'tbt_smile', 'tbt_location' ) as $tbt_type ) {
	add_filter( 'manage_' . $tbt_type . '_posts_columns', static function ( $columns ) { $columns['tbt_order'] = 'Order'; $columns['tbt_display'] = 'Website display'; return $columns; } );
	add_action( 'manage_' . $tbt_type . '_posts_custom_column', static function ( $column, $id ) {
		if ( 'tbt_order' === $column ) { echo (int) get_post_field( 'menu_order', $id ); }
		if ( 'tbt_display' === $column ) {
			$type = get_post_type( $id );
			echo esc_html( 'tbt_service' === $type ? ( '1' === tbt_content_value( $id, 'home_featured' ) ? 'Services + Home' : 'Services' ) : ( 'tbt_smile' === $type ? ( 'comparison' === tbt_content_value( $id, 'placement' ) ? 'Gallery comparison' : 'Gallery card' ) : ( 'tbt_location' === $type ? 'appointment' === tbt_content_value( $id, 'mode' ) ? 'City pop-up — appointment' : 'City pop-up — address' : 'Home testimonials' ) ) );
		}
	}, 10, 2 );
}
unset( $tbt_type );
add_filter( 'manage_tbt_location_posts_columns', static function ( $columns ) {
	$columns['tbt_city'] = 'Public city'; $columns['tbt_area'] = 'Area'; $columns['tbt_practice'] = 'Practice'; return $columns;
}, 20 );
add_action( 'manage_tbt_location_posts_custom_column', static function ( $column, $id ) {
	$fields = array( 'tbt_city' => 'city', 'tbt_area' => 'area', 'tbt_practice' => 'practice' );
	if ( isset( $fields[ $column ] ) ) { echo esc_html( tbt_content_value( $id, $fields[ $column ] ) ?: '—' ); }
}, 20, 2 );
add_action( 'pre_get_posts', static function ( $query ) {
	if ( is_admin() && $query->is_main_query() && in_array( $query->get( 'post_type' ), array( 'tbt_service', 'tbt_testimonial', 'tbt_smile', 'tbt_location' ), true ) && ! $query->get( 'orderby' ) ) { $query->set( 'orderby', array( 'menu_order' => 'ASC', 'ID' => 'ASC' ) ); }
} );
