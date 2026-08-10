<?php
/**
 * Teeth by Trev theme bootstrap.
 *
 * @package TeethByTrev
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TBT_THEME_VERSION', '0.2.1' );

function tbt_theme_setup(): void {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'editor-styles' );
	register_nav_menus(
		array(
			'primary' => __( 'Primary navigation', 'teeth-by-trev' ),
			'footer'  => __( 'Footer navigation', 'teeth-by-trev' ),
		)
	);
}
add_action( 'after_setup_theme', 'tbt_theme_setup' );
remove_action( 'wp_head', 'rel_canonical' );
add_filter( 'show_admin_bar', '__return_false' );

function tbt_theme_assets(): void {
	$base = get_template_directory_uri();
	wp_enqueue_style(
		'tbt-fonts',
		'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&family=Pinyon+Script&display=swap',
		array(),
		null
	);
	wp_enqueue_style( 'tbt-theme', $base . '/assets/dist/theme.css', array( 'tbt-fonts' ), TBT_THEME_VERSION );
	wp_enqueue_script( 'tbt-theme', $base . '/assets/dist/theme.js', array(), TBT_THEME_VERSION, true );
}
add_action( 'wp_enqueue_scripts', 'tbt_theme_assets' );

function tbt_asset( string $path ): string {
	return esc_url( get_template_directory_uri() . '/assets/media/' . ltrim( $path, '/' ) );
}

function tbt_page_hero( string $eyebrow, string $title, string $intro, string $image, string $image_alt ): void {
	?>
	<section class="relative isolate overflow-hidden bg-ink">
		<img src="<?php echo tbt_asset( $image ); ?>" alt="<?php echo esc_attr( $image_alt ); ?>" class="absolute inset-0 h-full w-full object-cover opacity-40">
		<div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/60"></div>
		<div class="relative z-10 mx-auto flex min-h-[60vh] max-w-7xl flex-col justify-end px-6 pb-20 pt-40 lg:px-10 lg:pb-28 lg:pt-52">
			<p class="mb-6 text-[0.6rem] uppercase tracking-[0.34em] text-champagne"><?php echo esc_html( $eyebrow ); ?></p>
			<h1 class="max-w-4xl font-serif text-5xl font-light leading-[1.04] text-ivory sm:text-6xl lg:text-7xl"><?php echo esc_html( $title ); ?></h1>
			<?php if ( $intro ) : ?><p class="mt-8 max-w-xl text-base leading-relaxed text-ivory/75 sm:text-lg"><?php echo esc_html( $intro ); ?></p><?php endif; ?>
		</div>
	</section>
	<?php
}

function tbt_page_cta( string $title, string $label = 'Book Your Consultation' ): void {
	?>
	<section class="border-t border-ivory/10 bg-onyx py-24 lg:py-32"><div class="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-6 lg:flex-row lg:items-center lg:px-10"><h2 class="reveal max-w-2xl font-serif text-4xl font-light leading-[1.08] text-ivory sm:text-5xl"><?php echo esc_html( $title ); ?></h2><div class="reveal"><span class="inline-block transition-transform duration-300 ease-out will-change-transform" data-tbt-magnetic><a href="<?php echo esc_url( home_url( '/consultation/' ) ); ?>" class="inline-flex items-center justify-center border border-gold px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-gold transition-colors duration-300 hover:bg-gold hover:text-onyx"><?php echo esc_html( $label ); ?></a></span></div></div></section>
	<?php
}

function tbt_experience_process(): void {
	$steps = array(
		array( 'no' => 'I', 'title' => 'The Consultation', 'body' => 'We listen first. Your goals, your history, your story — mapped into a clear, honest plan with no surprises.' ),
		array( 'no' => 'II', 'title' => 'The Design', 'body' => 'Your new smile is sculpted digitally and previewed before a single procedure — designed around your face, not a template.' ),
		array( 'no' => 'III', 'title' => 'The Reveal', 'body' => 'Precision execution, hand-finished detail, and the moment you see yourself fully — often for the very first time.' ),
	);
	?>
	<section class="relative isolate overflow-hidden bg-espresso py-28 text-ivory lg:py-40"><?php tbt_section_motifs( 3 ); ?><div class="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[0.85fr_1fr] lg:items-center lg:gap-20 lg:px-10"><div class="reveal"><div class="relative aspect-[3/2] overflow-hidden"><img src="<?php echo tbt_asset( 'stock/process.jpg' ); ?>" alt="Dr. Trevor J. Thomas holding a mirror and explorer in the Teeth by Trev operatory" class="h-full w-full object-cover" loading="lazy"><div class="absolute inset-0 ring-1 ring-inset ring-ivory/10"></div></div></div><div><div class="reveal max-w-xl"><p class="mb-6 text-[0.6rem] uppercase tracking-[0.34em] text-champagne">04 <span class="mx-2">—</span> The Experience</p><h2 class="font-serif text-4xl font-light leading-[1.1] text-ivory sm:text-5xl">Three steps to the smile that’s always been yours.</h2></div><div class="mt-14 space-y-12"><?php foreach ( $steps as $step ) : ?><div class="reveal"><div class="flex gap-6 border-t border-ivory/15 pt-8"><span class="font-serif text-4xl font-light leading-none text-champagne"><?php echo esc_html( $step['no'] ); ?></span><div><h3 class="font-serif text-2xl font-light text-ivory"><?php echo esc_html( $step['title'] ); ?></h3><p class="mt-3 max-w-md text-base leading-relaxed text-ivory/70"><?php echo esc_html( $step['body'] ); ?></p></div></div></div><?php endforeach; ?></div></div></div></section>
	<?php
}

/**
 * Render the same decorative dental line-art fields used by the Next.js site.
 */
