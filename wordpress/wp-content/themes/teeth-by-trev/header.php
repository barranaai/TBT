<?php
/**
 * Global document header.
 *
 * @package TeethByTrev
 */
?><!doctype html>
<html <?php language_attributes(); ?> class="h-full">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="facebook-domain-verification" content="b8gdf7ixkspje299s6h9umwv89cnpv">
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'min-h-full bg-ivory text-ink' ); ?>>
<?php wp_body_open(); ?>
<a class="sr-only focus:not-sr-only" href="#main-content"><?php esc_html_e( 'Skip to content', 'teeth-by-trev' ); ?></a>
<?php if ( empty( $GLOBALS['tbt_no_intro'] ) ) : ?><div class="tbt-intro-veil fixed inset-0 z-[10000] flex items-center justify-center <?php echo ! empty( $GLOBALS['tbt_classic_layout'] ) ? 'bg-ivory' : 'bg-onyx'; ?>" aria-hidden="true"><div class="tbt-intro-content flex translate-y-3 flex-col items-center opacity-0"><img src="<?php echo tbt_asset( 'brand/tbt-atelier-logo.png' ); ?>" alt="" width="546" height="256" class="h-14 w-auto sm:h-20"><span class="mt-6 h-px w-0 bg-gold opacity-0"></span></div></div><?php endif; ?>
<?php if ( ! empty( $GLOBALS['tbt_no_header'] ) ) return; ?>
<?php if ( ! empty( $GLOBALS['tbt_classic_layout'] ) ) : ?>
<header class="tbt-classic-nav fixed inset-x-0 top-0 z-50 transition-colors duration-500" data-tbt-classic-nav>
	<nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10" aria-label="Primary navigation">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Teeth by Trev — home" class="relative block h-10 w-[150px] sm:h-12 sm:w-[180px]"><img src="<?php echo tbt_asset( 'brand/tbt-atelier-logo.png' ); ?>" alt="Teeth by Trev — Dental Atelier" width="546" height="256" class="h-full w-full object-contain object-left"></a>
		<ul class="hidden items-center gap-9 lg:flex">
			<li><a href="<?php echo esc_url( home_url( '/about/' ) ); ?>" class="link-sweep tbt-classic-nav-link text-[0.8rem] font-medium uppercase tracking-[0.16em] text-ivory/75 transition-colors duration-300 hover:text-ivory">About</a></li>
			<li><a href="<?php echo esc_url( home_url( '/services/' ) ); ?>" class="link-sweep tbt-classic-nav-link text-[0.8rem] font-medium uppercase tracking-[0.16em] text-ivory/75 transition-colors duration-300 hover:text-ivory">Services</a></li>
			<li><a href="<?php echo esc_url( home_url( '/gallery/' ) ); ?>" class="link-sweep tbt-classic-nav-link text-[0.8rem] font-medium uppercase tracking-[0.16em] text-ivory/75 transition-colors duration-300 hover:text-ivory">Smile Gallery</a></li>
			<li><a href="<?php echo esc_url( home_url( '/financing/' ) ); ?>" class="link-sweep tbt-classic-nav-link text-[0.8rem] font-medium uppercase tracking-[0.16em] text-ivory/75 transition-colors duration-300 hover:text-ivory">Financing</a></li>
			<li><a href="<?php echo esc_url( home_url( '/atelier/' ) ); ?>" class="link-sweep tbt-classic-atelier-link inline-flex items-center gap-1.5 text-[0.8rem] font-medium uppercase tracking-[0.16em] text-champagne transition-colors duration-300 hover:text-ivory"><span class="text-[0.7em]">✦</span>The Atelier</a></li>
		</ul>
		<div class="hidden lg:block"><a href="https://www.diverzeent.com/tbv-inquiry/" target="_blank" rel="noopener noreferrer" class="tbt-classic-book inline-flex items-center justify-center border border-ivory/50 px-6 py-3 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ivory transition-colors duration-300 hover:bg-ivory hover:text-ink">Book Consultation</a></div>
		<button type="button" aria-label="Open menu" aria-expanded="false" aria-controls="tbt-classic-mobile-menu" class="tbt-classic-toggle flex h-10 w-10 flex-col items-center justify-center gap-[6px] lg:hidden" data-tbt-classic-toggle><span class="h-px w-7 bg-ivory transition-transform duration-300"></span><span class="h-px w-7 bg-ivory transition-opacity duration-300"></span><span class="h-px w-7 bg-ivory transition-transform duration-300"></span></button>
	</nav>
	<div id="tbt-classic-mobile-menu" class="tbt-classic-mobile-menu max-h-0 overflow-hidden border-t border-stone/15 bg-ivory transition-[max-height] duration-500 ease-in-out lg:hidden" aria-hidden="true" inert data-tbt-classic-menu>
		<ul class="flex flex-col gap-1 px-6 py-6">
			<li><a href="<?php echo esc_url( home_url( '/about/' ) ); ?>" class="block py-3 font-serif text-2xl text-ink">About</a></li>
			<li><a href="<?php echo esc_url( home_url( '/services/' ) ); ?>" class="block py-3 font-serif text-2xl text-ink">Services</a></li>
			<li><a href="<?php echo esc_url( home_url( '/gallery/' ) ); ?>" class="block py-3 font-serif text-2xl text-ink">Smile Gallery</a></li>
			<li><a href="<?php echo esc_url( home_url( '/financing/' ) ); ?>" class="block py-3 font-serif text-2xl text-ink">Financing</a></li>
			<li><a href="<?php echo esc_url( home_url( '/atelier/' ) ); ?>" class="flex items-center gap-2 py-3 font-serif text-2xl text-gold"><span class="text-base">✦</span>The Atelier</a></li>
			<li class="pt-4"><a href="https://www.diverzeent.com/tbv-inquiry/" target="_blank" rel="noopener noreferrer" class="inline-flex w-full items-center justify-center bg-ink px-6 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ivory">Book Consultation</a></li>
		</ul>
	</div>
