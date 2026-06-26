import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { dbConfigured, savePhotos } from "../../lib/photos-db";
import { saveInquiry } from "../../lib/inquiries-db";
import { createAirtableRecord } from "../../lib/airtable";
import {
  squareConfigured,
  createDepositPayment,
  DEPOSIT_AMOUNT_CENTS,
} from "../../lib/square";

export const runtime = "nodejs";

// Where uploaded photos live. On Render, point this at a persistent disk mount
// (e.g. UPLOAD_DIR=/var/data/uploads). Locally it falls back to ./.uploads.
const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), ".uploads");

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/heic": ".heic",
};

const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // safety cap per photo
const MAX_PHOTOS = 12; // cap the array so one request can't buffer huge payloads

// Trusted hosts for building the stored gallery URL when PUBLIC_BASE_URL is
// unset — stops Host-header injection from planting an attacker URL in a
// staff-facing record.
const ALLOWED_HOST = /(^|\.)(teethbytrev\.com|airoapp\.ai|onrender\.com)$/i;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type PhotoIn = { name?: string; dataUrl?: string };
type Payload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  social?: string;
  city?: string;
  services?: string[];
  goals?: string;
  budget?: string;
  financing?: string;
  videoConsult?: boolean;
  hear?: string;
  photos?: PhotoIn[];
  payment?: { sourceId?: string; verificationToken?: string; idempotencyKey?: string };
};

function baseUrl(req: Request): string {
  const env = process.env.PUBLIC_BASE_URL;
  if (env) return env.replace(/\/+$/, "");
  const host = req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const hostNoPort = host.replace(/:\d+$/, "");
  if (host && (ALLOWED_HOST.test(hostNoPort) || hostNoPort === "localhost")) {
    return `${proto}://${host}`;
  }
  // Unknown/forged host — fall back to the known production origin.
  return "https://teethbytrev.com";
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "lead"
  );
}

function safeStem(name: string, i: number): string {
  const cleaned = (name || "").replace(/[^a-zA-Z0-9._-]/g, "_");
  const stem = path.basename(cleaned, path.extname(cleaned)).slice(0, 60);
  return stem || `photo-${i + 1}`;
}

type DecodedPhoto = { idx: number; filename: string; mime: string; bytes: Buffer };

// Turn the incoming base64 data URLs into validated buffers (drops anything
// malformed, empty, or over the size cap).
function decodePhotos(photos: PhotoIn[]): DecodedPhoto[] {
  const out: DecodedPhoto[] = [];
  photos.forEach((p, i) => {
    const m = /^data:(image\/[a-z.+-]+);base64,(.+)$/i.exec(p?.dataUrl ?? "");
    if (!m) return;
    const mime = m[1].toLowerCase();
    const buf = Buffer.from(m[2], "base64");
    if (!buf.length || buf.length > MAX_PHOTO_BYTES) return;
    const ext = EXT_BY_MIME[mime] || ".jpg";
    out.push({ idx: i, filename: `${safeStem(p?.name ?? "", i)}${ext}`, mime, bytes: buf });
  });
  return out;
}

// Persist photos and return the gallery URL stored in Airtable. Uses the hosted
// MySQL DB when one is attached (GoDaddy — survives redeploys), otherwise a
// per-lead folder on disk (Render persistent disk / local dev). The token isn't
// guessable, so the gallery URL stays effectively private.
async function storePhotos(
  req: Request,
  photos: PhotoIn[],
  fullName: string,
  phone: string,
): Promise<{ photosUrl: string; photosWritten: number }> {
  const decoded = decodePhotos(photos);
  if (!decoded.length) return { photosUrl: "", photosWritten: 0 };

  const digits = phone.replace(/\D/g, "") || "nophone";
  const token = `${slug(fullName)}-${digits}-${crypto.randomBytes(8).toString("hex")}`;

  if (dbConfigured()) {
    const written = await savePhotos(token, decoded);
    return written > 0
      ? { photosUrl: `${baseUrl(req)}/api/photos/${token}`, photosWritten: written }
      : { photosUrl: "", photosWritten: 0 };
  }

  const dir = path.join(UPLOAD_DIR, token);
  await fs.mkdir(dir, { recursive: true });
  let written = 0;
  await Promise.all(
    decoded.map(async (d) => {
      await fs.writeFile(path.join(dir, d.filename), d.bytes);
      written += 1;
    }),
  );
  if (written > 0) {
    return { photosUrl: `${baseUrl(req)}/api/photos/${token}`, photosWritten: written };
  }
  await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  return { photosUrl: "", photosWritten: 0 };
}