function tbt_section_motifs( int $variant = 0 ): void {
	$layouts = array(
		array(
			array( 'type' => 'tooth', 'top' => '12%', 'left' => '4%', 'size' => 120, 'duration' => 18, 'delay' => 0, 'animation' => 'motifFloatA' ),
			array( 'type' => 'implant', 'top' => '64%', 'left' => '90%', 'size' => 96, 'duration' => 21, 'delay' => 1.5, 'animation' => 'motifFloatB' ),
			array( 'type' => 'veneer', 'top' => '78%', 'left' => '16%', 'size' => 78, 'duration' => 19, 'delay' => 0.8, 'animation' => 'motifFloatC' ),
		),
		array(
			array( 'type' => 'veneer', 'top' => '8%', 'left' => '88%', 'size' => 96, 'duration' => 20, 'delay' => 0.5, 'animation' => 'motifFloatB' ),
			array( 'type' => 'tooth', 'top' => '70%', 'left' => '8%', 'size' => 132, 'duration' => 22, 'delay' => 1.2, 'animation' => 'motifFloatC' ),
			array( 'type' => 'implant', 'top' => '40%', 'left' => '70%', 'size' => 70, 'duration' => 17, 'delay' => 2.4, 'animation' => 'motifFloatA' ),
		),
		array(
			array( 'type' => 'tooth', 'top' => '10%', 'left' => '82%', 'size' => 110, 'duration' => 19, 'delay' => 0, 'animation' => 'motifFloatB' ),
			array( 'type' => 'implant', 'top' => '20%', 'left' => '10%', 'size' => 84, 'duration' => 23, 'delay' => 1.8, 'animation' => 'motifFloatA' ),
			array( 'type' => 'veneer', 'top' => '74%', 'left' => '30%', 'size' => 80, 'duration' => 18, 'delay' => 0.6, 'animation' => 'motifFloatC' ),
			array( 'type' => 'tooth', 'top' => '62%', 'left' => '92%', 'size' => 96, 'duration' => 21, 'delay' => 2.2, 'animation' => 'motifFloatA' ),
		),
		array(
			array( 'type' => 'implant', 'top' => '14%', 'left' => '6%', 'size' => 100, 'duration' => 20, 'delay' => 0.4, 'animation' => 'motifFloatC' ),
			array( 'type' => 'veneer', 'top' => '68%', 'left' => '86%', 'size' => 92, 'duration' => 22, 'delay' => 1.6, 'animation' => 'motifFloatA' ),
		),
		array(
			array( 'type' => 'tooth', 'top' => '16%', 'left' => '90%', 'size' => 116, 'duration' => 19, 'delay' => 0, 'animation' => 'motifFloatA' ),
			array( 'type' => 'implant', 'top' => '76%', 'left' => '12%', 'size' => 82, 'duration' => 21, 'delay' => 1.3, 'animation' => 'motifFloatB' ),
			array( 'type' => 'veneer', 'top' => '30%', 'left' => '24%', 'size' => 72, 'duration' => 18, 'delay' => 2.6, 'animation' => 'motifFloatC' ),
		),
	);
	$set = $layouts[ abs( $variant ) % count( $layouts ) ];
	?>
	<div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
		<?php foreach ( $set as $motif ) : ?>
			<span class="dental-motif" style="top:<?php echo esc_attr( $motif['top'] ); ?>;left:<?php echo esc_attr( $motif['left'] ); ?>;width:<?php echo esc_attr( (string) $motif['size'] ); ?>px;height:<?php echo esc_attr( (string) $motif['size'] ); ?>px;animation:<?php echo esc_attr( $motif['animation'] . ' ' . $motif['duration'] . 's ease-in-out ' . $motif['delay'] . 's infinite' ); ?>">
				<svg viewBox="0 0 32 32" class="h-full w-full" focusable="false">
					<?php if ( 'tooth' === $motif['type'] ) : ?><path d="M9 6c-2.2 0-3.6 2-3.4 4.6.2 2.4 1.3 3.8 1.7 6.4.3 2 .3 4.2.9 6.4.5 1.8 2.3 1.9 2.8 0 .4-1.6.5-3.4 1-4.8.3-.9 1.3-.9 1.6 0 .5 1.4.6 3.2 1 4.8.5 1.9 2.3 1.8 2.8 0 .6-2.2.6-4.4.9-6.4.4-2.6 1.5-4 1.7-6.4C21.6 8 20.2 6 18 6c-1.6 0-2.6 1.1-4.5 1.1S10.6 6 9 6Z"></path><?php endif; ?>
					<?php if ( 'veneer' === $motif['type'] ) : ?><path d="M11 4c4-1 8 .4 9.5 1.2.6 4-1 9.4-4 13.8-1.2 1.8-2.6 1.8-3.8 0C9.6 14.6 8 9.2 8.6 5.2 9.2 4.8 10 4.3 11 4Z"></path><path d="M12 7.2c2.6-.7 5.2-.1 6.7.6"></path><?php endif; ?>
					<?php if ( 'implant' === $motif['type'] ) : ?><path d="M13 4.5c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5V7h-6Z"></path><path d="M12 8.5h8l-1.2 13.5a2.8 2.8 0 0 1-5.6 0Z"></path><path d="M12.5 11.6h7M12.8 14.6h6.4M13.1 17.6h5.8M13.4 20.6h5.2"></path><?php endif; ?>
				</svg>
			</span>
		<?php endforeach; ?>
	</div>
	<?php
}

