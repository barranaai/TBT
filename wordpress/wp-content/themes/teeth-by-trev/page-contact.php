<?php
/** @package TeethByTrev */
get_header();
?>
<main id="main-content" class="bg-onyx text-ivory">
	<?php tbt_page_hero( 'Concierge', 'Begin with the right team.', 'Tell us what you need and the Teeth by Trev concierge team will guide your next step.', 'stock/contact-hero.jpg', 'The Teeth by Trev reception — a black marble wordmark wall, marble desk, and a city skyline view' ); ?>
	<section class="bg-onyx py-24 lg:py-32"><div class="mx-auto max-w-3xl px-6 lg:px-10"><div class="reveal"><?php echo do_shortcode( '[tbt_inquiry_form]' ); ?></div><p class="mx-auto mt-16 max-w-2xl border-t border-ivory/10 pt-8 text-center text-[0.72rem] uppercase tracking-[0.2em] text-ivory/45">Questions? Text <a href="tel:+14243946159" class="text-ivory/70 transition-colors hover:text-gold">424-394-6159</a> · Continue on Instagram with <a href="https://www.instagram.com/teethbytrev.team/" target="_blank" rel="noopener noreferrer" class="text-ivory/70 transition-colors hover:text-gold">@teethbytrev.team</a></p></div></section>
</main>
<?php get_footer(); ?>
