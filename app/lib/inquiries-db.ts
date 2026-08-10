// Durable lead log for the GoDaddy-hosted MySQL database.
//
// Airtable remains the team's operational lead tracker. MySQL provides:
// - a server-side source of truth when Airtable is temporarily unavailable;
// - idempotency for browser retries;
// - stable public and internal lead identifiers;
// - a durable record of consent and campaign attribution.

import { dbConfigured, getPool } from "./mysql";

export type InquiryRow = {
  leadReference: string;
  internalLeadId: string;
  submissionToken: string;
  inquiryType: "new" | "existing" | "general";
  name: string;
  email: string;
  phone: string;
  preferredContact: string;
  socialPlatform: string;
  social: string;
  city: string;
  services: string;
  goals: string;
  timeline: string;
  budget: string;
  financing: string;
  readiness: string;
  hear: string;
  supportCategory: string;
  appointmentDate: string;
  supportMessage: string;
  organization: string;
  enquiryType: string;
  message: string;
  priority: string;
  contactConsent: boolean;
  consentTimestamp: string;
  consentVersion: string;
  smsConsent: boolean;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  submittedAtUtc: string;
  landingUrl: string;
  referrerUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  fbclid: string;
  ttclid: string;
  entryChannel: string;
  entryAccount: string;
  videoConsult: boolean;
  depositPaid: boolean;
  paymentId: string;
  photosUrl: string;
};

export type InquirySaveResult = {
  saved: boolean;
  created: boolean;
  leadReference: string;
  internalLeadId: string;
  airtableSaved: boolean;
};

let schemaReady: Promise<void> | null = null;

