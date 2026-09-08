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
		$groups = array( 'text' => 'Text', 'media' => 'Pictures and video', 'links' => 'Links' );
		foreach ( $groups as $group => $label ) {
			$this->start_controls_section( 'section_' . $group, array( 'label' => $label ) );
			foreach ( $layout['controls'] as $name => $control ) {
				$type = $control['type'];
				$control_group = in_array( $type, array( 'media', 'video' ), true ) ? 'media' : ( 'url' === $type ? 'links' : 'text' );
				if ( $group !== $control_group ) { continue; }
				$value = tbt_editor_resolve( $control['default'] );
				$config = array( 'label' => $control['label'], 'type' => 'video' === $type ? 'media' : $type, 'default' => $value, 'label_block' => true );
				if ( in_array( $type, array( 'media', 'video', 'url' ), true ) ) { $config['default'] = array( 'url' => $value, 'id' => 0 ); }
				if ( 'video' === $type ) { $config['media_types'] = array( 'video' ); }
				if ( 'url' === $type ) { $config['options'] = array( 'url' ); }
				$this->add_control( $name, $config );
			}
			$this->end_controls_section();
		}
		if ( isset( $layout['gallery'] ) ) {
			$this->start_controls_section( 'section_gallery', array( 'label' => __( 'Gallery cards', 'teeth-by-trev' ) ) );
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
		foreach ( $settings['gallery_items'] ?? array() as $item ) {
			$replace['{{gallery_items}}'] .= '<figure class="tbt-gallery-case reveal group relative aspect-[4/5] overflow-hidden"><img src="' . esc_url( tbt_editor_resolve( $item['image']['url'] ?? '' ) ) . '" alt="' . esc_attr( $item['alt'] ?? '' ) . '" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"><div class="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100"></div><div class="pointer-events-none absolute inset-0 border border-ivory/10"></div><figcaption class="absolute inset-x-0 bottom-0 translate-y-2 p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"><span class="block font-serif text-2xl font-light text-ivory">' . esc_html( $item['title'] ?? '' ) . '</span><span class="text-[0.72rem] uppercase tracking-[0.18em] text-champagne">' . esc_html( $item['caption'] ?? '' ) . '</span></figcaption></figure>';
		}
		echo strtr( tbt_editor_resolve( $layout['html'] ), $replace ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Immutable markup; replacements escaped above.
	}
}
