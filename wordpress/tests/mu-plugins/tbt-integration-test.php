<?php
/**
 * Hermetic upstream doubles for the TBT Core integration verifier.
 *
 * This file is mounted only by `npm run playground:integration` and refuses to
 * run unless the explicit test-mode constant is present.
 */

if ( ! defined( 'ABSPATH' ) || ! defined( 'TBT_INTEGRATION_TEST_MODE' ) || ! TBT_INTEGRATION_TEST_MODE ) {
	return;
}

const TBT_TEST_HTTP_LOG = 'tbt_test_http_log';
const TBT_TEST_HTTP_QUEUES = 'tbt_test_http_queues';

function tbt_test_http_service( string $url ): string {
	if ( str_contains( $url, 'api.airtable.com/' ) ) return 'airtable';
	if ( str_contains( $url, 'connect.squareupsandbox.com/' ) || str_contains( $url, 'connect.squareup.com/' ) ) return 'square';
	if ( str_contains( $url, 'graph.facebook.com/' ) ) return 'meta';
	return '';
}

function tbt_test_pre_http_request( $preempt, array $args, string $url ) {
	$service = tbt_test_http_service( $url );
	if ( ! $service ) return $preempt;

	$decoded = json_decode( (string) ( $args['body'] ?? '' ), true );
	$headers = is_array( $args['headers'] ?? null ) ? $args['headers'] : array();
	$log = get_option( TBT_TEST_HTTP_LOG, array() );
	$log[] = array(
		'service'              => $service,
		'url'                  => preg_replace( '/([?&]access_token=)[^&]+/i', '$1[redacted]', $url ),
		'method'               => strtoupper( (string) ( $args['method'] ?? 'POST' ) ),
		'body'                 => is_array( $decoded ) ? $decoded : (string) ( $args['body'] ?? '' ),
		'authorizationPresent' => ! empty( $headers['Authorization'] ) || ! empty( $headers['authorization'] ),
		'squareVersion'        => (string) ( $headers['Square-Version'] ?? $headers['square-version'] ?? '' ),
	);
	update_option( TBT_TEST_HTTP_LOG, $log, false );

	$queues = get_option( TBT_TEST_HTTP_QUEUES, array() );
	$queue = is_array( $queues[ $service ] ?? null ) ? $queues[ $service ] : array();
	$scenario = $queue ? array_shift( $queue ) : array();
	$queues[ $service ] = $queue;
	update_option( TBT_TEST_HTTP_QUEUES, $queues, false );

	if ( ! empty( $scenario['error'] ) ) {
		return new WP_Error( 'tbt_test_network', (string) $scenario['error'] );
	}
	$status = (int) ( $scenario['status'] ?? ( 'airtable' === $service ? 201 : 200 ) );
	$default_body = array();
	if ( 'airtable' === $service ) $default_body = array( 'records' => array( array( 'id' => 'recIntegrationTest' ) ) );
	if ( 'square' === $service ) $default_body = array( 'payment' => array( 'id' => 'sq-payment-default', 'status' => 'COMPLETED' ) );
	if ( 'meta' === $service ) $default_body = array( 'events_received' => 1 );
	$body = $scenario['body'] ?? $default_body;
	return array(
		'headers'  => array( 'content-type' => 'application/json' ),
		'body'     => is_string( $body ) ? $body : wp_json_encode( $body ),
		'response' => array( 'code' => $status, 'message' => 'TBT integration test response' ),
		'cookies'  => array(),
		'filename' => null,
	);
}
add_filter( 'pre_http_request', 'tbt_test_pre_http_request', 10, 3 );

function tbt_test_reset( WP_REST_Request $request ): WP_REST_Response {
	$data = $request->get_json_params();
	$queues = array();
	foreach ( array( 'airtable', 'square', 'meta' ) as $service ) {
		$queues[ $service ] = is_array( $data[ $service ] ?? null ) ? array_values( $data[ $service ] ) : array();
	}
	update_option( TBT_TEST_HTTP_QUEUES, $queues, false );
	delete_option( TBT_TEST_HTTP_LOG );

	if ( ! empty( $data['purge'] ) ) {
		global $wpdb;
		foreach ( array( 'tbt_lead_photos', 'tbt_deposits', 'tbt_inquiries' ) as $suffix ) {
			$wpdb->query( "DELETE FROM {$wpdb->prefix}{$suffix}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		}
		$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_tbt_rate_%' OR option_name LIKE '_transient_timeout_tbt_rate_%'" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	}

	return new WP_REST_Response( array( 'ok' => true ), 200 );
}

function tbt_test_state(): WP_REST_Response {
	global $wpdb;
	$inquiries = $wpdb->get_results( "SELECT lead_reference, submission_token, intent, email, phone, social, photos_url, payload, airtable_saved, analytics_consent FROM {$wpdb->prefix}tbt_inquiries ORDER BY id", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	foreach ( $inquiries as &$inquiry ) {
		$inquiry['payload'] = json_decode( (string) $inquiry['payload'], true );
		$inquiry['airtable_saved'] = (bool) $inquiry['airtable_saved'];
		$inquiry['analytics_consent'] = (bool) $inquiry['analytics_consent'];
	}
	unset( $inquiry );
	$photos = $wpdb->get_results( "SELECT lead_reference, photo_index, filename, mime, bytes FROM {$wpdb->prefix}tbt_lead_photos ORDER BY id", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	$deposits = $wpdb->get_results( "SELECT payment_id, idempotency_key, lead_reference, name, email, phone, service, amount_cents, status, airtable_saved FROM {$wpdb->prefix}tbt_deposits ORDER BY id", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	foreach ( $deposits as &$deposit ) $deposit['airtable_saved'] = (bool) $deposit['airtable_saved'];
	unset( $deposit );
	return new WP_REST_Response(
		array(
			'logs'      => get_option( TBT_TEST_HTTP_LOG, array() ),
			'inquiries' => $inquiries,
			'photos'    => $photos,
			'deposits'  => $deposits,
			'nextSync'  => (int) wp_next_scheduled( 'tbt_core_sync_airtable' ),
		),
		200
	);
}

function tbt_test_run_sync(): WP_REST_Response {
	do_action( 'tbt_core_sync_airtable' );
	return new WP_REST_Response( array( 'ok' => true ), 200 );
}

function tbt_test_register_routes(): void {
	register_rest_route( 'tbt-test/v1', '/reset', array( 'methods' => WP_REST_Server::CREATABLE, 'callback' => 'tbt_test_reset', 'permission_callback' => '__return_true' ) );
	register_rest_route( 'tbt-test/v1', '/state', array( 'methods' => WP_REST_Server::READABLE, 'callback' => 'tbt_test_state', 'permission_callback' => '__return_true' ) );
	register_rest_route( 'tbt-test/v1', '/run-sync', array( 'methods' => WP_REST_Server::CREATABLE, 'callback' => 'tbt_test_run_sync', 'permission_callback' => '__return_true' ) );
}
add_action( 'rest_api_init', 'tbt_test_register_routes' );
