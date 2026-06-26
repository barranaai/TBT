// Records a paid consultation deposit to the hosted MySQL DB and to an Airtable
// "Deposits" table, and best-effort matches it to an existing lead by email
// (then phone). Everything here runs AFTER Square has already confirmed the
// charge, so failures are logged but never thrown — a payment is never lost
// just because logging hiccuped.

import { dbConfigured, getPool } from "./mysql";
import { createAirtableRecord } from "./airtable";

export type DepositInput = {
  paymentId: string;
  name: string;
  email: string;
  phone: string;
  service: string; // human label, e.g. "Video consultation"
  amountCents: number;
};

let schemaReady: Promise<void> | null = null;

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS deposits (
           id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
           payment_id VARCHAR(64) NULL,
           name VARCHAR(190) NULL,
           email VARCHAR(190) NULL,
           phone VARCHAR(40) NULL,
           service VARCHAR(80) NULL,
           amount_cents INT NOT NULL,
           matched_lead VARCHAR(190) NULL,
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

// ── Best-effort lead match (email first, then phone) ─────────────────────────
async function findMatchingLead(
  email: string,
  phone: string,
): Promise<{ id: string; name: string } | null> {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const leads = process.env.AIRTABLE_TABLE_NAME || "Leads";
  if (!token || !baseId) return null;

  const run = async (formula: string) => {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
      leads,
    )}?maxRecords=2&filterByFormula=${encodeURIComponent(formula)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      records?: { id: string; fields: Record<string, unknown> }[];
    };
    const recs = data.records || [];
    // Only treat a SINGLE hit as a confident match (avoid ambiguous duplicates).
    if (recs.length === 1) {
      const f = recs[0].fields;
      const name =
        (f["Caller Name"] as string) || (f["Name"] as string) || "";
      return { id: recs[0].id, name };
    }
    return null;
  };

  // Escape single quotes (Airtable's literal escape is '') rather than stripping
  // them, so addresses like o'brien@x.com still match.
  const safeEmail = email.toLowerCase().replace(/'/g, "''");
  if (email.includes("@")) {
    const byEmail = await run(`LOWER({Email})='${safeEmail}'`);
    if (byEmail) return byEmail;
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    // Normalise the stored phone (strip spaces/dashes/parens/dots/plus) then
    // look for the last 10 digits inside it.
    const norm =
      "SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE({Phone Number},' ',''),'-',''),'(',''),')',''),'.',''),'+','')";
    const byPhone = await run(`FIND('${last10}', ${norm})>0`);
    if (byPhone) return byPhone;
  }
  return null;
}

async function saveToDb(d: DepositInput, matchedLead: string): Promise<void> {
  if (!dbConfigured()) return;
  await ensureSchema();
  await getPool().execute(
    `INSERT INTO deposits
       (payment_id, name, email, phone, service, amount_cents, matched_lead)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      d.paymentId,
      d.name || null,
      d.email || null,
      d.phone || null,
      d.service || null,
      d.amountCents,
      matchedLead || null,
    ],
  );
}

async function saveToAirtable(d: DepositInput, matchedLead: string): Promise<void> {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_DEPOSITS_TABLE || "Deposits";
  if (!token || !baseId) return;

  const fields = {
    Name: d.name,
    Email: d.email,
    Phone: d.phone,
    Service: d.service,
    Amount: d.amountCents / 100,
    "Payment ID": d.paymentId,
    "Matched Lead": matchedLead || "No match",
  };

  // Resilient create: if the Deposits table is missing a column, that field is
  // dropped and the rest still records (instead of losing the whole row).
  await createAirtableRecord(token, baseId, table, fields);
}

// Orchestrates matching + both writes. Never throws.
export async function recordDeposit(d: DepositInput): Promise<void> {
  let matched: { id: string; name: string } | null = null;
  try {
    matched = await findMatchingLead(d.email, d.phone);
  } catch (err) {
    console.error("[deposits] lead match failed", err);
  }
  const matchedLead = matched?.name || "";

  await saveToDb(d, matchedLead).catch((err) =>
    console.error("[deposits] DB write failed", err),
  );
  await saveToAirtable(d, matchedLead).catch((err) =>
    console.error("[deposits] Airtable write failed", err),
  );
}
