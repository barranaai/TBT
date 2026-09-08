<?php
/** Typed content controls retain the approved design; markup is source-controlled.
 * @package TeethByTrev
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TBT_Elementor_Section extends \Elementor\Widget_Base {
	private $layout_key;
	public function __construct( $data = array(), $args = null, $key = '' ) {
		$this->layout_key = $key ?: substr( $data['widgetType'] ?? '', 4 );
		parent::__construct( $data, $args );
	}
	public function get_name() { return 'tbt-' . $this->layout_key; }
	public function get_title() { return tbt_editor_layouts()['sections'][ $this->layout_key ]['title'] ?? 'TBT Section'; }
	public function get_icon() { return 'eicon-editor-paragraph'; }
	public function get_categories() { return array( 'tbt' ); }
	public function get_keywords() { return array( 'tbt', 'teeth', $this->layout_key ); }
	protected function is_dynamic_content(): bool { return true; }
	protected function register_controls() {
		$layout = tbt_editor_layouts()['sections'][ $this->layout_key ];
		if ( 'site-footer' === $this->layout_key ) {
			$this->start_controls_section( 'section_locations', array( 'label' => 'City pop-ups (shared with pre-footer)' ) );
			$locations = new \Elementor\Repeater();
			foreach ( array( 'city' => 'City (same name groups multiple locations)', 'subtitle' => 'Area, e.g. Manhattan', 'venue' => 'Practice name', 'address' => 'Address (one line per line; blank = by appointment)', 'maps_query' => 'Google Maps search text (optional)' ) as $name => $label ) {
				$locations->add_control( $name, array( 'label' => $label, 'type' => 'address' === $name ? 'textarea' : 'text', 'label_block' => true ) );
			}
			$this->add_control( 'location_items', array( 'type' => 'repeater', 'fields' => $locations->get_controls(), 'title_field' => '{{{ city }}} — {{{ venue }}}', 'default' => tbt_location_defaults() ) );
			$this->end_controls_section();
		}
		$managed = function_exists( 'tbt_cms_managed' ) ? tbt_cms_managed( $this->layout_key ) : array();
		if ( $managed ) {
			$this->start_controls_section( 'section_cms', array( 'label' => 'Managed WordPress content' ) );
			$this->add_control( 'cms_legacy_mode', array( 'type' => 'hidden', 'default' => 'no' ) );
			$links = array( 'site-header' => 'nav-menus.php', 'site-footer' => 'nav-menus.php', 'services-2' => 'edit.php?post_type=tbt_service', 'home-5' => 'edit.php?post_type=tbt_service', 'home-9' => 'edit.php?post_type=tbt_testimonial', 'gallery-2' => 'edit.php?post_type=tbt_smile', 'gallery-3' => 'edit.php?post_type=tbt_smile' );
			$this->add_control( 'cms_help', array( 'type' => 'raw_html', 'raw' => 'Repeated content is managed in WordPress. Existing Elementor values remain archived as a fallback. <a target="_blank" rel="noopener" href="' . esc_url( admin_url( $links[ $this->layout_key ] ) ) . '">Open content manager</a>', 'content_classes' => 'elementor-panel-alert elementor-panel-alert-info' ) );
			$this->end_controls_section();
		}
		$groups = array( 'text' => 'Text', 'media' => 'Pictures and video', 'links' => 'Links' );
		foreach ( $groups as $group => $label ) {
			$section_config = array( 'label' => $label );
			$group_fields = array_keys( array_filter( $layout['controls'], static function ( $control ) use ( $group ) { $type = $control['type']; return $group === ( in_array( $type, array( 'media', 'video' ), true ) ? 'media' : ( 'url' === $type ? 'links' : 'text' ) ); } ) );
			if ( $managed && ! array_diff( $group_fields, $managed ) ) { $section_config['condition'] = array( 'cms_legacy_mode' => 'yes' ); }
			$this->start_controls_section( 'section_' . $group, $section_config );
			foreach ( $layout['controls'] as $name => $control ) {
				$type = $control['type'];
				$control_group = in_array( $type, array( 'media', 'video' ), true ) ? 'media' : ( 'url' === $type ? 'links' : 'text' );
				if ( $group !== $control_group ) { continue; }
				$value = tbt_editor_resolve( $control['default'] );
				$config = array( 'label' => $control['label'], 'type' => 'video' === $type ? 'media' : $type, 'default' => $value, 'label_block' => true );
				if ( ( 'site-footer' === $this->layout_key && in_array( $name, array( 'content_018', 'content_019', 'content_020', 'content_030' ), true ) ) || ( 'home-10' === $this->layout_key && 'content_009' === $name ) ) { $config['type'] = 'hidden'; }
				if ( in_array( $name, $managed, true ) ) { $config['condition'] = array( 'cms_legacy_mode' => 'yes' ); }
				if ( in_array( $type, array( 'media', 'video', 'url' ), true ) ) { $config['default'] = array( 'url' => $value, 'id' => 0 ); }
				if ( 'video' === $type ) { $config['media_types'] = array( 'video' ); }
				if ( 'url' === $type ) { $config['options'] = array( 'url' ); }
				$this->add_control( $name, $config );
			}
			$this->end_controls_section();
		}
		if ( isset( $layout['gallery'] ) ) {
			$gallery_config = array( 'label' => __( 'Gallery cards', 'teeth-by-trev' ) );
			if ( in_array( 'gallery_items', $managed, true ) ) { $gallery_config['condition'] = array( 'cms_legacy_mode' => 'yes' ); }
			$this->start_controls_section( 'section_gallery', $gallery_config );
			$repeater = new \Elementor\Repeater();
			$repeater->add_control( 'image', array( 'label' => __( 'Picture', 'teeth-by-trev' ), 'type' => 'media' ) );
			foreach ( array( 'title' => 'Title', 'caption' => 'Caption', 'alt' => 'Image description (accessibility)' ) as $name => $label ) { $repeater->add_control( $name, array( 'label' => $label, 'type' => 'text', 'label_block' => true ) ); }
			$this->add_control( 'gallery_items', array( 'type' => 'repeater', 'fields' => $repeater->get_controls(), 'title_field' => '{{{ title }}}', 'default' => $layout['gallery'] ) );
			$this->end_controls_section();
		}
	}
	protected function render() {
		$layout = tbt_editor_layouts()['sections'][ $this->layout_key ] ?? null;
		if ( ! $layout ) { return; }
		$settings = $this->get_settings_for_display();
		$replace = array();
		foreach ( $layout['controls'] as $name => $control ) {
			$value = $settings[ $name ] ?? $control['default'];
			if ( in_array( $control['type'], array( 'media', 'video', 'url' ), true ) ) {
				$value = is_array( $value ) ? ( $value['url'] ?? '' ) : $value;
				$replace[ '{{' . $name . '}}' ] = esc_url( tbt_editor_resolve( (string) $value ) );
			} elseif ( 'number' === $control['type'] ) {
				$replace[ '{{' . $name . '}}' ] = esc_attr( (string) max( 0, (float) $value ) );
			} else {
				$replace[ '{{' . $name . '}}' ] = esc_html( (string) $value );
			}
		}
		$replace['{{inquiry_form}}'] = shortcode_exists( 'tbt_inquiry_form' ) ? do_shortcode( '[tbt_inquiry_form]' ) : '<p>Please contact our team directly.</p>';
		$type = sanitize_key( wp_unslash( $_GET['type'] ?? '' ) );
		$type = in_array( $type, array( 'video', 'in-person' ), true ) ? $type : '';
		$replace['{{consultation_label}}'] = esc_html( 'Reserve · ' . ( 'video' === $type ? 'Video consultation' : ( 'in-person' === $type ? 'In-person consultation' : 'Private consultation' ) ) );
		$replace['{{deposit_form}}'] = shortcode_exists( 'tbt_square_deposit' ) ? do_shortcode( '[tbt_square_deposit type="' . $type . '"]' ) : '<p>Please contact our team directly.</p>';
		$replace['{{gallery_items}}'] = '';
		$cms_html = function_exists( 'tbt_cms_section' ) ? tbt_cms_section( $this->layout_key, $settings, $replace ) : null;
		foreach ( $settings['gallery_items'] ?? array() as $item ) {
			$replace['{{gallery_items}}'] .= '<figure class="tbt-gallery-case reveal group relative aspect-[4/5] overflow-hidden"><img src="' . esc_url( tbt_editor_resolve( $item['image']['url'] ?? '' ) ) . '" alt="' . esc_attr( $item['alt'] ?? '' ) . '" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"><div class="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100"></div><div class="pointer-events-none absolute inset-0 border border-ivory/10"></div><figcaption class="absolute inset-x-0 bottom-0 translate-y-2 p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"><span class="block font-serif text-2xl font-light text-ivory">' . esc_html( $item['title'] ?? '' ) . '</span><span class="text-[0.72rem] uppercase tracking-[0.18em] text-champagne">' . esc_html( $item['caption'] ?? '' ) . '</span></figcaption></figure>';
		}
		echo strtr( tbt_editor_resolve( tbt_location_template( $this->layout_key, $cms_html ?? $layout['html'], $settings ) ), $replace ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Immutable markup; replacements escaped above.
	}
}
