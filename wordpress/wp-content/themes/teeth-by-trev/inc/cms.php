<?php
/** Presentation adapters. Content ownership remains in TBT Content Manager. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function tbt_cms_active(): bool { return function_exists( 'tbt_content_enabled' ) && tbt_content_enabled(); }
function tbt_cms_layouts(): array {
	static $data;
	if ( null === $data ) { $data = json_decode( file_get_contents( __DIR__ . '/cms-layouts.json' ), true ); }
	return is_array( $data ) ? $data : array();
}
function tbt_cms_managed( string $key ): array {
	if ( ! tbt_cms_active() ) { return array(); }
	if ( 'gallery-3' === $key ) { return array( 'gallery_items' ); }
	return tbt_cms_layouts()[ $key ]['managed'] ?? array();
}

class TBT_CMS_Menu_Walker extends Walker_Nav_Menu {
	private int $number = 0;
	public function start_lvl( &$output, $depth = 0, $args = null ) {
		$output .= 'primary' === $args->theme_location ? '<ul class="tbt-cms-submenu">' : '<div class="tbt-cms-submenu">';
	}
	public function end_lvl( &$output, $depth = 0, $args = null ) { $output .= 'primary' === $args->theme_location ? '</ul>' : '</div>'; }
	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
		$primary = 'primary' === $args->theme_location;
		$current = $item->current ? ' aria-current="page"' : '';
		$target = '_blank' === $item->target ? ' target="_blank" rel="noopener noreferrer"' : '';
		$title = esc_html( apply_filters( 'the_title', $item->title, $item->ID ) );
		$attributes = ' href="' . esc_url( $item->url ) . '"' . $current . $target;
		if ( $primary ) {
			if ( 0 === $depth ) { ++$this->number; }
			$output .= '<li><a class="group flex items-baseline gap-7 py-2"' . $attributes . '><span class="text-xs tracking-[0.24em] text-gold/70">' . esc_html( 0 === $depth ? str_pad( (string) $this->number, 2, '0', STR_PAD_LEFT ) : '—' ) . '</span><span class="font-serif text-4xl font-light text-ivory/80 transition-colors group-hover:text-gold sm:text-6xl">' . $title . '</span></a>';
		} else { $output .= '<a class="transition-colors hover:text-gold"' . $attributes . '>' . $title . '</a>'; }
	}
	public function end_el( &$output, $item, $depth = 0, $args = null ) { if ( 'primary' === $args->theme_location ) { $output .= '</li>'; } }
}

function tbt_cms_menu( string $location ): string {
	return (string) wp_nav_menu( array( 'theme_location' => $location, 'container' => false, 'fallback_cb' => false, 'echo' => false, 'depth' => 0, 'items_wrap' => 'primary' === $location ? '<ul class="space-y-2 tbt-cms-native-menu">%3$s</ul>' : '%3$s', 'walker' => new TBT_CMS_Menu_Walker() ) );
}

function tbt_cms_fill( string $template, array $values ): string {
	$replace = array();
	foreach ( $values as $name => $value ) { $replace[ '{{' . $name . '}}' ] = in_array( $name, array( 'image', 'before_image' ), true ) ? esc_url( $value ) : esc_html( $value ); }
	return strtr( $template, $replace );
}

/** Return replacement template plus escaped row markup, or leave Elementor intact. */
function tbt_cms_section( string $key, array &$settings, array &$replace ): ?string {
	if ( ! tbt_cms_active() ) { return null; }
	$layout = tbt_cms_layouts()[ $key ] ?? null;
	if ( in_array( $key, array( 'site-header', 'site-footer' ), true ) ) {
		foreach ( array( 'primary', 'footer', 'legal' ) as $location ) { $replace[ '{{' . $location . '_menu}}' ] = tbt_cms_menu( $location ); }
		return $layout['html'];
	}
	if ( 'gallery-3' === $key ) {
		$settings['gallery_items'] = array();
		foreach ( tbt_content_records( 'tbt_smile' ) as $post ) {
			if ( 'comparison' === tbt_content_value( $post->ID, 'placement' ) ) { continue; }
			$image = tbt_content_value( $post->ID, 'image' );
			if ( ! $image ) { continue; }
			$settings['gallery_items'][] = array( 'title' => $post->post_title, 'caption' => tbt_content_value( $post->ID, 'caption' ), 'alt' => tbt_content_value( $post->ID, 'alt' ), 'image' => array( 'url' => $image ) );
		}
		return null;
	}
	$types = array( 'services-2' => 'tbt_service', 'home-5' => 'tbt_service', 'home-9' => 'tbt_testimonial', 'gallery-2' => 'tbt_smile' );
	if ( ! isset( $types[ $key ] ) || ! $layout ) { return null; }
	$records = tbt_content_records( $types[ $key ] );
	if ( 'home-5' === $key ) {
		$records = array_values( array_filter( $records, static function ( $post ) { return '1' === tbt_content_value( $post->ID, 'home_featured' ); } ) );
		usort( $records, static function ( $a, $b ) { return ( (int) tbt_content_value( $a->ID, 'home_order' ) <=> (int) tbt_content_value( $b->ID, 'home_order' ) ) ?: ( $a->ID <=> $b->ID ); } );
	}
	$rows = ''; $index = 0;
	foreach ( $records as $post ) {
		$id = $post->ID;
		$value = static function ( $name ) use ( $id ) { return tbt_content_value( $id, $name ); };
		if ( 'gallery-2' === $key && ( 'comparison' !== $value( 'placement' ) || ! $value( 'image' ) || ! $value( 'before_image' ) ) ) { continue; }
		$v = array( 'title' => $post->post_title, 'description' => $value( 'description' ), 'image' => $value( 'image' ), 'alt' => $value( 'alt' ), 'number' => $value( 'number' ) ?: str_pad( (string) ( $index + 1 ), 2, '0', STR_PAD_LEFT ) );
		$template = $layout['templates'][ $index % min( 2, count( $layout['templates'] ) ) ];
		if ( 'services-2' === $key ) {
			$position = in_array( $value( 'position' ), array( 'top', 'bottom' ), true ) ? $value( 'position' ) : 'center';
			$template = str_replace( array( 'object-top', 'object-center' ), 'object-' . $position, $template );
			$features = array_values( array_filter( explode( "\n", $value( 'features' ) ), static function ( $line ) { return '' !== trim( $line ); } ) );
			$marks = get_post_meta( $id, '_tbt_feature_marks', true );
			$feature_html = '';
			foreach ( $features as $i => $feature ) { $feature_html .= '<li class="text-[0.72rem] uppercase tracking-[0.18em] text-ivory/55"><span class="mr-2 text-gold">' . esc_html( $marks[ $i ] ?? '—' ) . '</span>' . esc_html( $feature ) . '</li>'; }
			$template = preg_replace_callback( '~(<ul\b[^>]*>).*?(</ul>)~s', static function ( $match ) use ( $feature_html ) { return $match[1] . $feature_html . $match[2]; }, $template );
		} elseif ( 'home-5' === $key ) {
			foreach ( array( 'title', 'description', 'image', 'alt', 'number' ) as $field ) { $v[ $field ] = $value( 'home_' . $field ) ?: $v[ $field ]; }
			$v['eyebrow'] = $value( 'home_eyebrow' );
		} elseif ( 'home-9' === $key ) { $v['quote'] = $value( 'quote' ); $v['treatment'] = $value( 'treatment' ); }
		elseif ( 'gallery-2' === $key ) {
			foreach ( array( 'before_image', 'before_alt', 'caption' ) as $field ) { $v[ $field ] = $value( $field ); }
			$v['after_label'] = $value( 'after_label' ) ?: 'After'; $v['before_label'] = $value( 'before_label' ) ?: 'Before';
		}
		// Empty pictures do not generate broken image requests; the remaining content stays editable.
		if ( ! $v['image'] && in_array( $key, array( 'services-2', 'home-5' ), true ) ) { $template = preg_replace( '~<img\b[^>]*>~', '', $template ); }
		$rows .= tbt_cms_fill( $template, $v ); ++$index;
	}
	$replace['{{cms_items}}'] = $rows;
	return $layout['html'];
}

