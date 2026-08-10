<?php
/**
 * Atelier footer shared by all public pages.
 *
 * @package TeethByTrev
 */
$footer_links = array(
	'Home' => '/', 'About' => '/about/', 'Services' => '/services/',
	'Gallery' => '/gallery/', 'Financing' => '/financing/', 'Contact' => '/contact/',
);
?>
<footer class="border-t border-ivory/10 bg-onyx py-16 text-ivory">
	<div class="mx-auto max-w-[1600px] px-6 lg:px-12">
		<div class="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
			<div>
				<img src="<?php echo tbt_asset( 'brand/tbt-atelier-logo.png' ); ?>" alt="Teeth by Trev — Dental Atelier" width="546" height="256" class="h-14 w-auto" loading="lazy">
				<p class="mt-5 max-w-xs text-sm leading-relaxed text-ivory/45">An atelier of cosmetic &amp; implant dentistry by Dr. Trevor J. Thomas, DDS.</p>
				<address class="mt-6 text-sm not-italic leading-relaxed text-ivory/45">436 N Bedford Dr #300<br>Beverly Hills, CA 90210<br><a href="tel:+14243946159" class="transition-colors hover:text-gold">424-394-6159</a></address>
				<ul class="mt-7 flex items-center gap-3">
					<li><a href="https://www.instagram.com/dr.trevthomas/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory/55 transition-colors duration-300 hover:border-gold hover:text-gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-[18px] w-[18px]"><rect x="3" y="3" width="18" height="18" rx="5" stroke-width="1.5"></rect><circle cx="12" cy="12" r="4" stroke-width="1.5"></circle><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle></svg></a></li>
					<li><a href="https://www.facebook.com/dr.trevthomas/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory/55 transition-colors duration-300 hover:border-gold hover:text-gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-[18px] w-[18px]"><path d="M14 8.5h2.5M14 8.5V7a2 2 0 0 1 2-2h.5M14 8.5V21M14 8.5h-1.5m1.5 4.5h-3" stroke-width="1.5"></path></svg></a></li>
					<li><a href="https://www.tiktok.com/@dr.trevthomas" target="_blank" rel="noopener noreferrer" aria-label="TikTok" class="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory/55 transition-colors duration-300 hover:border-gold hover:text-gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-[18px] w-[18px]"><path d="M13.5 4v9.5a3.5 3.5 0 1 1-3.5-3.5M13.5 4c.3 2.2 1.8 3.8 4 4" stroke-width="1.5"></path></svg></a></li>
					<li><a href="https://www.linkedin.com/in/drtrev/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory/55 transition-colors duration-300 hover:border-gold hover:text-gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-[18px] w-[18px]"><rect x="3" y="3" width="18" height="18" rx="3" stroke-width="1.5"></rect><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7" stroke-width="1.5"></path></svg></a></li>
				</ul>
			</div>
			<nav aria-label="Footer navigation" class="flex flex-col gap-3 text-[0.62rem] uppercase tracking-[0.26em] text-ivory/45 lg:items-end"><?php foreach ( $footer_links as $label => $path ) : ?><a href="<?php echo esc_url( home_url( $path ) ); ?>" class="transition-colors hover:text-gold"><?php echo esc_html( $label ); ?></a><?php endforeach; ?></nav>
		</div>
		<div class="mt-12 flex flex-col items-start justify-between gap-3 border-t border-ivory/10 pt-8 text-[0.58rem] uppercase tracking-[0.26em] text-ivory/35 sm:flex-row"><span>© <?php echo esc_html( gmdate( 'Y' ) ); ?> Teeth by Trev. All rights reserved. · <a href="<?php echo esc_url( home_url( '/privacy/' ) ); ?>" class="hover:text-gold">Privacy</a></span><span>Beverly Hills · New York · Atlanta · Houston · Miami · Washington D.C. · Tampa · Memphis</span></div>
	</div>
</footer>
<div class="grain" aria-hidden="true"></div>
<?php wp_footer(); ?>
</body>
</html>
