<?php
/**
 * Plugin Name: TBT Core
 * Description: Operational features for the Teeth by Trev WordPress site.
 * Version: 0.2.9
 * Requires at least: 6.6
 * Requires PHP: 8.1
 * Author: Barrana AI
 * Text Domain: tbt-core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TBT_CORE_VERSION', '0.2.9' );
define( 'TBT_CORE_PATH', plugin_dir_path( __FILE__ ) );
define( 'TBT_CORE_URL', plugin_dir_url( __FILE__ ) );

require_once TBT_CORE_PATH . 'includes/class-tbt-core-schema.php';

final class TBT_Core_Settings {
	private const OPTION = 'tbt_core_integrations';
	private const SECRET_FIELDS = array( 'AIRTABLE_TOKEN', 'SQUARE_ACCESS_TOKEN', 'META_CAPI_ACCESS_TOKEN' );

	public static function register(): void {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'maybe_save' ) );
	}

	public static function menu(): void {
		add_options_page( 'TBT Integrations', 'TBT Integrations', 'manage_options', 'tbt-core-integrations', array( __CLASS__, 'render' ) );
	}

	private static function stored(): array {
		$value = get_option( self::OPTION, array() );
		return is_array( $value ) ? $value : array();
	}

	private static function encryption_key(): string {
		return hash( 'sha256', wp_salt( 'auth' ) . wp_salt( 'secure_auth' ), true );
	}

	private static function encrypt( string $value ) {
		if ( ! function_exists( 'sodium_crypto_secretbox' ) ) return new WP_Error( 'encryption_unavailable', 'Secure secret storage is unavailable on this server.' );
		try {
			$nonce = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
			$ciphertext = sodium_crypto_secretbox( $value, $nonce, self::encryption_key() );
			return 'sodium:' . base64_encode( $nonce . $ciphertext );
		} catch ( Throwable $error ) {
			return new WP_Error( 'encryption_failed', 'The secret could not be encrypted.' );
		}
	}

	private static function decrypt( string $value ): string {
		if ( ! str_starts_with( $value, 'sodium:' ) || ! function_exists( 'sodium_crypto_secretbox_open' ) ) return '';
		$decoded = base64_decode( substr( $value, 7 ), true );
		if ( false === $decoded || strlen( $decoded ) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ) return '';
		$nonce = substr( $decoded, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
		$plaintext = sodium_crypto_secretbox_open( substr( $decoded, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ), $nonce, self::encryption_key() );
		return false === $plaintext ? '' : trim( $plaintext );
	}

	public static function get( string $name, string $default = '' ): string {
		if ( defined( $name ) ) {
			$value = trim( (string) constant( $name ) );
			if ( '' !== $value || 'SQUARE_ENABLED' === $name ) return $value;
		}
		$environment = getenv( $name );
		if ( false !== $environment ) {
			$value = trim( (string) $environment );
			if ( '' !== $value || 'SQUARE_ENABLED' === $name ) return $value;
		}
		$settings = self::stored();
		if ( ! array_key_exists( $name, $settings ) ) return $default;
		$value = (string) $settings[ $name ];
		return in_array( $name, self::SECRET_FIELDS, true ) ? self::decrypt( $value ) : trim( $value );
	}

	private static function has_secret( array $settings, string $name ): bool {
		return ! empty( $settings[ $name ] ) && '' !== self::decrypt( (string) $settings[ $name ] );
	}

	public static function maybe_save(): void {
		if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) || 'save' !== ( $_POST['tbt_core_settings_action'] ?? '' ) ) return;
		if ( ! current_user_can( 'manage_options' ) ) wp_die( esc_html__( 'You are not allowed to manage these settings.', 'tbt-core' ) );
		check_admin_referer( 'tbt_core_settings' );
		$posted = isset( $_POST['tbt'] ) && is_array( $_POST['tbt'] ) ? wp_unslash( $_POST['tbt'] ) : array();
		$settings = self::stored();
		$public_fields = array( 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_NAME', 'AIRTABLE_DEPOSITS_TABLE', 'SQUARE_APPLICATION_ID', 'SQUARE_LOCATION_ID', 'SQUARE_VERSION' );
		foreach ( $public_fields as $field ) $settings[ $field ] = sanitize_text_field( (string) ( $posted[ $field ] ?? '' ) );
		$settings['SQUARE_ENVIRONMENT'] = 'sandbox' === ( $posted['SQUARE_ENVIRONMENT'] ?? '' ) ? 'sandbox' : 'production';
		$settings['SQUARE_ENABLED'] = ! empty( $posted['SQUARE_ENABLED'] ) ? '1' : '0';
		foreach ( self::SECRET_FIELDS as $field ) {
			$plaintext = trim( (string) ( $posted[ $field ] ?? '' ) );
			if ( '' === $plaintext ) continue;
			$encrypted = self::encrypt( $plaintext );
			if ( is_wp_error( $encrypted ) ) {
				add_settings_error( self::OPTION, 'tbt_core_secret_error', $encrypted->get_error_message(), 'error' );
				return;
			}
			$settings[ $field ] = $encrypted;
		}
		update_option( self::OPTION, $settings, false );
		add_settings_error( self::OPTION, 'tbt_core_saved', 'TBT integration settings saved securely.', 'success' );
	}

	private static function field( array $settings, string $name, string $label, string $description = '' ): void {
		$value = (string) ( $settings[ $name ] ?? '' );
		echo '<tr><th scope="row"><label for="tbt-' . esc_attr( strtolower( str_replace( '_', '-', $name ) ) ) . '">' . esc_html( $label ) . '</label></th><td>';
		echo '<input class="regular-text" id="tbt-' . esc_attr( strtolower( str_replace( '_', '-', $name ) ) ) . '" name="tbt[' . esc_attr( $name ) . ']" type="text" value="' . esc_attr( $value ) . '">';
		if ( $description ) echo '<p class="description">' . esc_html( $description ) . '</p>';
		echo '</td></tr>';
	}

	private static function secret_field( array $settings, string $name, string $label ): void {
		$stored = self::has_secret( $settings, $name );
		echo '<tr><th scope="row"><label for="tbt-' . esc_attr( strtolower( str_replace( '_', '-', $name ) ) ) . '">' . esc_html( $label ) . '</label></th><td>';
		echo '<input autocomplete="new-password" class="regular-text" id="tbt-' . esc_attr( strtolower( str_replace( '_', '-', $name ) ) ) . '" name="tbt[' . esc_attr( $name ) . ']" type="password" value="" placeholder="' . esc_attr( $stored ? 'Stored securely — leave blank to keep' : 'Not configured' ) . '">';
		echo '<p class="description">' . esc_html( $stored ? 'An encrypted value is stored. It is never displayed back to the browser.' : 'No encrypted value is stored.' ) . '</p></td></tr>';
	}

	public static function render(): void {
		if ( ! current_user_can( 'manage_options' ) ) return;
		$settings = self::stored();
		?>
		<div class="wrap">
			<h1>TBT Integrations</h1>
			<p>Values saved here are limited to this WordPress environment. Secret values are encrypted with this site's WordPress authentication keys and are never shown again.</p>
			<?php settings_errors( self::OPTION ); ?>
			<form method="post">
				<?php wp_nonce_field( 'tbt_core_settings' ); ?>
				<input type="hidden" name="tbt_core_settings_action" value="save">
				<h2>Airtable</h2>
				<table class="form-table" role="presentation">
					<?php self::secret_field( $settings, 'AIRTABLE_TOKEN', 'Personal access token' ); ?>
					<?php self::field( $settings, 'AIRTABLE_BASE_ID', 'Base ID' ); ?>
					<?php self::field( $settings, 'AIRTABLE_TABLE_NAME', 'Leads table', 'A table name or Airtable table ID.' ); ?>
					<?php self::field( $settings, 'AIRTABLE_DEPOSITS_TABLE', 'Deposits table' ); ?>
				</table>
				<h2>Square</h2>
				<p><strong>Safety:</strong> leave payments disabled on staging. Stored production credentials cannot charge a card until this switch is explicitly enabled.</p>
				<table class="form-table" role="presentation">
					<?php self::secret_field( $settings, 'SQUARE_ACCESS_TOKEN', 'Access token' ); ?>
					<?php self::field( $settings, 'SQUARE_APPLICATION_ID', 'Application ID' ); ?>
					<?php self::field( $settings, 'SQUARE_LOCATION_ID', 'Location ID' ); ?>
					<tr><th scope="row"><label for="tbt-square-environment">Environment</label></th><td><select id="tbt-square-environment" name="tbt[SQUARE_ENVIRONMENT]"><option value="sandbox" <?php selected( $settings['SQUARE_ENVIRONMENT'] ?? 'sandbox', 'sandbox' ); ?>>Sandbox</option><option value="production" <?php selected( $settings['SQUARE_ENVIRONMENT'] ?? 'sandbox', 'production' ); ?>>Production</option></select></td></tr>
					<?php self::field( $settings, 'SQUARE_VERSION', 'Square API version' ); ?>
					<tr><th scope="row">Enable payments</th><td><label><input name="tbt[SQUARE_ENABLED]" type="checkbox" value="1" <?php checked( $settings['SQUARE_ENABLED'] ?? '0', '1' ); ?>> Allow this environment to tokenize cards and create Square payments</label></td></tr>
				</table>
				<?php submit_button( 'Save integration settings' ); ?>
			</form>
		</div>
		<?php
	}
}

require_once TBT_CORE_PATH . 'includes/class-tbt-core-rest.php';
require_once TBT_CORE_PATH . 'includes/class-tbt-core-ui.php';

function tbt_core_boot(): void {
	if ( get_option( 'tbt_core_schema_version' ) !== TBT_CORE_VERSION ) {
		TBT_Core_Schema::install();
		tbt_core_seed_pages();
	}
	TBT_Core_REST::register();
	TBT_Core_UI::register();
	TBT_Core_Settings::register();
	tbt_core_schedule_airtable_sync();
}
add_action( 'plugins_loaded', 'tbt_core_boot' );

function tbt_core_cron_schedules( array $schedules ): array {
	$schedules['tbt_five_minutes'] = array( 'interval' => 5 * MINUTE_IN_SECONDS, 'display' => 'Every five minutes' );
	return $schedules;
}
add_filter( 'cron_schedules', 'tbt_core_cron_schedules' );

function tbt_core_schedule_airtable_sync(): void {
	if ( ! TBT_Core_REST::airtable_is_configured() || wp_next_scheduled( 'tbt_core_sync_airtable' ) ) return;
	wp_schedule_event( time() + MINUTE_IN_SECONDS, 'tbt_five_minutes', 'tbt_core_sync_airtable' );
}

function tbt_core_seed_pages(): void {
	$pages = array(
		'home'         => 'Home',
		'about'        => 'About',
		'services'     => 'Services',
		'gallery'      => 'Gallery',
		'financing'    => 'Financing',
		'contact'      => 'Contact',
		'consultation' => 'Consultation',
		'reserve'      => 'Reserve',
		'privacy'      => 'Privacy',
		'terms'        => 'Terms',
	);
	$ids = array();
	foreach ( $pages as $slug => $title ) {
		$page = get_page_by_path( $slug );
		if ( ! $page ) {
			$id = wp_insert_post(
				array(
					'post_title'   => $title,
					'post_name'    => $slug,
					'post_status'  => 'publish',
					'post_type'    => 'page',
					'post_content' => '',
				),
				true
			);
			if ( ! is_wp_error( $id ) ) {
				$ids[ $slug ] = (int) $id;
			}
		} else {
			$ids[ $slug ] = (int) $page->ID;
		}
	}
	if ( isset( $ids['home'] ) ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $ids['home'] );
	}
}

function tbt_core_activate(): void {
	TBT_Core_Schema::install();
	tbt_core_seed_pages();
	TBT_Core_REST::photo_rewrites();
	tbt_core_schedule_airtable_sync();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'tbt_core_activate' );

function tbt_core_deactivate(): void {
	wp_clear_scheduled_hook( 'tbt_core_sync_airtable' );
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'tbt_core_deactivate' );