const legacyColumns: Record<string, string> = {
  lead_reference: "lead_reference VARCHAR(32) NULL",
  internal_lead_id: "internal_lead_id CHAR(36) NULL",
  submission_token: "submission_token VARCHAR(100) NULL",
  inquiry_type: "inquiry_type VARCHAR(24) NOT NULL DEFAULT 'new'",
  preferred_contact: "preferred_contact VARCHAR(40) NULL",
  social_platform: "social_platform VARCHAR(40) NULL",
  timeline: "timeline VARCHAR(60) NULL",
  readiness: "readiness VARCHAR(100) NULL",
  support_category: "support_category VARCHAR(100) NULL",
  appointment_date: "appointment_date VARCHAR(20) NULL",
  support_message: "support_message TEXT NULL",
  organization: "organization VARCHAR(190) NULL",
  enquiry_type: "enquiry_type VARCHAR(100) NULL",
  message: "message TEXT NULL",
  priority: "priority VARCHAR(40) NULL",
  contact_consent: "contact_consent TINYINT(1) NOT NULL DEFAULT 0",
  consent_timestamp: "consent_timestamp DATETIME(3) NULL",
  consent_version: "consent_version VARCHAR(60) NULL",
  sms_consent: "sms_consent TINYINT(1) NOT NULL DEFAULT 0",
  marketing_consent: "marketing_consent TINYINT(1) NOT NULL DEFAULT 0",
  analytics_consent: "analytics_consent TINYINT(1) NOT NULL DEFAULT 0",
  submitted_at_utc: "submitted_at_utc DATETIME(3) NULL",
  landing_url: "landing_url TEXT NULL",
  referrer_url: "referrer_url TEXT NULL",
  utm_source: "utm_source VARCHAR(160) NULL",
  utm_medium: "utm_medium VARCHAR(160) NULL",
  utm_campaign: "utm_campaign VARCHAR(255) NULL",
  utm_content: "utm_content VARCHAR(255) NULL",
  utm_term: "utm_term VARCHAR(255) NULL",
  fbclid: "fbclid VARCHAR(255) NULL",
  ttclid: "ttclid VARCHAR(255) NULL",
  entry_channel: "entry_channel VARCHAR(160) NULL",
  entry_account: "entry_account VARCHAR(255) NULL",
  airtable_saved: "airtable_saved TINYINT(1) NOT NULL DEFAULT 0",
};

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const pool = getPool();
      await pool.query(
        `CREATE TABLE IF NOT EXISTS inquiries (
           id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
           lead_reference VARCHAR(32) NULL,
           internal_lead_id CHAR(36) NULL,
           submission_token VARCHAR(100) NULL,
           inquiry_type VARCHAR(24) NOT NULL DEFAULT 'new',
           name VARCHAR(190) NULL,
           email VARCHAR(190) NULL,
           phone VARCHAR(40) NULL,
           preferred_contact VARCHAR(40) NULL,
           social_platform VARCHAR(40) NULL,
           social VARCHAR(190) NULL,
           city VARCHAR(120) NULL,
           services VARCHAR(255) NULL,
           goals TEXT NULL,
           timeline VARCHAR(60) NULL,
           budget VARCHAR(40) NULL,
           financing VARCHAR(60) NULL,
           readiness VARCHAR(100) NULL,
           hear VARCHAR(120) NULL,
           support_category VARCHAR(100) NULL,
           appointment_date VARCHAR(20) NULL,
           support_message TEXT NULL,
           organization VARCHAR(190) NULL,
           enquiry_type VARCHAR(100) NULL,
           message TEXT NULL,
           priority VARCHAR(40) NULL,
           contact_consent TINYINT(1) NOT NULL DEFAULT 0,
           consent_timestamp DATETIME(3) NULL,
           consent_version VARCHAR(60) NULL,
           sms_consent TINYINT(1) NOT NULL DEFAULT 0,
           marketing_consent TINYINT(1) NOT NULL DEFAULT 0,
           analytics_consent TINYINT(1) NOT NULL DEFAULT 0,
           submitted_at_utc DATETIME(3) NULL,
           landing_url TEXT NULL,
           referrer_url TEXT NULL,
           utm_source VARCHAR(160) NULL,
           utm_medium VARCHAR(160) NULL,
           utm_campaign VARCHAR(255) NULL,
           utm_content VARCHAR(255) NULL,
           utm_term VARCHAR(255) NULL,
           fbclid VARCHAR(255) NULL,
           ttclid VARCHAR(255) NULL,
           entry_channel VARCHAR(160) NULL,
           entry_account VARCHAR(255) NULL,
           video_consult TINYINT(1) NOT NULL DEFAULT 0,
           deposit_paid TINYINT(1) NOT NULL DEFAULT 0,
           payment_id VARCHAR(64) NULL,
           photos_url VARCHAR(255) NULL,
           airtable_saved TINYINT(1) NOT NULL DEFAULT 0,
           created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
           INDEX idx_email (email),
           UNIQUE INDEX uq_inquiries_lead_reference (lead_reference),
           UNIQUE INDEX uq_inquiries_submission_token (submission_token)
         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      );

      // The production table predates the expanded lead model. Add only the
      // columns that are missing so existing records remain untouched.
      const [columnRows] = await pool.query("SHOW COLUMNS FROM inquiries");
      const existingColumns = new Set(
        (columnRows as Array<{ Field: string }>).map((row) => row.Field),
      );
      for (const [name, definition] of Object.entries(legacyColumns)) {
        if (!existingColumns.has(name)) {
          await pool.query(`ALTER TABLE inquiries ADD COLUMN ${definition}`);
        }
      }
      // The original form stored only "Yes"/"No"; the revised copy uses full
      // human-readable choices, so widen the existing legacy column safely.
      await pool.query(
        "ALTER TABLE inquiries MODIFY COLUMN financing VARCHAR(60) NULL",
      );

      const [indexRows] = await pool.query("SHOW INDEX FROM inquiries");
      const existingIndexes = new Set(
        (indexRows as Array<{ Key_name: string }>).map((row) => row.Key_name),
      );
      if (!existingIndexes.has("uq_inquiries_lead_reference")) {
        await pool.query(
          "ALTER TABLE inquiries ADD UNIQUE INDEX uq_inquiries_lead_reference (lead_reference)",
        );
      }
      if (!existingIndexes.has("uq_inquiries_submission_token")) {
        await pool.query(
          "ALTER TABLE inquiries ADD UNIQUE INDEX uq_inquiries_submission_token (submission_token)",
        );
      }
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

function mysqlDateTime(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 23).replace("T", " ");
}

async function findBySubmissionToken(
  submissionToken: string,
): Promise<InquirySaveResult | null> {
  const [rows] = await getPool().execute(
    `SELECT lead_reference, internal_lead_id, airtable_saved
       FROM inquiries
      WHERE submission_token = ?
      LIMIT 1`,
    [submissionToken],
  );
  const match = (
    rows as Array<{
      lead_reference: string;
      internal_lead_id: string;
      airtable_saved: number;
    }>
  )[0];
  if (!match) return null;
  return {
    saved: true,
    created: false,
    leadReference: match.lead_reference,
    internalLeadId: match.internal_lead_id,
    airtableSaved: Boolean(match.airtable_saved),
  };
}

export async function saveInquiry(
  row: InquiryRow,
): Promise<InquirySaveResult> {
  if (!dbConfigured()) {
    return {
      saved: false,
      created: false,
      leadReference: row.leadReference,
      internalLeadId: row.internalLeadId,
      airtableSaved: false,
    };
  }

  await ensureSchema();
  const existing = await findBySubmissionToken(row.submissionToken);
  if (existing) return existing;

  try {
    await getPool().execute(
      `INSERT INTO inquiries
         (lead_reference, internal_lead_id, submission_token, inquiry_type,
          name, email, phone, preferred_contact, social_platform, social, city,
          services, goals, timeline, budget, financing, readiness, hear,
          support_category, appointment_date, support_message, organization,
          enquiry_type, message, priority, contact_consent, consent_timestamp,
          consent_version, sms_consent, marketing_consent, analytics_consent,
          submitted_at_utc, landing_url, referrer_url, utm_source, utm_medium,
          utm_campaign, utm_content, utm_term, fbclid, ttclid, entry_channel,
          entry_account, video_consult, deposit_paid, payment_id, photos_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
               ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
               ?, ?, ?, ?)`,
      [
        row.leadReference,
        row.internalLeadId,
        row.submissionToken,
        row.inquiryType,
        row.name || null,
        row.email || null,
        row.phone || null,
        row.preferredContact || null,
        row.socialPlatform || null,
        row.social || null,
        row.city || null,
        row.services || null,
        row.goals || null,
        row.timeline || null,
        row.budget || null,
        row.financing || null,
        row.readiness || null,
        row.hear || null,
        row.supportCategory || null,
        row.appointmentDate || null,
        row.supportMessage || null,
        row.organization || null,
        row.enquiryType || null,
        row.message || null,
        row.priority || null,
        row.contactConsent ? 1 : 0,
        mysqlDateTime(row.consentTimestamp),
        row.consentVersion || null,
        row.smsConsent ? 1 : 0,
        row.marketingConsent ? 1 : 0,
        row.analyticsConsent ? 1 : 0,
        mysqlDateTime(row.submittedAtUtc),
        row.landingUrl || null,
        row.referrerUrl || null,
        row.utmSource || null,
        row.utmMedium || null,
        row.utmCampaign || null,
        row.utmContent || null,
        row.utmTerm || null,
        row.fbclid || null,
        row.ttclid || null,
        row.entryChannel || null,
        row.entryAccount || null,
        row.videoConsult ? 1 : 0,
        row.depositPaid ? 1 : 0,
        row.paymentId || null,
        row.photosUrl || null,
      ],
    );
    return {
      saved: true,
      created: true,
      leadReference: row.leadReference,
      internalLeadId: row.internalLeadId,
      airtableSaved: false,
    };
  } catch (error) {
    // A near-simultaneous retry can race the pre-insert lookup. The unique
    // submission-token index resolves it; return the already-created record.
    const raced = await findBySubmissionToken(row.submissionToken);
    if (raced) return raced;
    throw error;
  }
}

export async function markInquiryAirtableSaved(
  submissionToken: string,
): Promise<void> {
  if (!dbConfigured()) return;
  await ensureSchema();
  await getPool().execute(
    "UPDATE inquiries SET airtable_saved = 1 WHERE submission_token = ?",
    [submissionToken],
  );
}
