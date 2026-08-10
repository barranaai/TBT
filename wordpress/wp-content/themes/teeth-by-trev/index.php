<?php
/**
 * Safe fallback template.
 *
 * @package TeethByTrev
 */
get_header();
?>
<main id="main-content" class="min-h-screen bg-onyx px-6 pb-24 pt-40 text-ivory lg:px-12">
	<div class="mx-auto max-w-4xl">
		<p class="eyebrow">Teeth by Trev</p>
		<h1 class="mt-6 font-serif text-5xl font-light"><?php the_title(); ?></h1>
		<div class="mt-8 text-ivory/70"><?php the_content(); ?></div>
	</div>
</main>
<?php get_footer(); ?>
