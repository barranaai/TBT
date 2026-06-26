// Saves each contact-form inquiry to the hosted MySQL DB (alongside Airtable).
// Best-effort: when the DB isn't configured (local/Render) this is a no-op, and
// callers never block on it.

import { dbConfigured, getPool } from "./mysql";

export type InquiryRow = {
  name: string;
  email: string;
  phone: string;
  social: string;
  city: string;
  services: string;
  goals: string;
  budget: string;
  financing: string;
  videoConsult: boolean;
  hear: string;
  depositPaid: boolean;
  paymentId: string;
  photosUrl: string;
};

let schemaReady: Promise<void> | null = null;

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS inquiries (
           id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
           name VARCHAR(190) NULL,
           email VARCHAR(190) NULL,
           phone VARCHAR(40) NULL,
           social VARCHAR(190) NULL,
           city VARCHAR(120) NULL,
           services VARCHAR(255) NULL,
           goals TEXT NULL,
           budget VARCHAR(40) NULL,
           financing VARCHAR(20) NULL,
           video_consult TINYINT(1) NOT NULL DEFAULT 0,
           hear VARCHAR(120) NULL,
           deposit_paid TINYINT(1) NOT NULL DEFAULT 0,
           payment_id VARCHAR(64) NULL,
           photos_url VARCHAR(255) NULL,
           created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
           INDEX idx_email (email)
         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      )
      .then(() => undefined)
      .catch((e) => {
        schemaReady = null;
        throw e;
      });
  }
  return schemaReady;
}

// Returns true only when the row was actually written (false when no DB is
// attached), so callers can tell a real save from a skipped no-op.
export async function saveInquiry(r: InquiryRow): Promise<boolean> {
  if (!dbConfigured()) return false;
  await ensureSchema();
  await getPool().execute(
    `INSERT INTO inquiries
       (name, email, phone, social, city, services, goals, budget, financing,
        video_consult, hear, deposit_paid, payment_id, photos_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      r.name || null,
      r.email || null,
      r.phone || null,
      r.social || null,
      r.city || null,
      r.services || null,
      r.goals || null,
      r.budget || null,
      r.financing || null,
      r.videoConsult ? 1 : 0,
      r.hear || null,
      r.depositPaid ? 1 : 0,
      r.paymentId || null,
      r.photosUrl || null,
    ],
  );
  return true;
}
