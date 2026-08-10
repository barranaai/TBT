<?php
/**
 * Operational database tables.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class TBT_Core_Schema {
	public static function install(): void {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$charset = $wpdb->get_charset_collate();
		$inquiries = $wpdb->prefix . 'tbt_inquiries';
		$photos = $wpdb->prefix . 'tbt_lead_photos';
		$deposits = $wpdb->prefix . 'tbt_deposits';

		dbDelta( "CREATE TABLE {$inquiries} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			lead_reference varchar(32) NOT NULL,
			submission_token varchar(100) NOT NULL,
			intent varchar(20) NOT NULL,
			name varchar(190) NOT NULL,
			email varchar(190) NOT NULL,
			phone varchar(60) NULL,
			preferred_contact varchar(60) NULL,
			social varchar(190) NOT NULL,
			photos_url varchar(255) NULL,
			payload longtext NOT NULL,
			contact_consent tinyint(1) NOT NULL DEFAULT 0,
			marketing_consent tinyint(1) NOT NULL DEFAULT 0,
			analytics_consent tinyint(1) NOT NULL DEFAULT 0,
			consent_version varchar(60) NULL,
			airtable_saved tinyint(1) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY submission_token (submission_token),
			UNIQUE KEY lead_reference (lead_reference)
		) {$charset};" );

		dbDelta( "CREATE TABLE {$photos} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			lead_reference varchar(32) NOT NULL,
			access_token varchar(100) NOT NULL,
			photo_index smallint unsigned NOT NULL DEFAULT 0,
			filename varchar(190) NULL,
			mime varchar(64) NOT NULL,
			bytes bigint(20) unsigned NOT NULL DEFAULT 0,
			photo_data longtext NOT NULL,
			created_at datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY lead_reference (lead_reference),
			UNIQUE KEY token_index (access_token,photo_index)
		) {$charset};" );

		dbDelta( "CREATE TABLE {$deposits} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			payment_id varchar(64) NOT NULL,
			idempotency_key varchar(64) NOT NULL,
			lead_reference varchar(32) NULL,
			name varchar(190) NULL,
			email varchar(190) NULL,
			phone varchar(60) NULL,
			service varchar(120) NULL,
			amount_cents int unsigned NOT NULL DEFAULT 25000,
			status varchar(30) NOT NULL,
			created_at datetime NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY payment_id (payment_id),
			UNIQUE KEY idempotency_key (idempotency_key)
		) {$charset};" );

		update_option( 'tbt_core_schema_version', TBT_CORE_VERSION );
	}
}
