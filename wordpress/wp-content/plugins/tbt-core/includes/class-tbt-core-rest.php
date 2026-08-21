<?php
/**
 * Public operational endpoints for enquiries, private photo handoff and Square.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class TBT_Core_REST {
	private const CONSENT_VERSION = '2026-07-23-v1';
	private const MAX_PHOTOS = 12;
	private const MAX_PHOTO_BYTES = 8388608;
	private const DEPOSIT_CENTS = 25000;
	private const REFERENCE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

	public static function register(): void {
		add_action( 'rest_api_init', array( __CLASS__, 'routes' ) );
		add_action( 'init', array( __CLASS__, 'photo_rewrites' ), 5 );
		add_action( 'init', array( __CLASS__, 'maybe_flush_photo_rewrites' ), 99 );
		add_filter( 'query_vars', array( __CLASS__, 'photo_query_vars' ) );
		add_filter( 'rest_post_dispatch', array( __CLASS__, 'no_store_operational_responses' ), 10, 3 );
		add_action( 'template_redirect', array( __CLASS__, 'serve_photo_request' ) );
		add_action( 'tbt_core_sync_airtable', array( __CLASS__, 'sync_unsaved_airtable' ) );
	}

	public static function routes(): void {
		register_rest_route( 'tbt/v1', '/health', array( 'methods' => WP_REST_Server::READABLE, 'callback' => array( __CLASS__, 'health' ), 'permission_callback' => '__return_true' ) );
		register_rest_route( 'tbt/v1', '/inquiry', array( 'methods' => WP_REST_Server::CREATABLE, 'callback' => array( __CLASS__, 'inquiry' ), 'permission_callback' => array( __CLASS__, 'allow_public_write' ) ) );
		register_rest_route( 'tbt/v1', '/square/config', array( 'methods' => WP_REST_Server::READABLE, 'callback' => array( __CLASS__, 'square_config' ), 'permission_callback' => '__return_true' ) );
		register_rest_route( 'tbt/v1', '/square/pay', array( 'methods' => WP_REST_Server::CREATABLE, 'callback' => array( __CLASS__, 'square_pay' ), 'permission_callback' => array( __CLASS__, 'allow_public_write' ) ) );
	}

	public static function health(): WP_REST_Response {
		global $wpdb;
		$pending = self::airtable_is_configured() ? (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}tbt_inquiries WHERE airtable_saved = 0" ) : 0; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$pending_deposits = self::airtable_is_configured() ? (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}tbt_deposits WHERE airtable_saved = 0" ) : 0; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return new WP_REST_Response( array( 'ok' => true, 'plugin' => TBT_CORE_VERSION, 'php' => PHP_VERSION, 'wp' => get_bloginfo( 'version' ), 'storage' => 'wordpress-database', 'airtable' => self::airtable_is_configured(), 'airtablePending' => $pending, 'airtablePendingDeposits' => $pending_deposits, 'square' => self::square_is_configured() ), 200 );
	}

	public static function airtable_is_configured(): bool {
		return (bool) ( self::config( 'AIRTABLE_TOKEN' ) && self::config( 'AIRTABLE_BASE_ID' ) );
	}

	public static function no_store_operational_responses( $response, WP_REST_Server $server, WP_REST_Request $request ) {
		if ( ! str_starts_with( $request->get_route(), '/tbt/v1/' ) ) {
			return $response;
		}
		$response = rest_ensure_response( $response );
		$response->header( 'Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0' );
		$response->header( 'Pragma', 'no-cache' );
		$response->header( 'Expires', 'Wed, 11 Jan 1984 05:00:00 GMT' );
		return $response;
	}

	public static function allow_public_write( WP_REST_Request $request ): bool {
		$origin = (string) $request->get_header( 'origin' );
		if ( '' === $origin ) {
			return true;
		}
		$origin_host = wp_parse_url( $origin, PHP_URL_HOST );
		$site_host = wp_parse_url( home_url( '/' ), PHP_URL_HOST );
		return is_string( $origin_host ) && is_string( $site_host ) && strtolower( $origin_host ) === strtolower( $site_host );
	}

	private static function config( string $name, string $default = '' ): string {
		if ( defined( $name ) ) {
			return trim( (string) constant( $name ) );
		}
		$value = getenv( $name );
		return false === $value ? $default : trim( (string) $value );
	}

	private static function clean( $value, int $max = 200 ): string {
		return is_string( $value ) ? mb_substr( trim( wp_unslash( $value ) ), 0, $max ) : '';
	}

	private static function bool_value( $value ): bool {
		return true === $value || 1 === $value || '1' === $value || 'true' === $value;
	}

	private static function new_reference(): string {
		$suffix = '';
		$max = strlen( self::REFERENCE_ALPHABET ) - 1;
		for ( $i = 0; $i < 5; ++$i ) {
			$suffix .= self::REFERENCE_ALPHABET[ random_int( 0, $max ) ];
		}
		return 'TBT-' . gmdate( 'ymd' ) . '-' . $suffix;
	}

	private static function priority( string $intent, string $readiness, string $timeline ): string {
		if ( 'existing' === $intent ) return 'Existing patient';
		if ( 'general' === $intent ) return 'General enquiry';
		if ( 'I am ready to schedule a consultation' === $readiness && in_array( $timeline, array( 'As soon as possible', 'Within 1–3 months' ), true ) ) return 'Priority A';
		if ( 'I am researching for the future' === $readiness || in_array( $timeline, array( 'I am researching for the future', 'Within 6–12 months' ), true ) ) return 'Priority C';
		return 'Priority B';
	}

	private static function caller_type( string $intent ): string {
		if ( 'existing' === $intent ) return 'Existing patient';
		if ( 'general' === $intent ) return 'General / business';
		return 'New consultation';
	}

	private static function decode_photos( $photos ) {
		if ( ! is_array( $photos ) ) return new WP_Error( 'photos_required', 'Include at least one photo of your smile.', array( 'status' => 422 ) );
		$decoded = array();
		foreach ( array_slice( $photos, 0, self::MAX_PHOTOS ) as $index => $photo ) {
			$data_url = is_array( $photo ) ? (string) ( $photo['dataUrl'] ?? '' ) : '';
			if ( ! preg_match( '#^data:(image/(?:jpeg|jpg|png|webp|gif|heic|heif));base64,([A-Za-z0-9+/=\r\n]+)$#i', $data_url, $match ) ) continue;
			$bytes = base64_decode( preg_replace( '/\s+/', '', $match[2] ), true );
			if ( false === $bytes || 0 === strlen( $bytes ) || strlen( $bytes ) > self::MAX_PHOTO_BYTES ) continue;
			$mime = strtolower( $match[1] );
			if ( ! self::photo_signature_matches( $bytes, $mime ) ) continue;
			$name = is_array( $photo ) ? self::clean( $photo['name'] ?? '', 100 ) : '';
			$stem = sanitize_file_name( pathinfo( $name, PATHINFO_FILENAME ) );
			if ( '' === $stem ) $stem = 'photo-' . ( $index + 1 );
			$extensions = array( 'image/jpeg' => 'jpg', 'image/jpg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif', 'image/heic' => 'heic', 'image/heif' => 'heic' );
			$decoded[] = array( 'index' => (int) $index, 'filename' => $stem . '.' . $extensions[ $mime ], 'mime' => $mime, 'data' => $bytes );
		}
		if ( ! $decoded ) return new WP_Error( 'photos_required', 'Include at least one valid photo of your smile.', array( 'status' => 422 ) );
		return $decoded;
	}

	private static function photo_signature_matches( string $bytes, string $mime ): bool {
		if ( in_array( $mime, array( 'image/jpeg', 'image/jpg' ), true ) ) return str_starts_with( $bytes, "\xFF\xD8\xFF" );
		if ( 'image/png' === $mime ) return str_starts_with( $bytes, "\x89PNG\r\n\x1A\n" );
		if ( 'image/gif' === $mime ) return str_starts_with( $bytes, 'GIF87a' ) || str_starts_with( $bytes, 'GIF89a' );
		if ( 'image/webp' === $mime ) return strlen( $bytes ) >= 12 && 'RIFF' === substr( $bytes, 0, 4 ) && 'WEBP' === substr( $bytes, 8, 4 );
		if ( in_array( $mime, array( 'image/heic', 'image/heif' ), true ) ) {
			if ( strlen( $bytes ) < 12 || 'ftyp' !== substr( $bytes, 4, 4 ) ) return false;
			$brand = strtolower( substr( $bytes, 8, 4 ) );
			return in_array( $brand, array( 'heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1' ), true );
		}
		return false;
	}

	private static function existing_inquiry_response( array $existing, string $submission_token ): WP_REST_Response {
		$payload = json_decode( (string) ( $existing['payload'] ?? '' ), true );
		$airtable_saved = (bool) ( $existing['airtable_saved'] ?? false );
		if ( ! $airtable_saved && is_array( $payload ) ) {
			$airtable = self::send_airtable_inquiry( $payload );
			$airtable_saved = $airtable['ok'];
			if ( $airtable_saved ) {
				global $wpdb;
				$wpdb->update( $wpdb->prefix . 'tbt_inquiries', array( 'airtable_saved' => 1 ), array( 'submission_token' => $submission_token ), array( '%d' ), array( '%s' ) );
			}
		}
		$analytics_consent = (bool) ( $existing['analytics_consent'] ?? false );
		$meta_accepted = $analytics_consent && is_array( $payload ) ? self::send_meta_lead( $submission_token, is_array( $payload['attribution'] ?? null ) ? $payload['attribution'] : array() ) : false;
		return new WP_REST_Response(
			array(
				'ok'                      => true,
				'recorded'                => true,
				'stored'                  => $airtable_saved,
				'leadReference'           => (string) $existing['lead_reference'],
				'photosUrl'               => ! empty( $existing['photos_url'] ) ? $existing['photos_url'] : null,
				'metaEventId'             => $analytics_consent ? $submission_token : null,
				'metaServerEventAccepted' => $meta_accepted,
				'idempotent'              => true,
			),
			200
		);
	}

	private static function rate_limited(): bool {
		$ip = self::clean( $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown', 80 );
		$ip = trim( explode( ',', $ip )[0] );
		$key = 'tbt_rate_' . md5( $ip );
		$count = (int) get_transient( $key );
		if ( $count >= 10 ) return true;
		set_transient( $key, $count + 1, 10 * MINUTE_IN_SECONDS );
		return false;
	}

	public static function inquiry( WP_REST_Request $request ) {
		if ( self::rate_limited() ) return new WP_Error( 'rate_limited', 'Please wait a few minutes before trying again.', array( 'status' => 429 ) );
		$data = $request->get_json_params();
		if ( ! is_array( $data ) ) return new WP_Error( 'bad_request', 'Bad request.', array( 'status' => 400 ) );

		$intent = self::clean( $data['intent'] ?? '', 20 );
		if ( ! in_array( $intent, array( 'new', 'existing', 'general' ), true ) ) $intent = 'new';
		$first = self::clean( $data['firstName'] ?? '', 100 );
		$last = self::clean( $data['lastName'] ?? '', 100 );
		$email = sanitize_email( self::clean( $data['email'] ?? '', 190 ) );
		$phone = self::clean( $data['phone'] ?? '', 60 );
		$preferred = self::clean( $data['preferredContact'] ?? '', 60 );
		$social = self::clean( $data['socialHandle'] ?? '', 190 );
		$contact_consent = self::bool_value( $data['contactConsent'] ?? false );
		if ( ! $first || ! $last || ! is_email( $email ) ) return new WP_Error( 'contact_fields', 'Complete the required contact fields.', array( 'status' => 422 ) );
		if ( ! $preferred || ! $contact_consent ) return new WP_Error( 'permission', 'Choose a contact method and provide permission to respond.', array( 'status' => 422 ) );
		if ( ! $social ) return new WP_Error( 'instagram_required', 'Enter your Instagram username.', array( 'status' => 422 ) );
		if ( 'general' !== $intent && ! $phone ) return new WP_Error( 'phone_required', 'Enter a mobile number.', array( 'status' => 422 ) );

		$city = 'general' === $intent ? '' : self::clean( $data['city'] ?? '', 120 );
		$services = 'new' === $intent && is_array( $data['services'] ?? null ) ? array_values( array_filter( array_map( fn( $item ) => self::clean( $item, 60 ), $data['services'] ) ) ) : array();
		$goals = 'new' === $intent ? self::clean( $data['goals'] ?? '', 5000 ) : '';
		$timeline = 'new' === $intent ? self::clean( $data['timeline'] ?? '', 100 ) : '';
		$budget = 'new' === $intent ? self::clean( $data['budget'] ?? '', 60 ) : '';
		$financing = 'new' === $intent ? self::clean( $data['financing'] ?? '', 100 ) : '';
		$readiness = 'new' === $intent ? self::clean( $data['readiness'] ?? '', 140 ) : '';
		$support_category = 'existing' === $intent ? self::clean( $data['supportCategory'] ?? '', 120 ) : '';
		$appointment_date = 'existing' === $intent ? self::clean( $data['appointmentDate'] ?? '', 20 ) : '';
		$support_message = 'existing' === $intent ? self::clean( $data['supportMessage'] ?? '', 5000 ) : '';
		$organization = 'general' === $intent ? self::clean( $data['organization'] ?? '', 190 ) : '';
		$enquiry_type = 'general' === $intent ? self::clean( $data['enquiryType'] ?? '', 120 ) : '';
		$message = 'general' === $intent ? self::clean( $data['message'] ?? '', 5000 ) : '';
		if ( 'new' === $intent && ( ! $city || ! $services || ! $goals || ! $timeline || ! $budget || ! $financing || ! $readiness ) ) return new WP_Error( 'new_fields', 'Complete the required smile and investment questions.', array( 'status' => 422 ) );
		if ( 'existing' === $intent && ( ! $city || ! $support_category || ! $support_message ) ) return new WP_Error( 'support_fields', 'Complete the required support questions.', array( 'status' => 422 ) );
		if ( 'general' === $intent && ( ! $enquiry_type || ! $message ) ) return new WP_Error( 'general_fields', 'Complete the enquiry type and message.', array( 'status' => 422 ) );
		$photos = self::decode_photos( $data['photos'] ?? array() );
		if ( is_wp_error( $photos ) ) return $photos;

		global $wpdb;
		$table = $wpdb->prefix . 'tbt_inquiries';
		$photo_table = $wpdb->prefix . 'tbt_lead_photos';
		$submission_token = self::clean( $data['submissionToken'] ?? '', 100 );
		if ( ! $submission_token ) $submission_token = wp_generate_uuid4();
		$existing = $wpdb->get_row( $wpdb->prepare( "SELECT lead_reference, photos_url, airtable_saved, analytics_consent, payload FROM {$table} WHERE submission_token = %s LIMIT 1", $submission_token ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( $existing ) return self::existing_inquiry_response( $existing, $submission_token );

		$reference = self::new_reference();
		$photo_token = strtolower( wp_generate_password( 36, false, false ) );
		$photos_url = home_url( '/tbt-photos/' . rawurlencode( $photo_token ) . '/' );
		$now = current_time( 'mysql', true );
		$payload = array(
			'intent' => $intent, 'leadReference' => $reference, 'submissionToken' => $submission_token,
			'firstName' => $first, 'lastName' => $last, 'phone' => $phone, 'email' => $email,
			'preferredContact' => $preferred, 'socialPlatform' => 'Instagram', 'socialHandle' => $social,
			'city' => $city, 'services' => $services, 'goals' => $goals, 'timeline' => $timeline,
			'budget' => $budget, 'financing' => $financing, 'readiness' => $readiness,
			'hear' => self::clean( $data['hear'] ?? '', 160 ), 'supportCategory' => $support_category,
			'appointmentDate' => $appointment_date, 'supportMessage' => $support_message,
			'organization' => $organization, 'enquiryType' => $enquiry_type, 'message' => $message,
			'contactConsent' => true, 'consentVersion' => self::CONSENT_VERSION,
			'marketingConsent' => self::bool_value( $data['marketingConsent'] ?? false ),
			'analyticsConsent' => self::bool_value( $data['analyticsConsent'] ?? false ),
			'attribution' => is_array( $data['attribution'] ?? null ) ? array_map( fn( $item ) => self::clean( $item, 2048 ), $data['attribution'] ) : array(),
			'priority' => self::priority( $intent, $readiness, $timeline ), 'submittedAtUtc' => gmdate( 'c' ), 'photosUrl' => $photos_url,
		);
		$saved = $wpdb->insert( $table, array( 'lead_reference' => $reference, 'submission_token' => $submission_token, 'intent' => $intent, 'name' => trim( $first . ' ' . $last ), 'email' => $email, 'phone' => $phone, 'preferred_contact' => $preferred, 'social' => $social, 'photos_url' => $photos_url, 'payload' => wp_json_encode( $payload ), 'contact_consent' => 1, 'marketing_consent' => $payload['marketingConsent'] ? 1 : 0, 'analytics_consent' => $payload['analyticsConsent'] ? 1 : 0, 'consent_version' => self::CONSENT_VERSION, 'airtable_saved' => 0, 'created_at' => $now ), array( '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%d', '%d', '%s', '%d', '%s' ) );
		if ( ! $saved ) {
			$raced = $wpdb->get_row( $wpdb->prepare( "SELECT lead_reference, photos_url, airtable_saved, analytics_consent, payload FROM {$table} WHERE submission_token = %s LIMIT 1", $submission_token ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			if ( $raced ) return self::existing_inquiry_response( $raced, $submission_token );
			return new WP_Error( 'save_failed', 'Your enquiry was not saved. Please try again or contact the concierge team directly.', array( 'status' => 503 ) );
		}
		$written = 0;
		foreach ( $photos as $photo ) {
			$result = $wpdb->insert( $photo_table, array( 'lead_reference' => $reference, 'access_token' => $photo_token, 'photo_index' => $photo['index'], 'filename' => $photo['filename'], 'mime' => $photo['mime'], 'bytes' => strlen( $photo['data'] ), 'photo_data' => base64_encode( $photo['data'] ), 'created_at' => $now ), array( '%s', '%s', '%d', '%s', '%s', '%d', '%s', '%s' ) );
			if ( $result ) ++$written;
		}
		if ( 0 === $written ) {
			$wpdb->delete( $table, array( 'submission_token' => $submission_token ), array( '%s' ) );
			return new WP_Error( 'photo_save_failed', 'Your smile photos could not be saved. Please try again.', array( 'status' => 503 ) );
		}

		$airtable = self::send_airtable_inquiry( $payload );
		if ( $airtable['ok'] ) $wpdb->update( $table, array( 'airtable_saved' => 1 ), array( 'submission_token' => $submission_token ), array( '%d' ), array( '%s' ) );
		$meta_accepted = $payload['analyticsConsent'] ? self::send_meta_lead( $submission_token, $payload['attribution'] ) : false;
		return new WP_REST_Response( array( 'ok' => true, 'recorded' => true, 'stored' => $airtable['ok'], 'leadReference' => $reference, 'metaEventId' => $payload['analyticsConsent'] ? $submission_token : null, 'metaServerEventAccepted' => $meta_accepted, 'photos' => $written, 'photosUrl' => $photos_url ), 200 );
	}

	private static function send_airtable_inquiry( array $payload ): array {
		$fields = array(
			'Lead Reference' => $payload['leadReference'], 'Submission Token' => $payload['submissionToken'],
			'Caller Name' => trim( $payload['firstName'] . ' ' . $payload['lastName'] ), 'Phone Number' => $payload['phone'], 'Email' => $payload['email'],
			'Preferred Contact' => $payload['preferredContact'], 'Social Platform' => 'Instagram', 'Social' => 'Instagram: ' . $payload['socialHandle'],
			'City' => $payload['city'], 'Services' => implode( ', ', $payload['services'] ), 'Treatment Interest' => $payload['goals'],
			'Timeline' => $payload['timeline'], 'Budget' => $payload['budget'], 'Financing' => $payload['financing'], 'Readiness' => $payload['readiness'],
			'How did you hear' => $payload['hear'], 'Caller Type' => self::caller_type( $payload['intent'] ), 'Support Category' => $payload['supportCategory'],
			'Appointment Date' => $payload['appointmentDate'], 'Existing Patient Issue' => $payload['supportMessage'], 'Organization' => $payload['organization'],
			'Enquiry Type' => $payload['enquiryType'], 'Message' => $payload['message'], 'Priority' => $payload['priority'], 'Follow Up Status' => 'New',
			'Contact Consent' => 'Yes', 'Consent Timestamp' => $payload['submittedAtUtc'], 'Consent Version' => self::CONSENT_VERSION,
			'Marketing Consent' => $payload['marketingConsent'] ? 'Yes' : 'No', 'Submitted At UTC' => $payload['submittedAtUtc'], 'Source' => 'Website', 'Photos' => $payload['photosUrl'],
		);
		$names = array( 'landingUrl' => 'Landing URL', 'referrer' => 'Referrer URL', 'utmSource' => 'UTM Source', 'utmMedium' => 'UTM Medium', 'utmCampaign' => 'UTM Campaign', 'utmContent' => 'UTM Content', 'utmTerm' => 'UTM Term', 'fbclid' => 'FBCLID', 'ttclid' => 'TTCLID', 'entryChannel' => 'Entry Channel', 'entryAccount' => 'Entry Account' );
		foreach ( $names as $key => $label ) $fields[ $label ] = self::clean( $payload['attribution'][ $key ] ?? '', 2048 );
		return self::airtable_create( $fields, '', array( 'Lead Reference', 'Submission Token', 'Caller Name', 'Email', 'Social', 'Photos' ), 'Submission Token' );
	}

	private static function airtable_create( array $fields, string $table_override = '', array $required_fields = array(), string $merge_field = '' ): array {
		$token = self::config( 'AIRTABLE_TOKEN' );
		$base = self::config( 'AIRTABLE_BASE_ID' );
		$table = $table_override ?: self::config( 'AIRTABLE_TABLE_NAME', 'Leads' );
		if ( ! $token || ! $base ) return array( 'ok' => false, 'configured' => false, 'dropped' => array() );
		$working = array_filter( $fields, static fn( $value ) => '' !== $value && null !== $value );
		$dropped = array();
		for ( $attempt = 0; $attempt <= count( $fields ); ++$attempt ) {
			$body = array( 'records' => array( array( 'fields' => $working ) ), 'typecast' => true );
			if ( $merge_field ) $body['performUpsert'] = array( 'fieldsToMergeOn' => array( $merge_field ) );
			$response = wp_remote_request( 'https://api.airtable.com/v0/' . rawurlencode( $base ) . '/' . rawurlencode( $table ), array( 'method' => $merge_field ? 'PATCH' : 'POST', 'timeout' => 8, 'headers' => array( 'Authorization' => 'Bearer ' . $token, 'Content-Type' => 'application/json' ), 'body' => wp_json_encode( $body ) ) );
			if ( is_wp_error( $response ) ) return array( 'ok' => false, 'configured' => true, 'dropped' => $dropped );
			$status = wp_remote_retrieve_response_code( $response );
			$body = wp_remote_retrieve_body( $response );
			if ( $status >= 200 && $status < 300 ) return array( 'ok' => true, 'configured' => true, 'dropped' => $dropped );
			$decoded_error = json_decode( $body, true );
			$error_message = is_array( $decoded_error ) ? (string) ( $decoded_error['error']['message'] ?? $decoded_error['error']['detail'] ?? '' ) : '';
			if ( ! $error_message ) $error_message = $body;
			if ( 422 === $status && preg_match( '/Unknown field name:\s*"([^"]+)"/i', $error_message, $match ) && array_key_exists( $match[1], $working ) ) {
				if ( in_array( $match[1], $required_fields, true ) ) {
					error_log( '[tbt-airtable] Required field is missing from Airtable: ' . $match[1] );
					return array( 'ok' => false, 'configured' => true, 'dropped' => $dropped, 'required_missing' => $match[1] );
				}
				unset( $working[ $match[1] ] );
				$dropped[] = $match[1];
				continue;
			}
			return array( 'ok' => false, 'configured' => true, 'dropped' => $dropped );
		}
		return array( 'ok' => false, 'configured' => true, 'dropped' => $dropped );
	}

	public static function sync_unsaved_airtable(): void {
		if ( ! self::airtable_is_configured() ) return;
		global $wpdb;
		$table = $wpdb->prefix . 'tbt_inquiries';
		$rows = $wpdb->get_results( "SELECT submission_token, payload FROM {$table} WHERE airtable_saved = 0 ORDER BY id ASC LIMIT 20", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		foreach ( $rows as $row ) {
			$payload = json_decode( (string) $row['payload'], true );
			if ( ! is_array( $payload ) ) continue;
			$result = self::send_airtable_inquiry( $payload );
			if ( $result['ok'] ) $wpdb->update( $table, array( 'airtable_saved' => 1 ), array( 'submission_token' => $row['submission_token'] ), array( '%d' ), array( '%s' ) );
		}
		$deposit_table = $wpdb->prefix . 'tbt_deposits';
		$deposits = $wpdb->get_results( "SELECT id, payment_id, lead_reference, name, email, phone, service, amount_cents FROM {$deposit_table} WHERE airtable_saved = 0 ORDER BY id ASC LIMIT 20", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		foreach ( $deposits as $deposit ) {
			$result = self::send_airtable_deposit( $deposit );
			if ( $result['ok'] ) $wpdb->update( $deposit_table, array( 'airtable_saved' => 1 ), array( 'id' => (int) $deposit['id'] ), array( '%d' ), array( '%d' ) );
		}
	}

	private static function send_meta_lead( string $event_id, array $attribution ): bool {
		$token = self::config( 'META_CAPI_ACCESS_TOKEN' );
		if ( ! $token ) return false;
		$user_data = array();
		$ip = self::clean( $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '', 64 );
		if ( $ip ) $user_data['client_ip_address'] = trim( explode( ',', $ip )[0] );
		if ( ! empty( $_SERVER['HTTP_USER_AGENT'] ) ) $user_data['client_user_agent'] = self::clean( $_SERVER['HTTP_USER_AGENT'], 512 );
		if ( ! empty( $_COOKIE['_fbp'] ) ) $user_data['fbp'] = self::clean( $_COOKIE['_fbp'], 255 );
		if ( ! empty( $_COOKIE['_fbc'] ) ) {
			$user_data['fbc'] = self::clean( $_COOKIE['_fbc'], 255 );
		} elseif ( ! empty( $attribution['fbclid'] ) ) {
			$user_data['fbc'] = 'fb.1.' . (string) round( microtime( true ) * 1000 ) . '.' . self::clean( $attribution['fbclid'], 255 );
		}
		if ( ! $user_data ) return false;
		$version = preg_match( '/^v\d+\.\d+$/', self::config( 'META_GRAPH_API_VERSION' ) ) ? self::config( 'META_GRAPH_API_VERSION' ) : 'v24.0';
		$body = array( 'data' => array( array( 'action_source' => 'website', 'event_id' => $event_id, 'event_name' => 'Lead', 'event_source_url' => home_url( '/' ), 'event_time' => time(), 'user_data' => $user_data ) ) );
		$test = self::config( 'META_CAPI_TEST_EVENT_CODE' );
		if ( $test ) $body['test_event_code'] = $test;
		$response = wp_remote_post( 'https://graph.facebook.com/' . $version . '/1571342728047194/events?access_token=' . rawurlencode( $token ), array( 'timeout' => 4, 'headers' => array( 'Content-Type' => 'application/json' ), 'body' => wp_json_encode( $body ) ) );
		return ! is_wp_error( $response ) && wp_remote_retrieve_response_code( $response ) >= 200 && wp_remote_retrieve_response_code( $response ) < 300;
	}

	public static function photo_rewrites(): void {
		add_rewrite_rule( '^api/inquiry/?$', 'index.php?rest_route=/tbt/v1/inquiry', 'top' );
		add_rewrite_rule( '^api/square/config/?$', 'index.php?rest_route=/tbt/v1/square/config', 'top' );
		add_rewrite_rule( '^api/square/pay/?$', 'index.php?rest_route=/tbt/v1/square/pay', 'top' );
		add_rewrite_rule( '^tbt-photos/([a-z0-9]+)/?$', 'index.php?tbt_photo_token=$matches[1]', 'top' );
		add_rewrite_rule( '^tbt-photos/([a-z0-9]+)/([0-9]+)/?$', 'index.php?tbt_photo_token=$matches[1]&tbt_photo_index=$matches[2]', 'top' );
	}

	public static function maybe_flush_photo_rewrites(): void {
		if ( get_option( 'tbt_core_rewrite_version' ) === TBT_CORE_VERSION ) return;
		flush_rewrite_rules( false );
		update_option( 'tbt_core_rewrite_version', TBT_CORE_VERSION );
	}

	public static function photo_query_vars( array $vars ): array {
		$vars[] = 'tbt_photo_token';
		$vars[] = 'tbt_photo_index';
		return $vars;
	}

	public static function serve_photo_request(): void {
		$token = get_query_var( 'tbt_photo_token' );
		if ( ! $token ) return;
		global $wpdb;
		$table = $wpdb->prefix . 'tbt_lead_photos';
		$index = get_query_var( 'tbt_photo_index', '' );
		nocache_headers();
		header( 'X-Robots-Tag: noindex, nofollow', true );
		header( 'X-Content-Type-Options: nosniff', true );
		header( 'Referrer-Policy: no-referrer', true );
		header( 'X-Frame-Options: DENY', true );
		if ( '' !== (string) $index ) {
			$row = $wpdb->get_row( $wpdb->prepare( "SELECT mime, photo_data FROM {$table} WHERE access_token = %s AND photo_index = %d LIMIT 1", $token, (int) $index ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			if ( ! $row ) { status_header( 404 ); exit( 'Not found' ); }
			header( 'Content-Type: ' . $row['mime'] );
			header( 'Content-Disposition: inline' );
			$data = base64_decode( (string) $row['photo_data'], true );
			if ( false === $data ) { status_header( 500 ); exit( 'Photo unavailable' ); }
			echo $data; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			exit;
		}
		$rows = $wpdb->get_results( $wpdb->prepare( "SELECT photo_index FROM {$table} WHERE access_token = %s ORDER BY photo_index", $token ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( ! $rows ) { status_header( 404 ); exit( 'Not found' ); }
		header( 'Content-Type: text/html; charset=utf-8' );
		header( "Content-Security-Policy: default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'", true );
		echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Teeth by Trev — Photos</title><style>body{margin:0;background:#111;color:#eee;font-family:system-ui;padding:24px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}img{width:100%;height:260px;object-fit:cover;border-radius:8px;display:block;background:#222}</style></head><body><div class="g">';
		foreach ( $rows as $row ) {
			$url = home_url( '/tbt-photos/' . rawurlencode( $token ) . '/' . (int) $row['photo_index'] . '/' );
			echo '<a href="' . esc_url( $url ) . '" target="_blank" rel="noopener"><img src="' . esc_url( $url ) . '" loading="lazy" alt="Smile photo"></a>';
		}
		echo '</div></body></html>';
		exit;
	}

	private static function square_environment(): string {
		return 'sandbox' === self::config( 'SQUARE_ENVIRONMENT' ) ? 'sandbox' : 'production';
	}

	private static function square_is_configured(): bool {
		return (bool) ( self::config( 'SQUARE_ACCESS_TOKEN' ) && self::config( 'SQUARE_APPLICATION_ID' ) && self::config( 'SQUARE_LOCATION_ID' ) );
	}

	public static function square_config(): WP_REST_Response {
		if ( ! self::square_is_configured() ) return new WP_REST_Response( array( 'configured' => false ), 200 );
		return new WP_REST_Response( array( 'configured' => true, 'applicationId' => self::config( 'SQUARE_APPLICATION_ID' ), 'locationId' => self::config( 'SQUARE_LOCATION_ID' ), 'environment' => self::square_environment() ), 200 );
	}

	private static function send_airtable_deposit( array $deposit ): array {
		return self::airtable_create(
			array(
				'Name'         => self::clean( $deposit['name'] ?? '', 190 ),
				'Email'        => sanitize_email( self::clean( $deposit['email'] ?? '', 190 ) ),
				'Phone'        => self::clean( $deposit['phone'] ?? '', 60 ),
				'Service'      => self::clean( $deposit['service'] ?? '', 120 ),
				'Amount'       => (int) ( $deposit['amount_cents'] ?? self::DEPOSIT_CENTS ) / 100,
				'Payment ID'   => self::clean( $deposit['payment_id'] ?? '', 64 ),
				'Matched Lead' => self::clean( $deposit['lead_reference'] ?? '', 32 ) ?: 'No match',
			),
			self::config( 'AIRTABLE_DEPOSITS_TABLE', 'Deposits' ),
			array( 'Payment ID', 'Amount', 'Service' ),
			'Payment ID'
		);
	}

	public static function square_pay( WP_REST_Request $request ) {
		if ( ! self::square_is_configured() ) return new WP_Error( 'square_unconfigured', 'Payments are not configured yet.', array( 'status' => 503 ) );
		$data = $request->get_json_params();
		$source = self::clean( $data['sourceId'] ?? '', 1024 );
		$key = self::clean( $data['idempotencyKey'] ?? '', 64 );
		if ( ! $source ) return new WP_Error( 'missing_card', 'Missing card token.', array( 'status' => 400 ) );
		if ( ! $key ) $key = wp_generate_uuid4();
		global $wpdb;
		$table = $wpdb->prefix . 'tbt_deposits';
		$prior = $wpdb->get_row( $wpdb->prepare( "SELECT payment_id, status FROM {$table} WHERE idempotency_key = %s LIMIT 1", $key ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( $prior ) return new WP_REST_Response( array( 'ok' => true, 'paymentId' => $prior['payment_id'], 'status' => $prior['status'], 'idempotent' => true ), 200 );
		$kind = in_array( $data['type'] ?? '', array( 'in-person', 'video' ), true ) ? $data['type'] : '';
		$body = array( 'source_id' => $source, 'idempotency_key' => $key, 'amount_money' => array( 'amount' => self::DEPOSIT_CENTS, 'currency' => 'USD' ), 'location_id' => self::config( 'SQUARE_LOCATION_ID' ), 'autocomplete' => true, 'note' => 'Teeth by Trev — consultation deposit' . ( $kind ? ' (' . $kind . ')' : '' ) );
		$verification = self::clean( $data['verificationToken'] ?? '', 1024 );
		if ( $verification ) $body['verification_token'] = $verification;
		$email = sanitize_email( self::clean( $data['email'] ?? '', 190 ) );
		if ( $email ) $body['buyer_email_address'] = $email;
		$base = 'sandbox' === self::square_environment() ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com';
		$response = wp_remote_post( $base . '/v2/payments', array( 'timeout' => 12, 'headers' => array( 'Square-Version' => self::config( 'SQUARE_VERSION', '2026-05-20' ), 'Authorization' => 'Bearer ' . self::config( 'SQUARE_ACCESS_TOKEN' ), 'Content-Type' => 'application/json' ), 'body' => wp_json_encode( $body ) ) );
		if ( is_wp_error( $response ) ) return new WP_Error( 'square_network', 'Payment service unreachable. Please try again.', array( 'status' => 502 ) );
		$result = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( wp_remote_retrieve_response_code( $response ) < 200 || wp_remote_retrieve_response_code( $response ) >= 300 || empty( $result['payment']['id'] ) ) {
			$error = self::clean( $result['errors'][0]['detail'] ?? 'Your payment was declined.', 300 );
			return new WP_Error( 'payment_failed', $error, array( 'status' => 402 ) );
		}
		$name = self::clean( $data['name'] ?? '', 190 );
		$phone = self::clean( $data['phone'] ?? '', 60 );
		$service = 'in-person' === $kind ? 'In-person consultation' : ( 'video' === $kind ? 'Video consultation' : 'Private consultation' );
		$lead_reference = '';
		if ( $email ) $lead_reference = (string) $wpdb->get_var( $wpdb->prepare( "SELECT lead_reference FROM {$wpdb->prefix}tbt_inquiries WHERE email = %s ORDER BY id DESC LIMIT 1", $email ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( ! $lead_reference && $phone ) $lead_reference = (string) $wpdb->get_var( $wpdb->prepare( "SELECT lead_reference FROM {$wpdb->prefix}tbt_inquiries WHERE phone = %s ORDER BY id DESC LIMIT 1", $phone ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$deposit_saved = $wpdb->insert( $table, array( 'payment_id' => $result['payment']['id'], 'idempotency_key' => $key, 'lead_reference' => $lead_reference, 'name' => $name, 'email' => $email, 'phone' => $phone, 'service' => $service, 'amount_cents' => self::DEPOSIT_CENTS, 'status' => self::clean( $result['payment']['status'] ?? 'COMPLETED', 30 ), 'created_at' => current_time( 'mysql', true ) ), array( '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%s' ) );
		if ( ! $deposit_saved ) error_log( '[tbt-square] Payment succeeded but the local deposit log failed: ' . $result['payment']['id'] );
		$deposit_airtable = self::send_airtable_deposit( array( 'name' => $name, 'email' => $email, 'phone' => $phone, 'service' => $service, 'amount_cents' => self::DEPOSIT_CENTS, 'payment_id' => $result['payment']['id'], 'lead_reference' => $lead_reference ) );
		if ( $deposit_saved && $deposit_airtable['ok'] ) $wpdb->update( $table, array( 'airtable_saved' => 1 ), array( 'idempotency_key' => $key ), array( '%d' ), array( '%s' ) );
		return new WP_REST_Response( array( 'ok' => true, 'paymentId' => $result['payment']['id'], 'status' => $result['payment']['status'] ?? 'COMPLETED' ), 200 );
	}
}
