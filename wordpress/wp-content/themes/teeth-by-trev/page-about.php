<?php
/** @package TeethByTrev */
get_header();
$credentials = array(
	array( 'title' => 'Doctor of Dental Surgery', 'body' => 'Advanced training in cosmetic and restorative dentistry, with a focus on the art of the natural smile.' ),
	array( 'title' => 'Cosmetic & Implant Focus', 'body' => 'Years dedicated to veneers, implants, and full-mouth rehabilitation — the most demanding work in dentistry.' ),
	array( 'title' => 'Hands-On, Every Case', 'body' => 'Every restoration is designed and finished by Dr. Thomas himself. Nothing is outsourced, nothing is templated.' ),
	array( 'title' => 'Cities Coast to Coast', 'body' => 'Caring for patients across Beverly Hills, New York, Atlanta, Houston, Miami, Washington D.C., Tampa, and Memphis — by appointment.' ),
);
?>
<main id="main-content" class="bg-onyx text-ivory">
	<?php tbt_page_hero( 'The Dentist', 'Meet Dr. Trev.', 'Dr. Trevor J. Thomas, DDS — an artist working in enamel and light, devoted to the people behind every smile.', 'stock/process.jpg', 'Dr. Trevor J. Thomas holding dental instruments in the Teeth by Trev operatory' ); ?>
	<section class="bg-onyx py-28 lg:py-40"><div class="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:gap-24 lg:px-10">
		<div class="reveal order-2 lg:order-1"><div class="relative"><div class="relative aspect-[4/5] w-full overflow-hidden"><img src="<?php echo tbt_asset( 'people/dr-trev-portrait.png' ); ?>" alt="Dr. Trevor J. Thomas, DDS" class="h-full w-full object-cover object-top"><div class="pointer-events-none absolute inset-0 border border-ivory/10"></div></div><div class="absolute -bottom-6 -right-6 hidden h-32 w-32 border border-gold/40 lg:block"></div></div></div>
		<div class="reveal order-1 lg:order-2"><p class="mb-6 text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">01 — The Philosophy</p><h2 class="font-serif text-4xl font-light leading-[1.1] text-ivory sm:text-5xl">Dentistry is my ministry.</h2><span class="mt-8 block h-px w-14 bg-gold/50"></span><div class="mt-8 space-y-6 text-base leading-relaxed text-ivory/65 sm:text-lg"><p>For Dr. Trev, a smile is a gateway — to confidence, to better mental health, to a fuller life. Every case begins not with a tooth, but with a person and the story they carry.</p><p>Over ten years he has refined a practice where world-class craftsmanship meets genuine care. He studies the face before the teeth, designs every smile by hand, and treats each patient like he'd treat his own mother.</p><p>The result is work that looks effortless and feels like coming home to yourself — restorations so natural they seem not done, but inevitable.</p></div><p class="mt-10 font-serif text-2xl italic text-gold">Real people. Real problems. Real results.</p><div class="mt-10"><span class="block font-script text-5xl leading-none text-gold sm:text-6xl">Dr. Trev</span><span class="mt-3 block text-[0.62rem] uppercase tracking-[0.26em] text-ivory/50">Dr. Trevor Thomas, DDS</span></div></div>
	</div></section>
	<section class="border-t border-ivory/10 bg-ink py-28 lg:py-40"><div class="mx-auto max-w-7xl px-6 lg:px-10"><div class="reveal max-w-2xl"><p class="mb-6 text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">02 — The Credentials</p><h2 class="font-serif text-4xl font-light leading-[1.1] text-ivory sm:text-5xl">Training, taste, and a steady hand.</h2></div><div class="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-2"><?php foreach ( $credentials as $item ) : ?><div class="reveal border-t border-ivory/15 pt-6"><h3 class="font-serif text-2xl font-light text-ivory"><?php echo esc_html( $item['title'] ); ?></h3><p class="mt-3 max-w-md text-base leading-relaxed text-ivory/60"><?php echo esc_html( $item['body'] ); ?></p></div><?php endforeach; ?></div></div></section>
	<?php tbt_page_cta( "Let's design the smile that's always been yours." ); ?>
</main>
<?php get_footer(); ?>