</header>
<?php return; endif; ?>
<?php if ( ! empty( $GLOBALS['tbt_minimal_header'] ) ) : $tbt_minimal = $GLOBALS['tbt_minimal_header']; ?>
<header class="absolute inset-x-0 top-0 z-40"><div class="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6 lg:px-12"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Teeth by Trev — home"><img src="<?php echo tbt_asset( 'brand/tbt-atelier-logo.png' ); ?>" alt="Teeth by Trev — Dental Atelier" width="546" height="256" class="h-10 w-auto"></a><a href="<?php echo esc_url( home_url( $tbt_minimal['path'] ) ); ?>" class="text-[0.62rem] uppercase tracking-[0.28em] text-ivory/55 transition-colors hover:text-ivory"><?php echo esc_html( $tbt_minimal['label'] ); ?></a></div></header>
<?php return; endif; ?>
<header class="tbt-nav fixed inset-x-0 top-0 z-50 transition-all duration-500" data-tbt-nav>
	<nav class="relative z-10 mx-auto flex max-w-[1600px] items-center justify-between px-8 py-8 transition-all duration-500 sm:px-11 sm:py-11 lg:px-14 lg:py-14" aria-label="Primary navigation">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Teeth by Trev — home" class="relative z-10">
			<img src="<?php echo tbt_asset( 'brand/tbt-atelier-logo.png' ); ?>" alt="Teeth by Trev — Dental Atelier" class="h-12 w-auto" width="546" height="256">
		</a>
		<div class="relative z-10 flex items-center gap-8">
			<a href="<?php echo esc_url( home_url( '/consultation/' ) ); ?>" class="hidden border border-gold/50 px-5 py-2.5 text-[0.6rem] uppercase tracking-[0.24em] text-gold transition-colors hover:bg-gold hover:text-onyx sm:block">Book</a>
			<button type="button" class="tbt-menu-toggle relative z-10 flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.28em] text-ivory" aria-label="Open menu" aria-expanded="false" aria-controls="tbt-overlay-menu" data-tbt-menu-toggle>
				<span class="relative block h-4 w-6" aria-hidden="true"><span class="absolute left-0 top-0 h-px w-6 bg-ivory transition-transform"></span><span class="absolute left-0 top-2 h-px w-6 bg-ivory transition-opacity"></span><span class="absolute left-0 top-4 h-px w-6 bg-ivory transition-transform"></span></span>
				<span data-tbt-menu-label>Menu</span>
			</button>
		</div>
	</nav>
	<div id="tbt-overlay-menu" class="pointer-events-none fixed inset-0 z-0 flex bg-onyx opacity-0 transition-opacity duration-500" aria-hidden="true" inert data-tbt-menu>
		<div class="mx-auto flex h-full w-full max-w-[1600px] flex-col justify-center px-6 lg:px-12">
			<?php
			$items = array(
				'Home'      => '/',
				'About'     => '/about/',
				'Services'  => '/services/',
				'Gallery'   => '/gallery/',
				'Financing' => '/financing/',
				'Contact'   => '/contact/',
			);
			?>
			<ul class="space-y-2">
				<?php $index = 1; foreach ( $items as $label => $path ) : ?>
					<li><a class="group flex items-baseline gap-7 py-2" href="<?php echo esc_url( home_url( $path ) ); ?>"><span class="text-xs tracking-[0.24em] text-gold/70"><?php echo esc_html( str_pad( (string) $index, 2, '0', STR_PAD_LEFT ) ); ?></span><span class="font-serif text-4xl font-light text-ivory/80 transition-colors group-hover:text-gold sm:text-6xl"><?php echo esc_html( $label ); ?></span></a></li>
				<?php ++$index; endforeach; ?>
			</ul>
			<a href="<?php echo esc_url( home_url( '/consultation/' ) ); ?>" class="mt-9 inline-flex border border-gold px-7 py-3.5 text-[0.66rem] uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold hover:text-onyx">Book a Consultation →</a>
		</div>
	</div>
</header>