function tbt_page_description(): string {
	$descriptions = array(
		'home'         => 'A couture atelier of cosmetic & implant dentistry by Dr. Trevor J. Thomas. Where the smile becomes art.',
		'about'        => 'Meet Dr. Trevor J. Thomas, DDS — cosmetic & implant dentist blending artistry, precision, and genuine care into every smile.',
		'services'     => 'Smile makeovers, porcelain veneers, dental implants, and full-mouth rehabilitation — signature cosmetic & implant dentistry by Dr. Trevor J. Thomas.',
		'gallery'      => 'Real transformations by Dr. Trevor J. Thomas — veneers, implants, whitening, and full-mouth makeovers. Transformations, not just teeth.',
		'financing'    => 'Smile now, pay later. Flexible financing and monthly payment plans make life-changing dentistry by Dr. Trevor J. Thomas accessible.',
		'contact'      => 'Start a smile consultation, request existing-patient support, or send a general enquiry to the Teeth by Trev concierge team.',
		'consultation' => 'Reserve a private consultation with Dr. Trevor J. Thomas — in person or by video. A considered $250 conversation about the smile you imagine.',
		'reserve'      => 'Secure your private consultation with Dr. Trevor J. Thomas with a $250 deposit, credited 100% toward your treatment.',
		'privacy'      => 'How Teeth by Trev handles website enquiries and optional analytics.',
		'classic'      => 'The classic Teeth by Trev experience. Cosmetic & implant dentistry by Dr. Trevor J. Thomas.',
	);
	$slug = is_front_page() ? 'home' : get_post_field( 'post_name', get_queried_object_id() );
	return $descriptions[ $slug ] ?? 'A couture atelier of cosmetic and implant dentistry by Dr. Trevor J. Thomas.';
}