export async function POST(req: Request) {
  let data: Payload;
  try {
    data = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  // Trim AND cap every text field (narrow DB columns + avoid abuse).
  const s = (v: unknown, max = 200) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";

  const firstName = s(data.firstName, 100);
  const lastName = s(data.lastName, 100);
  const phone = s(data.phone, 40);
  const email = s(data.email, 160);
  const city = s(data.city, 120);
  const goals = s(data.goals, 5000);

  if (!firstName || !lastName || !phone || !email || !city || !goals) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 422 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 422 },
    );
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const servicesJoined = (Array.isArray(data.services) ? data.services : [])
    .map((x) => s(x, 60))
    .filter(Boolean)
    .join(", ");

  // ── Optional $250 consultation deposit (Square) ─────────────────────────────
  // Charge BEFORE saving anything: a declined card returns an error and the
  // visitor can fix it. A stable idempotency key (from the client) makes an
  // honest retry idempotent at Square. If Square isn't configured we skip the
  // charge (the lead still saves; the success screen offers the /reserve link).
  let paid = false;
  let paymentId = "";
  const sourceId = s(data.payment?.sourceId, 1024);
  if (data.videoConsult && sourceId && squareConfigured()) {
    const charge = await createDepositPayment({
      sourceId,
      verificationToken: s(data.payment?.verificationToken, 1024) || undefined,
      idempotencyKey: s(data.payment?.idempotencyKey, 64) || undefined,
      note: "Teeth by Trev — consultation deposit (video, inquiry form)",
      buyerEmail: email,
    });
    if (!charge.ok) {
      return NextResponse.json(
        { ok: false, paymentFailed: true, error: charge.error },
        { status: 402 },
      );
    }
    paid = true;
    paymentId = charge.paymentId;
  }

  // ── Save uploaded photos: hosted MySQL when attached, disk otherwise ────────
  let photosUrl = "";
  let photosWritten = 0;
  const photos = (Array.isArray(data.photos) ? data.photos : []).slice(0, MAX_PHOTOS);
  if (photos.length) {
    try {
      const stored = await storePhotos(req, photos, fullName, phone);
      photosUrl = stored.photosUrl;
      photosWritten = stored.photosWritten;
    } catch (err) {
      console.error("[inquiry] photo save failed", err);
    }
  }

  // ── Airtable Leads (with deposit confirmation when paid) ────────────────────
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE_NAME || "Leads";
  let stored = false;

  if (token && baseId) {
    const fields: Record<string, string | number> = {
      "Caller Name": fullName,
      "Phone Number": phone,
      Email: email,
      Social: s(data.social),
      City: city,
      Services: servicesJoined,
      "Treatment Interest": goals,
      Budget: s(data.budget, 40),
      Financing: s(data.financing, 40),
      "Video Consult": data.videoConsult ? "Yes" : "No",
      "How did you hear": s(data.hear, 120),
      Source: "Website",
      Photos: photosUrl,
    };
    if (paid) {
      fields["Deposit Paid"] = "Yes";
      fields["Payment ID"] = paymentId;
      fields["Deposit Amount"] = DEPOSIT_AMOUNT_CENTS / 100;
    }
    // createAirtableRecord drops any column the table doesn't have (so a missing
    // "Deposit Paid"/base column never loses the lead) and never re-creates on a
    // transient error (no duplicates).
    const result = await createAirtableRecord(token, baseId, table, fields);
    stored = result.ok;
  } else {
    console.warn("[inquiry] Airtable not configured — submission not stored there.");
  }

  // ── Hosted MySQL inquiries log ──────────────────────────────────────────────
  let dbSaved = false;
  try {
    dbSaved = await saveInquiry({
      name: fullName,
      email,
      phone,
      social: s(data.social),
      city,
      services: servicesJoined,
      goals,
      budget: s(data.budget, 40),
      financing: s(data.financing, 40),
      videoConsult: !!data.videoConsult,
      hear: s(data.hear, 120),
      depositPaid: paid,
      paymentId,
      photosUrl,
    });
  } catch (err) {
    console.error("[inquiry] DB inquiry save failed", err);
  }

  // If we charged but couldn't durably record the lead anywhere staff looks,
  // shout loudly with the paymentId so it can be reconciled/refunded by hand.
  const recorded = stored || dbSaved;
  if (paid && !recorded) {
    console.error(
      `[inquiry] PAID BUT UNRECORDED — reconcile in Square. paymentId=${paymentId} name="${fullName}" email=${email} phone=${phone}`,
    );
  }

  return NextResponse.json({
    ok: true,
    stored,
    recorded,
    paid,
    paymentId: paymentId || undefined,
    photos: photosWritten,
    photosUrl: photosUrl || undefined,
  });
}
