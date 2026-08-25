<?php
/**
 * Shortcodes and public assets for operational UI.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class TBT_Core_UI {
	public static function register(): void {
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'assets' ) );
		add_action( 'wp_footer', array( __CLASS__, 'analytics_consent' ), 5 );
		add_shortcode( 'tbt_inquiry_form', array( __CLASS__, 'inquiry_form' ) );
		add_shortcode( 'tbt_square_deposit', array( __CLASS__, 'square_deposit' ) );
	}

	public static function assets(): void {
		wp_enqueue_script( 'tbt-analytics', TBT_CORE_URL . 'assets/dist/analytics.js', array(), TBT_CORE_VERSION, true );
		if ( is_page( 'contact' ) ) {
			wp_enqueue_script( 'tbt-inquiry', TBT_CORE_URL . 'assets/dist/inquiry.js', array(), TBT_CORE_VERSION, true );
			wp_localize_script( 'tbt-inquiry', 'TBTInquiryConfig', array( 'endpoint' => rest_url( 'tbt/v1/inquiry' ), 'consentVersion' => '2026-07-23-v1', 'teamHandle' => '@teethbytrev.team', 'teamUrl' => 'https://www.instagram.com/teethbytrev.team/' ) );
		}
		if ( is_page( 'reserve' ) ) {
			wp_enqueue_script( 'tbt-square', TBT_CORE_URL . 'assets/dist/square.js', array(), TBT_CORE_VERSION, true );
			wp_localize_script( 'tbt-square', 'TBTSquareConfig', array( 'configEndpoint' => rest_url( 'tbt/v1/square/config' ), 'payEndpoint' => rest_url( 'tbt/v1/square/pay' ) ) );
		}
	}

	private static function select( string $name, string $label, array $options, bool $required = true, string $intent = '' ): void {
		$required_attr = $required ? ' data-required="true" aria-required="true"' : '';
		?>
		<div class="tbt-field"><label for="<?php echo esc_attr( $name ); ?>" class="tbt-label"><?php echo esc_html( $label ); ?><?php if ( $required ) : ?> <span class="text-gold">*</span><?php endif; ?></label><select id="<?php echo esc_attr( $name ); ?>" name="<?php echo esc_attr( $name ); ?>" class="tbt-input appearance-none"<?php echo $required_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?php echo $intent ? ' data-intent-required="' . esc_attr( $intent ) . '"' : ''; ?>><option value="" disabled selected>Select one</option><?php foreach ( $options as $option ) : ?><option value="<?php echo esc_attr( $option ); ?>" class="bg-onyx text-ivory"><?php echo esc_html( $option ); ?></option><?php endforeach; ?></select></div>
		<?php
	}

	private static function photo_upload( string $id, string $note ): void {
		?>
		<div class="tbt-photo-field" data-tbt-photo-field><label for="<?php echo esc_attr( $id ); ?>" class="tbt-photo-drop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" class="h-8 w-8 text-gold"><path d="M4 8.5h3l1.3-2h7.4l1.3 2h3v10H4z"></path><circle cx="12" cy="13" r="3"></circle></svg><span class="mt-3 text-sm text-ivory/70"><span class="text-gold">Tap to upload photos</span></span><span class="mt-1 text-xs text-ivory/40">Front view, side view, and any areas of concern</span><input id="<?php echo esc_attr( $id ); ?>" type="file" accept="image/*,.heic,.heif" multiple class="hidden" data-tbt-photos></label><ul class="mt-4 flex flex-wrap gap-2" data-tbt-photo-list></ul><p class="mt-3 text-xs text-ivory/40"><?php echo esc_html( $note ); ?></p></div>
		<?php
	}

	private static function choices( string $name, string $label, array $options, bool $multiple = false, string $columns = 'sm:grid-cols-3' ): void {
		?>
		<fieldset class="tbt-choice-field" data-required="true" data-choice-field="<?php echo esc_attr( $name ); ?>" data-multiple="<?php echo $multiple ? 'true' : 'false'; ?>"><legend class="tbt-label"><?php echo esc_html( $label ); ?> <span class="text-gold">*</span></legend><div class="grid grid-cols-2 gap-3 <?php echo esc_attr( $columns ); ?>"><?php foreach ( $options as $option ) : ?><button type="button" class="tbt-choice" data-choice-value="<?php echo esc_attr( $option ); ?>" aria-pressed="false"><?php echo esc_html( $option ); ?></button><?php endforeach; ?></div></fieldset>
		<?php
	}

	public static function inquiry_form(): string {
		$cities = array( 'Beverly Hills, CA', 'New York, NY', 'Atlanta, GA', 'Houston, TX', 'Miami, FL', 'Washington, D.C.', 'Tampa, FL', 'Memphis, TN', 'Other — I am flexible' );
		$services = array( 'Implants', 'Veneers', 'Whitening', 'Crowns', 'Cleaning', 'Extraction', 'Full Smile Makeover' );
		$timelines = array( 'As soon as possible', 'Within 1–3 months', 'Within 3–6 months', 'Within 6–12 months', 'I am researching for the future' );
		$budgets = array( 'Under $2K', '$2K – $5K', '$5K – $10K', '$10K – $20K', '$20K – $40K', '$40K+', 'I am not sure yet' );
		$readiness = array( 'I am ready to schedule a consultation', 'I would like the concierge team to contact me first', 'I am comparing options', 'I am researching for the future' );
		$hear = array( 'Instagram — @dr.trevthomas', 'Instagram — @teethbytrev', 'Instagram — @teethbytrev.team', 'TikTok', 'Facebook', 'Google or another search engine', 'Referred by a friend or patient', 'Website', 'Other' );
		ob_start();
		?>
		<div class="mx-auto max-w-3xl scroll-mt-28" id="inquiry-form" data-tbt-inquiry>
			<div data-tbt-intent-screen class="relative border border-ivory/10 bg-white/[0.02] p-6 sm:p-10 lg:p-12">
				<span class="pointer-events-none absolute left-0 top-0 h-14 w-px bg-gold/60"></span><span class="pointer-events-none absolute left-0 top-0 h-px w-14 bg-gold/60"></span>
				<p class="text-[0.6rem] uppercase tracking-[0.34em] text-gold/75">Concierge desk</p><h2 class="mt-4 font-serif text-3xl font-light leading-[1.1] text-ivory sm:text-4xl">How can the Teeth by Trev team help?</h2><p class="mt-4 max-w-xl text-sm leading-relaxed text-ivory/55">Choose the option that best matches your enquiry. We will only ask for information relevant to that request.</p>
				<div class="mt-9 grid gap-4">
					<button type="button" class="tbt-intent" data-intent="new"><span class="tbt-intent-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-7 w-7"><path d="M12 3c2.8 0 5 2.2 5 5 0 4.4-2.8 9.4-5 13-2.2-3.6-5-8.6-5-13 0-2.8 2.2-5 5-5Z"></path><path d="M9.5 8.5h5M12 6v5"></path></svg></span><span><span class="block font-serif text-xl font-light text-ivory sm:text-2xl">New smile consultation</span><span class="mt-1 block text-sm leading-relaxed text-ivory/50">Share your goals, timeline and investment readiness with our concierge team.</span></span><span class="text-gold">→</span></button>
					<button type="button" class="tbt-intent" data-intent="existing"><span class="tbt-intent-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-7 w-7"><path d="M5 5h14v14H5z"></path><path d="M8 9h8M8 12h8M8 15h5"></path></svg></span><span><span class="block font-serif text-xl font-light text-ivory sm:text-2xl">Existing-patient support</span><span class="mt-1 block text-sm leading-relaxed text-ivory/50">Get help with an appointment, billing, records or a general support question.</span></span><span class="text-gold">→</span></button>
					<button type="button" class="tbt-intent" data-intent="general"><span class="tbt-intent-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-7 w-7"><path d="M4 6h16v12H4z"></path><path d="m5 7 7 6 7-6"></path></svg></span><span><span class="block font-serif text-xl font-light text-ivory sm:text-2xl">General or business enquiry</span><span class="mt-1 block text-sm leading-relaxed text-ivory/50">Contact us about media, speaking, partnerships, vendors or employment.</span></span><span class="text-gold">→</span></button>
				</div>
			</div>

			<form data-tbt-wizard class="hidden" novalidate>
				<div class="mb-7 flex items-center justify-between gap-4"><p class="text-[0.6rem] uppercase tracking-[0.25em] text-ivory/40" data-tbt-intent-label></p><button type="button" data-tbt-change-intent class="text-[0.6rem] uppercase tracking-[0.2em] text-gold hover:text-champagne">Change enquiry type</button></div>
				<ol class="mb-10 flex items-center" aria-label="Form progress" data-tbt-progress></ol>
				<div class="relative border border-ivory/10 bg-white/[0.02] p-6 sm:p-10 lg:p-12"><span class="pointer-events-none absolute left-0 top-0 h-12 w-px bg-gold/50"></span><span class="pointer-events-none absolute left-0 top-0 h-px w-12 bg-gold/50"></span><p class="text-[0.6rem] uppercase tracking-[0.34em] text-gold/70" data-tbt-step-meta></p><h2 class="mt-4 font-serif text-3xl font-light leading-[1.1] text-ivory sm:text-4xl" data-tbt-step-title></h2>

					<section class="mt-10 space-y-6" data-step="contact">
						<div class="grid gap-6 sm:grid-cols-2"><div class="tbt-field"><label class="tbt-label" for="firstName">First name <span class="text-gold">*</span></label><input class="tbt-input" id="firstName" name="firstName" autocomplete="given-name" data-required="true"></div><div class="tbt-field"><label class="tbt-label" for="lastName">Last name <span class="text-gold">*</span></label><input class="tbt-input" id="lastName" name="lastName" autocomplete="family-name" data-required="true"></div></div>
						<div class="grid gap-6 sm:grid-cols-2"><div class="tbt-field"><label class="tbt-label" for="phone">Mobile number <span class="text-gold" data-phone-star>*</span></label><input class="tbt-input" id="phone" name="phone" type="tel" autocomplete="tel" placeholder="(424) 000-0000" data-intent-required="new,existing"></div><div class="tbt-field"><label class="tbt-label" for="email">Email address <span class="text-gold">*</span></label><input class="tbt-input" id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" data-required="true"></div></div>
						<?php self::select( 'preferredContact', 'How should our concierge team contact you?', array( 'Instagram DM', 'Text message', 'Phone call', 'Email' ) ); ?>
						<div class="tbt-field border-l border-gold/45 pl-5"><label class="tbt-label" for="socialHandle">Your Instagram username <span class="text-gold">*</span></label><input class="tbt-input" id="socialHandle" name="socialHandle" placeholder="@yourusername" autocomplete="off" data-required="true"><p class="mt-3 text-xs leading-relaxed text-ivory/45">This remains required for every enquiry and contact method so the concierge team can match your profile.</p></div>
					</section>

					<section class="mt-10 hidden space-y-9" data-step="new-smile" data-intent-panel="new">
						<?php self::select( 'city', 'Which city would you like to be seen in?', $cities ); ?>
						<?php self::choices( 'services', 'Services you are interested in', $services, true ); ?>
						<div class="tbt-field"><label class="tbt-label" for="goals">Your goals and concerns <span class="text-gold">*</span></label><textarea class="tbt-input resize-none" id="goals" name="goals" rows="5" placeholder="What would you like to change or improve about your smile?" data-required="true"></textarea></div>
						<?php self::select( 'timeline', 'When would you like to begin?', $timelines ); ?>
						<?php self::photo_upload( 'photos-new', 'JPG, PNG or HEIC. Photos help Dr. Trev assess your smile and prepare an accurate plan before your consultation.' ); ?>
					</section>

					<section class="mt-10 hidden space-y-10" data-step="new-investment" data-intent-panel="new">
						<?php self::choices( 'budget', 'What investment range are you currently planning?', $budgets ); ?>
						<p class="-mt-7 text-xs leading-relaxed text-ivory/45">This helps the team prepare relevant options. It does not determine your clinical eligibility.</p>
						<?php self::choices( 'financing', 'Would financing or monthly payment options be helpful?', array( 'Yes', 'No, I plan to pay directly', 'I am not sure yet' ), false ); ?>
						<?php self::choices( 'readiness', 'Which best describes your next step?', $readiness, false, 'grid-cols-1' ); ?>
					</section>

					<section class="mt-10 hidden space-y-8" data-step="existing-support" data-intent-panel="existing">
						<?php self::select( 'supportCity', 'Preferred office or city', $cities ); ?>
						<?php self::select( 'supportCategory', 'Support category', array( 'Appointment scheduling or change', 'Post-appointment question', 'Billing or financing question', 'Records request', 'Other support' ) ); ?>
						<div class="tbt-field"><label class="tbt-label" for="appointmentDate">Appointment date, if applicable</label><input class="tbt-input" id="appointmentDate" name="appointmentDate" type="date"></div>
						<div class="tbt-field"><label class="tbt-label" for="supportMessage">Short description <span class="text-gold">*</span></label><textarea class="tbt-input resize-none" id="supportMessage" name="supportMessage" rows="5" data-required="true" placeholder="Share only the details our support team needs to route your request."></textarea><p class="mt-3 text-xs leading-relaxed text-ivory/45">Do not use this form or social media for urgent clinical concerns.</p></div>
						<?php self::photo_upload( 'photos-existing', 'JPG, PNG or HEIC. Current photos of your smile help the team review your request accurately.' ); ?>
					</section>

					<section class="mt-10 hidden space-y-8" data-step="general-enquiry" data-intent-panel="general">
						<div class="tbt-field"><label class="tbt-label" for="organization">Organization, if applicable</label><input class="tbt-input" id="organization" name="organization"></div>
						<?php self::select( 'enquiryType', 'Enquiry type', array( 'Media or speaking', 'Partnership', 'Vendor', 'Employment', 'General enquiry' ) ); ?>
						<div class="tbt-field"><label class="tbt-label" for="message">Message <span class="text-gold">*</span></label><textarea class="tbt-input resize-none" id="message" name="message" rows="6" data-required="true"></textarea></div>
						<?php self::photo_upload( 'photos-general', 'JPG, PNG or HEIC. Current photos of your smile help the team review your request accurately.' ); ?>
					</section>

					<section class="mt-10 hidden space-y-8" data-step="permission">
						<?php self::select( 'hear', 'How did you hear about us?', $hear, false ); ?>
						<label class="tbt-consent"><input id="contactConsent" name="contactConsent" type="checkbox" class="mt-1 h-4 w-4 shrink-0 accent-gold" data-required="true"><span class="text-sm leading-relaxed text-ivory/80">I authorize the Teeth by Trev concierge team to contact me about this enquiry using my selected contact method. If I selected Instagram, I understand the message may come from <span class="text-gold">@teethbytrev.team</span>. <span class="text-gold">*</span></span></label>
						<label class="flex cursor-pointer items-start gap-4 border border-ivory/12 p-5 transition-colors hover:border-ivory/25"><input id="marketingConsent" name="marketingConsent" type="checkbox" class="mt-1 h-4 w-4 shrink-0 accent-gold"><span class="text-sm leading-relaxed text-ivory/60">Optional: I would like to receive occasional Teeth by Trev news and offers. I can unsubscribe at any time.</span></label>
						<p class="border-t border-ivory/10 pt-6 text-xs leading-relaxed text-ivory/45">Instagram and other social messages are for general conversation and scheduling. Do not send medical records, payment-card information, passwords or verification codes by DM.</p>
					</section>

					<div class="mt-8 hidden border border-rose-400/50 bg-rose-400/[0.05] p-4 text-sm leading-relaxed text-rose-200" role="alert" data-tbt-form-error></div>
					<div class="mt-12 flex items-center justify-between gap-4"><button type="button" data-tbt-back class="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-ivory/55 hover:text-ivory">← Back</button><button type="button" data-tbt-next class="inline-flex items-center gap-3 rounded-full bg-champagne px-8 py-4 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-onyx hover:bg-gold">Continue →</button><button type="submit" data-tbt-submit class="hidden items-center gap-3 rounded-full bg-champagne px-8 py-4 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-onyx hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60">Send to the concierge team</button></div>
				</div>
				<p class="mt-5 text-center text-xs leading-relaxed text-ivory/40">Your information is kept private and used to respond to this enquiry. Clinical records and card details are never collected in this form.</p>
			</form>

			<div class="hidden mx-auto max-w-2xl border border-ivory/10 bg-white/[0.02] px-6 py-12 text-center sm:px-12 sm:py-16" data-tbt-success><div class="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">✓</div><p class="text-[0.6rem] uppercase tracking-[0.32em] text-gold">Concierge handoff</p><h2 class="mt-4 font-serif text-4xl font-light text-ivory sm:text-5xl">Thank you — your enquiry is with our team.</h2><p class="mx-auto mt-6 max-w-lg text-base leading-relaxed text-ivory/65">A Teeth by Trev concierge team member will review your submission and respond using the contact method you selected.</p><div class="mx-auto mt-10 max-w-lg border border-gold/25 bg-gold/[0.05] p-6 text-left"><p class="text-[0.58rem] uppercase tracking-[0.25em] text-ivory/45">Your private reference</p><p class="mt-2 font-serif text-3xl font-light tracking-wide text-gold" data-tbt-reference></p><p class="mt-4 text-sm leading-relaxed text-ivory/60">Keep this reference. It lets our team match your Instagram conversation with your form securely.</p></div><div class="mx-auto mt-6 max-w-lg border border-ivory/10 p-5 text-left"><p class="text-[0.58rem] uppercase tracking-[0.25em] text-ivory/45">Message to send</p><p class="mt-3 text-sm leading-relaxed text-ivory/75" data-tbt-handoff></p><button type="button" data-tbt-copy class="mt-4 text-[0.65rem] uppercase tracking-[0.2em] text-gold hover:text-champagne">Copy message</button></div><a href="https://www.instagram.com/teethbytrev.team/" target="_blank" rel="noopener noreferrer" class="mt-8 inline-flex items-center justify-center rounded-full bg-champagne px-7 py-4 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-onyx hover:bg-gold">Follow &amp; message @teethbytrev.team →</a></div>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	public static function square_deposit( array $attributes ): string {
		$attributes = shortcode_atts( array( 'type' => '' ), $attributes, 'tbt_square_deposit' );
		$type = in_array( $attributes['type'], array( 'in-person', 'video' ), true ) ? $attributes['type'] : '';
		ob_start();
		?>
		<div data-tbt-square data-type="<?php echo esc_attr( $type ); ?>">
			<div class="mx-auto max-w-md border border-ivory/15 bg-ivory/[0.03] px-8 py-12 text-center" data-square-loading><p class="text-sm leading-relaxed text-ivory/70">Loading secure payment form…</p></div>
			<div class="hidden mx-auto max-w-md border border-ivory/15 bg-ivory/[0.03] px-8 py-12 text-center" data-square-unconfigured><p class="text-sm leading-relaxed text-ivory/70">Online deposits are being set up. Please <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="text-gold underline-offset-4 hover:underline">reach out to our team</a> and we’ll reserve your consultation directly.</p></div>
			<div class="hidden mx-auto max-w-md border border-gold/25 bg-ivory px-7 py-9 text-onyx sm:px-9 sm:py-10" data-square-form><p class="text-[0.62rem] uppercase tracking-[0.28em] text-gold">Secure payment</p><div class="mt-2 flex items-baseline justify-between"><h2 class="font-serif text-3xl font-light">Consultation deposit</h2><span class="font-serif text-3xl font-light">$250</span></div><p class="mt-3 text-xs leading-relaxed text-onyx/60">Credited 100% toward your treatment. Processed securely by Square — your card details never touch our servers.</p>
				<label class="mt-7 block"><span class="block text-[0.7rem] uppercase tracking-[0.18em] text-onyx/55">Full name</span><input type="text" name="squareName" autocomplete="name" placeholder="Jordan Avery" class="mt-2 w-full border border-onyx/20 bg-transparent px-3 py-3 text-sm text-onyx outline-none placeholder:text-onyx/35 focus:border-gold"></label>
				<label class="mt-4 block"><span class="block text-[0.7rem] uppercase tracking-[0.18em] text-onyx/55">Email for your receipt</span><input type="email" name="squareEmail" autocomplete="email" placeholder="you@example.com" class="mt-2 w-full border border-onyx/20 bg-transparent px-3 py-3 text-sm text-onyx outline-none placeholder:text-onyx/35 focus:border-gold"></label>
				<label class="mt-4 block"><span class="block text-[0.7rem] uppercase tracking-[0.18em] text-onyx/55">Phone</span><input type="tel" name="squarePhone" autocomplete="tel" placeholder="(310) 555-0123" class="mt-2 w-full border border-onyx/20 bg-transparent px-3 py-3 text-sm text-onyx outline-none placeholder:text-onyx/35 focus:border-gold"></label>
				<div class="mt-5"><span class="block text-[0.7rem] uppercase tracking-[0.18em] text-onyx/55">Card details</span><div class="mt-2 min-h-[52px]" data-square-card></div></div><p class="mt-3 hidden text-xs text-red-700" role="alert" aria-live="polite" data-square-error></p><button type="button" data-square-pay class="mt-6 w-full rounded-full bg-onyx px-8 py-4 text-[0.66rem] uppercase tracking-[0.22em] text-ivory transition-colors hover:bg-gold hover:text-onyx disabled:cursor-not-allowed disabled:opacity-50">Pay $250 deposit</button>
			</div>
			<div class="hidden mx-auto max-w-md border border-gold/30 bg-ivory px-8 py-14 text-center text-onyx" data-square-success><div class="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">✓</div><h2 class="font-serif text-3xl font-light">Deposit Received</h2><p class="mt-5 text-sm leading-relaxed text-onyx/70">Thank you — your $250 consultation deposit is confirmed and credited 100% toward your treatment. Dr. Trev’s team will be in touch to schedule your appointment.</p></div>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	public static function analytics_consent(): void {
		?>
		<button type="button" data-tbt-privacy-open class="hidden fixed bottom-4 left-4 z-[70] rounded-full border border-ink/15 bg-ivory/95 px-4 py-2 text-[0.58rem] uppercase tracking-[0.16em] text-ink shadow-lg backdrop-blur transition-colors hover:border-gold">Privacy choices <span class="sr-only" data-tbt-privacy-state></span></button>
		<section aria-label="Analytics privacy choices" data-tbt-privacy-panel class="hidden fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-3xl border border-ivory/15 bg-ink/95 p-5 text-ivory shadow-2xl backdrop-blur sm:p-6"><p class="text-[0.6rem] uppercase tracking-[0.28em] text-gold">Your privacy choice</p><h2 class="mt-2 font-serif text-2xl font-light">Optional analytics is off unless you allow it.</h2><p class="mt-3 max-w-2xl text-sm leading-relaxed text-ivory/65">If allowed, Meta receives page visits and a generic conversion after a successfully saved enquiry. We do not send your contact details, treatment choices, budget, messages, photos or clinical information to Meta.</p><div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"><button type="button" data-tbt-privacy-choice="denied" class="rounded-full border border-ivory/25 px-5 py-3 text-[0.65rem] uppercase tracking-[0.18em] text-ivory transition-colors hover:border-ivory/60">Essential only</button><button type="button" data-tbt-privacy-choice="granted" class="rounded-full bg-champagne px-5 py-3 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-onyx transition-colors hover:bg-gold">Allow analytics</button><a href="<?php echo esc_url( home_url( '/privacy/' ) ); ?>" class="text-center text-[0.62rem] uppercase tracking-[0.16em] text-ivory/55 underline-offset-4 hover:text-gold hover:underline sm:ml-auto">Privacy details</a></div></section>
		<?php
	}
}