function tbt_meta_description(): void {
	if ( is_404() ) return;
	echo '<meta name="description" content="' . esc_attr( tbt_page_description() ) . '">' . "\n";
}
add_action( 'wp_head', 'tbt_meta_description', 2 );

function tbt_robots( array $robots ): array {
	if ( is_page( 'reserve' ) ) {
		$robots['noindex'] = true;
		unset( $robots['index'] );
		if ( (bool) get_option( 'blog_public' ) ) {
			$robots['follow'] = true;
			unset( $robots['nofollow'] );
		}
	}
	return $robots;
}
add_filter( 'wp_robots', 'tbt_robots' );

function tbt_document_title( string $title ): string {
	$slug = is_front_page() ? 'home' : get_post_field( 'post_name', get_queried_object_id() );
	$titles = array(
		'home' => 'Teeth by Trev — Cosmetic & Implant Dentistry',
		'about' => 'About Dr. Trev — Teeth by Trev',
		'services' => 'Services — Teeth by Trev',
		'gallery' => 'Smile Gallery — Teeth by Trev',
		'financing' => 'Financing — Teeth by Trev',
		'contact' => 'Contact the Teeth by Trev Concierge Team',
		'consultation' => 'Book a Consultation — Teeth by Trev',
		'reserve' => 'Reserve Your Consultation — Teeth by Trev',
		'privacy' => 'Privacy & Analytics — Teeth by Trev',
		'classic' => 'Teeth by Trev — Classic',
	);
	return $titles[ $slug ] ?? $title;
}
add_filter( 'pre_get_document_title', 'tbt_document_title' );

function tbt_social_meta(): void {
	if ( is_404() ) return;
	$title = tbt_document_title( wp_get_document_title() );
	$description = tbt_page_description();
	$url = is_singular() ? get_permalink() : home_url( '/' );
	$image = get_template_directory_uri() . '/assets/media/opengraph-image.png';
	echo '<link rel="canonical" href="' . esc_url( $url ) . '">' . "\n";
	echo '<link rel="icon" href="' . esc_url( get_template_directory_uri() . '/assets/media/favicon.ico' ) . '" sizes="any">' . "\n";
	echo '<link rel="apple-touch-icon" href="' . esc_url( get_template_directory_uri() . '/assets/media/apple-icon.png' ) . '">' . "\n";
	echo '<meta property="og:type" content="website"><meta property="og:site_name" content="Teeth by Trev"><meta property="og:locale" content="en_US">' . "\n";
	echo '<meta property="og:title" content="' . esc_attr( $title ) . '"><meta property="og:description" content="' . esc_attr( $description ) . '"><meta property="og:url" content="' . esc_url( $url ) . '"><meta property="og:image" content="' . esc_url( $image ) . '">' . "\n";
	echo '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' . esc_attr( $title ) . '"><meta name="twitter:description" content="' . esc_attr( $description ) . '"><meta name="twitter:image" content="' . esc_url( $image ) . '">' . "\n";
}
add_action( 'wp_head', 'tbt_social_meta', 3 );

function tbt_sitemap_pages( array $args, string $post_type ): array {
	if ( 'page' !== $post_type ) return $args;
	$reserve = get_page_by_path( 'reserve' );
	if ( $reserve ) $args['post__not_in'] = array_values( array_unique( array_merge( $args['post__not_in'] ?? array(), array( (int) $reserve->ID ) ) ) );
	return $args;
}
add_filter( 'wp_sitemaps_posts_query_args', 'tbt_sitemap_pages', 10, 2 );

function tbt_legacy_redirects(): void {
	$path = trim( (string) wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ), '/' );
	if ( 'atelier' === $path ) {
		wp_safe_redirect( home_url( '/' ), 301, 'Teeth by Trev' );
		exit;
	}
}
add_action( 'template_redirect', 'tbt_legacy_redirects', 1 );
