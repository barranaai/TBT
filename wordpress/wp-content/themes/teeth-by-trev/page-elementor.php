<?php
/* Template Name: TBT Editable Page */
/** Render editable Elementor page content through the original theme shell.
 * @package TeethByTrev
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$slug = is_front_page() ? 'home' : get_post_field( 'post_name', get_queried_object_id() );
$layout = tbt_editor_layouts()['pages'][ $slug ] ?? array();
$minimal = ! empty( $layout['minimal'] );
if ( $minimal ) { $GLOBALS['tbt_no_header'] = true; $GLOBALS['tbt_no_intro'] = true; }
if ( ! empty( $layout['reserve'] ) ) { $GLOBALS['tbt_minimal_header'] = array( 'path' => '/consultation/', 'label' => '← Consultation' ); }
if ( ! empty( $layout['consultation'] ) ) { $GLOBALS['tbt_minimal_header'] = array( 'path' => '/', 'label' => '← Home' ); }
get_header();
?>
<main id="main-content" class="tbt-editor-content <?php echo esc_attr( $layout['mainClass'] ?? 'bg-onyx text-ivory' ); ?>">
	<?php while ( have_posts() ) { the_post(); the_content(); } ?>
</main>
<?php
if ( $minimal ) {
	echo '<div class="grain" aria-hidden="true"></div>'; wp_footer(); echo '</body></html>';
} else { get_footer(); }
