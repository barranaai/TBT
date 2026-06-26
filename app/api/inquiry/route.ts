import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { dbConfigured, savePhotos } from "../../lib/photos-db";

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
};

function baseUrl(req: Request): string {
  const env = process.env.PUBLIC_BASE_URL;
  if (env) return env.replace(/\/+$/, "");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host") || "";
  return `${proto}://${host}`;
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
  const token = `${slug(fullName)}-${digits}-${crypto.randomBytes(3).toString("hex")}`;

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

  const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const firstName = s(data.firstName);
  const lastName = s(data.lastName);
  const phone = s(data.phone);
  const email = s(data.email);
  const city = s(data.city);
  const goals = s(data.goals);

  if (!firstName || !lastName || !phone || !email || !city || !goals) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 422 },
    );
  }

  const fullName = `${firstName} ${lastName}`.trim();

  // ── Save uploaded photos: hosted MySQL when attached, disk otherwise ────────
  // Failures here never block the lead from being recorded.
  let photosUrl = "";
  let photosWritten = 0;
  const photos = Array.isArray(data.photos) ? data.photos : [];
  if (photos.length) {
    try {
      const stored = await storePhotos(req, photos, fullName, phone);
      photosUrl = stored.photosUrl;
      photosWritten = stored.photosWritten;
    } catch (err) {
      console.error("[inquiry] photo save failed", err);
    }
  }

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE_NAME || "Leads";

  if (!token || !baseId) {
    console.warn(
      "[inquiry] Airtable not configured (AIRTABLE_TOKEN + AIRTABLE_BASE_ID). Submission NOT stored.",
    );
    return NextResponse.json({
      ok: true,
      stored: false,
      photos: photosWritten,
      photosUrl: photosUrl || undefined,
    });
  }

  const fields: Record<string, string> = {
    "Caller Name": fullName,
    "Phone Number": phone,
    Email: email,
    Social: s(data.social),
    City: city,
    Services: (Array.isArray(data.services) ? data.services : []).join(", "),
    "Treatment Interest": goals,
    Budget: s(data.budget),
    Financing: s(data.financing),
    "Video Consult": data.videoConsult ? "Yes" : "No",
    "How did you hear": s(data.hear),
    Source: "Website",
    Photos: photosUrl,
  };

  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: [{ fields }], typecast: true }),
      },
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error("[inquiry] Airtable error", res.status, detail);
      return NextResponse.json({
      ok: true,
      stored: false,
      photos: photosWritten,
      photosUrl: photosUrl || undefined,
    });
    }

    return NextResponse.json({
      ok: true,
      stored: true,
      photos: photosWritten,
      photosUrl: photosUrl || undefined,
    });
  } catch (err) {
    console.error("[inquiry] Airtable request failed", err);
    return NextResponse.json({
      ok: true,
      stored: false,
      photos: photosWritten,
      photosUrl: photosUrl || undefined,
    });
  }
}