/** Read saved widgets. Refuse ambiguous/missing layouts instead of guessing. */
function tbt_cms_export() {
	$keys = array( 'home' => array( 'home-5', 'home-9' ), 'services' => array( 'services-2' ), 'gallery' => array( 'gallery-2', 'gallery-3' ), 'tbt-site-header' => array( 'site-header' ), 'tbt-site-footer' => array( 'site-footer' ) );
	$sections = array(); $documents = array();
	foreach ( $keys as $slug => $wanted ) {
		$post = get_page_by_path( $slug, OBJECT, str_starts_with( $slug, 'tbt-site-' ) ? 'elementor_library' : 'page' );
		if ( ! $post || ! get_post_meta( $post->ID, '_tbt_editor_prepared', true ) ) { return new WP_Error( 'missing_page', 'Prepared Elementor page missing: ' . $slug ); }
		$data = json_decode( get_post_meta( $post->ID, '_elementor_data', true ), true );
		$documents[ $post->ID ] = array( 'title' => $post->post_title, 'elementor' => $data );
		$found = array();
		$walk = static function ( $elements ) use ( &$walk, &$found ) {
			foreach ( $elements ?: array() as $element ) {
				if ( isset( $element['widgetType'] ) ) { $found[ $element['widgetType'] ][] = $element['settings'] ?? array(); }
				$walk( $element['elements'] ?? array() );
			}
		}; $walk( $data );
		foreach ( $wanted as $key ) {
			if ( 1 !== count( $found[ 'tbt-' . $key ] ?? array() ) ) { return new WP_Error( 'ambiguous', 'Expected exactly one section ' . $key . '. Nothing was switched.' ); }
			$defaults = array_map( static function ( $control ) { return $control['default']; }, tbt_editor_layouts()['sections'][ $key ]['controls'] );
			$sections[ $key ] = array_merge( $defaults, $found[ 'tbt-' . $key ][0] );
		}
	}
	$get = static function ( $key, $number ) use ( $sections ) { $v = $sections[ $key ][ 'content_' . str_pad( (string) $number, 3, '0', STR_PAD_LEFT ) ] ?? ''; return tbt_editor_resolve( is_array( $v ) ? ( $v['url'] ?? '' ) : (string) $v ); };
	$media_id = static function ( $key, $number ) use ( $sections ) { $v = $sections[ $key ][ 'content_' . str_pad( (string) $number, 3, '0', STR_PAD_LEFT ) ] ?? array(); return is_array( $v ) ? absint( $v['id'] ?? 0 ) : 0; };
	$records = array();
	for ( $i = 0; $i < 5; ++$i ) {
		$offset = 11 + $i * 9;
		$records[ 'service-' . $i ] = array( 'type' => 'tbt_service', 'title' => $get( 'services-2', $offset + 1 ), 'order' => $i + 1, 'meta' => array(
			'_tbt_description' => $get( 'services-2', $offset + 2 ), '_tbt_image' => $get( 'services-2', 1 + $i * 2 ), '_tbt_alt' => $get( 'services-2', 2 + $i * 2 ),
			'_tbt_image_id' => $media_id( 'services-2', 1 + $i * 2 ),
			'_tbt_position' => 0 === $i ? 'top' : 'center', '_tbt_features' => implode( "\n", array( $get( 'services-2', $offset + 4 ), $get( 'services-2', $offset + 6 ), $get( 'services-2', $offset + 8 ) ) ),
			'_tbt_feature_marks' => array( $get( 'services-2', $offset + 3 ), $get( 'services-2', $offset + 5 ), $get( 'services-2', $offset + 7 ) ),
			'_tbt_number' => $get( 'services-2', $offset ) === str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT ) ? '' : $get( 'services-2', $offset ),
		) );
	}
	foreach ( array( 1, 3, 2, 4 ) as $i => $service ) {
		$meta =& $records[ 'service-' . $service ]['meta'];
		$meta['_tbt_home_featured'] = '1'; $meta['_tbt_home_order'] = (string) ( $i + 1 );
		$meta['_tbt_home_image_id'] = $media_id( 'home-5', 1 + $i * 2 );
		foreach ( array( 'image' => 1 + $i * 2, 'alt' => 2 + $i * 2, 'eyebrow' => 13 + $i * 4, 'title' => 14 + $i * 4, 'description' => 15 + $i * 4 ) as $name => $number ) { $meta[ '_tbt_home_' . $name ] = $get( 'home-5', $number ); }
		// Only retain editorial overrides when they actually differ from the master.
		foreach ( array( 'image', 'alt', 'title', 'description' ) as $name ) {
			$master = 'title' === $name ? $records[ 'service-' . $service ]['title'] : ( $meta[ '_tbt_' . $name ] ?? '' );
			if ( $meta[ '_tbt_home_' . $name ] === $master ) { $meta[ '_tbt_home_' . $name ] = ''; if ( 'image' === $name ) { $meta['_tbt_home_image_id'] = 0; } }
		}
		$meta['_tbt_home_number'] = $get( 'home-5', 12 + $i * 4 ) === str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT ) ? '' : $get( 'home-5', 12 + $i * 4 );
		unset( $meta );
	}
	for ( $i = 0; $i < 2; ++$i ) { $records[ 'testimonial-' . $i ] = array( 'type' => 'tbt_testimonial', 'title' => $get( 'home-9', 2 + $i * 3 ), 'order' => $i + 1, 'meta' => array( '_tbt_quote' => $get( 'home-9', 1 + $i * 3 ), '_tbt_treatment' => $get( 'home-9', 3 + $i * 3 ) ) ); }
	foreach ( $sections['gallery-3']['gallery_items'] ?? tbt_editor_layouts()['sections']['gallery-3']['gallery'] as $i => $item ) {
		$records[ 'gallery-' . $i ] = array( 'type' => 'tbt_smile', 'title' => (string) ( $item['title'] ?? '' ), 'order' => $i + 1, 'meta' => array( '_tbt_placement' => 'card', '_tbt_caption' => (string) ( $item['caption'] ?? '' ), '_tbt_image' => tbt_editor_resolve( $item['image']['url'] ?? '' ), '_tbt_image_id' => absint( $item['image']['id'] ?? 0 ), '_tbt_alt' => (string) ( $item['alt'] ?? '' ) ) );
	}
	$records['comparison-0'] = array( 'type' => 'tbt_smile', 'title' => 'Before & After', 'order' => 1, 'meta' => array( '_tbt_placement' => 'comparison' ) );
	$records['comparison-0']['meta']['_tbt_image_id'] = $media_id( 'gallery-2', 1 );
	$records['comparison-0']['meta']['_tbt_before_image_id'] = $media_id( 'gallery-2', 3 );
	foreach ( array( 'image' => 1, 'alt' => 2, 'before_image' => 3, 'before_alt' => 4, 'after_label' => 7, 'before_label' => 8, 'caption' => 9 ) as $name => $number ) { $records['comparison-0']['meta'][ '_tbt_' . $name ] = $get( 'gallery-2', $number ); }
	$menus = array( 'primary' => array(), 'footer' => array(), 'legal' => array() );
	for ( $i = 0; $i < 6; ++$i ) {
		$menus['primary'][] = array( 'title' => $get( 'site-header', 15 + $i * 2 ), 'url' => $get( 'site-header', 5 + $i ) );
		$menus['footer'][] = array( 'title' => $get( 'site-footer', 23 + $i ), 'url' => $get( 'site-footer', 9 + $i ) );
	}
	for ( $i = 0; $i < 2; ++$i ) { $menus['legal'][] = array( 'title' => $get( 'site-footer', 31 + $i ), 'url' => $get( 'site-footer', 15 + $i ) ); }
	return array( 'records' => $records, 'menus' => $menus, 'documents' => $documents );
}
