<?php
/** Shared, editable city disclosures; verified against teethbytrev.com. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

// A shared-footer edit affects the homepage as well as every page footer.
add_action( 'elementor/editor/after_save', static function ( $id ) {
	if ( (int) $id === absint( get_option( 'tbt_editor_footer' ) ) ) {
		if ( function_exists( 'tbt_content_clear_cache' ) ) { tbt_content_clear_cache(); }
		else { do_action( 'litespeed_purge_all' ); }
	}
}, 20 );

function tbt_location_defaults(): array {
	return array(
		array( 'city' => 'Beverly Hills', 'venue' => 'Bedford Dental Group', 'address' => "436 N Bedford Dr, Suite 300\nBeverly Hills, CA 90210", 'maps_query' => 'Bedford Dental Group, 436 N Bedford Dr Suite 300, Beverly Hills, CA 90210' ),
		array( 'city' => 'New York', 'subtitle' => 'Manhattan', 'venue' => 'Nylo', 'address' => "10 W 37th St, 3rd Floor\nNew York, NY 10018", 'maps_query' => '10 W 37th St 3rd Floor, New York, NY 10018' ),
		array( 'city' => 'New York', 'subtitle' => 'Brooklyn', 'venue' => 'Pure Dentistry Arts', 'address' => "761 Washington Ave\nBrooklyn, NY 11238", 'maps_query' => 'Pure Dentistry Arts, 761 Washington Ave, Brooklyn, NY 11238' ),
		array( 'city' => 'Atlanta', 'venue' => 'Dentistry in Motion Suites', 'address' => "572 Hank Aaron Drive SE, Suite 1110\nAtlanta, GA 30312", 'maps_query' => 'Dentistry in Motion Suites, 572 Hank Aaron Drive SE Suite 1110, Atlanta, GA 30312' ),
		array( 'city' => 'Houston', 'venue' => 'FLOSS Midtown', 'address' => "2707 Milam St, Suite C\nHouston, TX 77006", 'maps_query' => 'FLOSS Midtown, 2707 Milam St Suite C, Houston, TX 77006' ),
		array( 'city' => 'Miami', 'venue' => 'All Smiles at Sunset', 'address' => "8585 SW 72nd Street, Suite 101\nMiami, FL 33143", 'maps_query' => 'All Smiles at Sunset, 8585 SW 72nd Street Suite 101, Miami, FL 33143' ),
		array( 'city' => 'Washington D.C.', 'address' => "1010 Quincy St NE\nWashington, DC 20017", 'maps_query' => '1010 Quincy St NE, Washington, DC 20017' ),
		array( 'city' => 'Tampa' ), array( 'city' => 'Memphis' ),
	);
}

/** The Site Footer Elementor document owns locations for both instances. */
function tbt_location_rows(): array {
	$id = absint( get_option( 'tbt_editor_footer' ) );
	$data = json_decode( (string) get_post_meta( $id, '_elementor_data', true ), true );
	$find = static function ( array $elements ) use ( &$find ): ?array {
		foreach ( $elements as $element ) {
			if ( 'tbt-site-footer' === ( $element['widgetType'] ?? '' ) && array_key_exists( 'location_items', $element['settings'] ?? array() ) ) { return is_array( $element['settings']['location_items'] ) ? $element['settings']['location_items'] : array(); }
			$rows = $find( $element['elements'] ?? array() ); if ( null !== $rows ) { return $rows; }
		}
		return null;
	};
	return $find( is_array( $data ) ? $data : array() ) ?? tbt_location_defaults();
}

function tbt_location_list( string $area = 'footer', ?array $rows = null ): string {
	$groups = array();
	foreach ( $rows ?? tbt_location_rows() as $row ) {
		$city = sanitize_text_field( $row['city'] ?? '' );
		if ( '' !== $city ) { $groups[ $city ][] = $row; }
	}
	$html = '<div class="tbt-city-list tbt-city-list--' . esc_attr( $area ) . '">';
	foreach ( $groups as $city => $locations ) {
		$id = wp_unique_id( 'tbt-city-' );
		$html .= '<span class="tbt-city"><button type="button" class="tbt-city-button" id="' . esc_attr( $id ) . '-button" aria-expanded="false" aria-controls="' . esc_attr( $id ) . '">' . esc_html( $city ) . '</button>';
		$html .= '<span hidden class="tbt-city-popup" id="' . esc_attr( $id ) . '" role="region" aria-labelledby="' . esc_attr( $id ) . '-button"><span class="tbt-city-heading">' . esc_html( $city ) . '</span><span class="tbt-city-places">';
		foreach ( $locations as $row ) {
			$html .= '<span class="tbt-city-place">';
			if ( ! empty( $row['subtitle'] ) ) { $html .= '<span class="tbt-city-subtitle">' . esc_html( $row['subtitle'] ) . '</span>'; }
			if ( ! empty( $row['venue'] ) ) { $html .= '<span class="tbt-city-venue">' . esc_html( $row['venue'] ) . '</span>'; }
			if ( ! empty( $row['address'] ) ) {
				$html .= '<span class="tbt-city-address">';
				foreach ( explode( "\n", $row['address'] ) as $line ) { $html .= '<span>' . esc_html( $line ) . '</span>'; }
				$html .= '</span>';
				$query = $row['maps_query'] ?? ''; if ( '' === trim( $query ) ) { $query = str_replace( "\n", ', ', $row['address'] ); }
				$html .= '<a class="tbt-city-directions" target="_blank" rel="noopener noreferrer" href="' . esc_url( 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode( $query ) ) . '">Get directions ↗</a>';
			} else {
				$html .= '<span class="tbt-city-address">By appointment. <a class="tbt-city-text" href="sms:+14246723910">Text 424-672-3910</a> to arrange your visit.</span>';
			}
			$html .= '</span>';
		}
		$html .= '</span></span></span>';
	}
	return $html . '</div>';
}

/** Presentation update only: archived Elementor field values are not overwritten. */
function tbt_location_template( string $key, string $html, array $settings ): string {
	if ( 'site-footer' === $key ) {
		$html = preg_replace( '~<p[^>]*>\{\{content_018\}\}</p>~', '', $html );
		$html = str_replace( '{{content_019}}<br>{{content_020}}<br>', '', $html );
		$html = str_replace( '<span>{{content_030}}</span>', tbt_location_list( 'footer', $settings['location_items'] ?? null ), $html );
	} elseif ( 'home-10' === $key ) {
		$html = preg_replace( '~<address[^>]*>\{\{content_009\}\}</address>~', tbt_location_list( 'prefooter' ), $html );
	}
	return $html;
}
