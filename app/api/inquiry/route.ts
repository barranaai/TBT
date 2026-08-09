import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { dbConfigured, savePhotos } from "../../lib/photos-db";
import {
  markInquiryAirtableSaved,
  saveInquiry,
} from "../../lib/inquiries-db";
import { createAirtableRecord } from "../../lib/airtable";
import {
  squareConfigured,
  createDepositPayment,
  DEPOSIT_AMOUNT_CENTS,
} from "../../lib/square";
import { sendMetaLead } from "../../lib/meta-conversions";

export const runtime = "nodejs";

const CONSENT_VERSION = "2026-07-23-v1";
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

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_PHOTOS = 12;
const ALLOWED_HOST = /(^|\.)(teethbytrev\.com|airoapp\.ai|onrender\.com)$/i;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

type Intent = "new" | "existing" | "general";
type PhotoIn = { name?: string; dataUrl?: string };
type AttributionIn = {
  landingUrl?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  ttclid?: string;
  entryChannel?: string;
  entryAccount?: string;
};

type Payload = {
  intent?: string;
  submissionToken?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  preferredContact?: string;
  socialPlatform?: string;
  socialHandle?: string;
  social?: string; // legacy form
  city?: string;
  services?: string[];
  goals?: string;
  timeline?: string;
  budget?: string;
  financing?: string;
  readiness?: string;
  hear?: string;
  supportCategory?: string;
  appointmentDate?: string;
  supportMessage?: string;
  organization?: string;
  enquiryType?: string;
  message?: string;
  contactConsent?: boolean;
  consentVersion?: string;
  marketingConsent?: boolean;
  analyticsConsent?: boolean;
  attribution?: AttributionIn;
  photos?: PhotoIn[]; // retained for legacy clients
  videoConsult?: boolean; // retained for legacy clients
  payment?: {
    sourceId?: string;
    verificationToken?: string;
    idempotencyKey?: string;
  };
};

type DecodedPhoto = {
  idx: number;
  filename: string;
  mime: string;
  bytes: Buffer;
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
  return "https://teethbytrev.com";
}

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "lead"
  );
}

function safeStem(name: string, index: number): string {
  const cleaned = (name || "").replace(/[^a-zA-Z0-9._-]/g, "_");
  const stem = path.basename(cleaned, path.extname(cleaned)).slice(0, 60);
  return stem || `photo-${index + 1}`;
}

function decodePhotos(photos: PhotoIn[]): DecodedPhoto[] {
  const output: DecodedPhoto[] = [];
  photos.forEach((photo, index) => {
    const match = /^data:(image\/[a-z.+-]+);base64,(.+)$/i.exec(
      photo?.dataUrl ?? "",
    );
    if (!match) return;
    const mime = match[1].toLowerCase();
    const bytes = Buffer.from(match[2], "base64");
    if (!bytes.length || bytes.length > MAX_PHOTO_BYTES) return;
    const extension = EXT_BY_MIME[mime] || ".jpg";
    output.push({
      idx: index,
      filename: `${safeStem(photo?.name ?? "", index)}${extension}`,
      mime,
      bytes,
    });
  });
  return output;
}

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
      ? {
          photosUrl: `${baseUrl(req)}/api/photos/${token}`,
          photosWritten: written,
        }
      : { photosUrl: "", photosWritten: 0 };
  }

  const directory = path.join(UPLOAD_DIR, token);
  await fs.mkdir(directory, { recursive: true });
  let written = 0;
  await Promise.all(
    decoded.map(async (photo) => {
      await fs.writeFile(path.join(directory, photo.filename), photo.bytes);
      written += 1;
    }),
  );
  if (written > 0) {
    return {
      photosUrl: `${baseUrl(req)}/api/photos/${token}`,
      photosWritten: written,
    };
  }
  await fs.rm(directory, { recursive: true, force: true }).catch(() => {});
  return { photosUrl: "", photosWritten: 0 };
}

function newLeadReference(date = new Date()): string {
  const datePart = date
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, "");
  const bytes = crypto.randomBytes(5);
  const suffix = Array.from(bytes, (byte) =>
    REFERENCE_ALPHABET.charAt(byte % REFERENCE_ALPHABET.length),
  ).join("");
  return `TBT-${datePart}-${suffix}`;
}

function priorityFor(
  intent: Intent,
  readiness: string,
  timeline: string,
): string {
  if (intent === "existing") return "Existing patient";
  if (intent === "general") return "General enquiry";
  if (
    readiness === "I am ready to schedule a consultation" &&
    (timeline === "As soon as possible" ||
      timeline === "Within 1–3 months")
  ) {
    return "Priority A";
  }
  if (
    readiness === "I am researching for the future" ||
    timeline === "I am researching for the future" ||
    timeline === "Within 6–12 months"
  ) {
    return "Priority C";
  }
  return "Priority B";
}

function callerTypeFor(intent: Intent): string {
  if (intent === "existing") return "Existing patient";
  if (intent === "general") return "General / business";
  return "New consultation";
}

function cookieValue(req: Request, name: string): string {
  const cookie = req.headers.get("cookie") || "";
  for (const part of cookie.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (rawName === name) {
      return decodeURIComponent(rawValue.join("=")).slice(0, 255);
    }
  }
  return "";
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  return (forwarded.split(",")[0] || req.headers.get("x-real-ip") || "")
    .trim()
    .slice(0, 64);
}

export async function POST(req: Request) {
  let data: Payload;
  try {
    data = (await req.json()) as Payload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Bad request" },
      { status: 400 },
    );
  }

  const s = (value: unknown, max = 200) =>
    typeof value === "string" ? value.trim().slice(0, max) : "";

  const modernSubmission = Boolean(data.intent);
  const rawIntent = s(data.intent, 20);
  const intent: Intent =
    rawIntent === "existing" || rawIntent === "general" ? rawIntent : "new";
  const firstName = s(data.firstName, 100);
  const lastName = s(data.lastName, 100);
  const phone = s(data.phone, 40);
  const email = s(data.email, 160);
  const preferredContact = s(data.preferredContact, 40);
  const socialPlatform = s(data.socialPlatform, 40);
  const socialHandle = s(data.socialHandle || data.social, 190);
  const city = s(data.city, 120);
  const goals = s(data.goals, 5000);
  const timeline = s(data.timeline, 60);
  const budget = s(data.budget, 40);
  const financing = s(data.financing, 60);
  const readiness = s(data.readiness, 100);
  const hear = s(data.hear, 120);
  const supportCategory = s(data.supportCategory, 100);
  const appointmentDate = s(data.appointmentDate, 20);
  const supportMessage = s(data.supportMessage, 5000);
  const organization = s(data.organization, 190);
  const enquiryType = s(data.enquiryType, 100);
  const message = s(data.message, 5000);
  const contactConsent = data.contactConsent === true;
  const marketingConsent = data.marketingConsent === true;
  const analyticsConsent = data.analyticsConsent === true;
  const services = (Array.isArray(data.services) ? data.services : [])
    .map((value) => s(value, 60))
    .filter(Boolean);
  const servicesJoined = services.join(", ");

  if (!firstName || !lastName || !email) {
    return NextResponse.json(
      { ok: false, error: "Missing required contact fields" },
      { status: 422 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 422 },
    );
  }

  if (modernSubmission) {
    if (!preferredContact || !contactConsent) {
      return NextResponse.json(
        {
          ok: false,
          error: "Choose a contact method and provide permission to respond.",
        },
        { status: 422 },
      );
    }
    if (preferredContact === "Instagram DM" && !socialHandle) {
      return NextResponse.json(
        { ok: false, error: "Enter your Instagram username." },
        { status: 422 },
      );
    }
    if (intent !== "general" && !phone) {
      return NextResponse.json(
        { ok: false, error: "Enter a mobile number." },
        { status: 422 },
      );
    }
    if (
      intent === "new" &&
      (!city ||
        !services.length ||
        !goals ||
        !timeline ||
        !budget ||
        !financing ||
        !readiness)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Complete the required smile and investment questions.",
        },
        { status: 422 },
      );
    }
    if (
      intent === "existing" &&
      (!city || !supportCategory || !supportMessage)
    ) {
      return NextResponse.json(
        { ok: false, error: "Complete the required support questions." },
        { status: 422 },
      );
    }
    if (intent === "general" && (!enquiryType || !message)) {
      return NextResponse.json(
        { ok: false, error: "Complete the enquiry type and message." },
        { status: 422 },
      );
    }
  } else if (!phone || !city || !goals) {
    // Backward compatibility for visitors with the previous form cached.
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 422 },
    );
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const submittedAtUtc = new Date().toISOString();
  const consentTimestamp = contactConsent ? submittedAtUtc : "";
  const submissionToken =
    s(data.submissionToken, 100) || crypto.randomUUID();
  let leadReference = newLeadReference();
  let internalLeadId: string = crypto.randomUUID();
  const priority = priorityFor(intent, readiness, timeline);

  const attribution = data.attribution || {};
  const landingUrl = s(attribution.landingUrl, 2048);
  const referrerUrl = s(attribution.referrer, 2048);
  const utmSource = s(attribution.utmSource, 160);
  const utmMedium = s(attribution.utmMedium, 160);
  const utmCampaign = s(attribution.utmCampaign, 255);
  const utmContent = s(attribution.utmContent, 255);
  const utmTerm = s(attribution.utmTerm, 255);
  const fbclid = s(attribution.fbclid, 255);
  const ttclid = s(attribution.ttclid, 255);
  const entryChannel = s(attribution.entryChannel, 160);
  const entryAccount = s(attribution.entryAccount, 255);

  // Retained for cached versions of the previous form. The revised intake does
  // not collect payment or clinical photos before the lead is recorded.
  let paid = false;
  let paymentId = "";
  const sourceId = s(data.payment?.sourceId, 1024);
  if (data.videoConsult && sourceId && squareConfigured()) {
    const charge = await createDepositPayment({
      sourceId,
      verificationToken:
        s(data.payment?.verificationToken, 1024) || undefined,
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

  let photosUrl = "";
  let photosWritten = 0;
  const photos = (Array.isArray(data.photos) ? data.photos : []).slice(
    0,
    MAX_PHOTOS,
  );
  if (photos.length) {
    try {
      const storedPhotos = await storePhotos(req, photos, fullName, phone);
      photosUrl = storedPhotos.photosUrl;
      photosWritten = storedPhotos.photosWritten;
    } catch (error) {
      console.error("[inquiry] photo save failed", error);
    }
  }

  let dbSaved = false;
  let dbAirtableSaved = false;
  try {
    const dbResult = await saveInquiry({
      leadReference,
      internalLeadId,
      submissionToken,
      inquiryType: intent,
      name: fullName,
      email,
      phone,
      preferredContact,
      socialPlatform,
      social: socialHandle,
      city,
      services: servicesJoined,
      goals,
      timeline,
      budget,
      financing,
      readiness,
      hear,
      supportCategory,
      appointmentDate,
      supportMessage,
      organization,
      enquiryType,
      message,
      priority,
      contactConsent,
      consentTimestamp,
      consentVersion: modernSubmission ? CONSENT_VERSION : "",
      marketingConsent,
      analyticsConsent,
      submittedAtUtc,
      landingUrl,
      referrerUrl,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      fbclid,
      ttclid,
      entryChannel,
      entryAccount,
      videoConsult: Boolean(data.videoConsult),
      depositPaid: paid,
      paymentId,
      photosUrl,
    });
    dbSaved = dbResult.saved;
    dbAirtableSaved = dbResult.airtableSaved;
    leadReference = dbResult.leadReference || leadReference;
    internalLeadId = dbResult.internalLeadId || internalLeadId;
  } catch (error) {
    console.error("[inquiry] DB inquiry save failed", error);
  }

  const airtableToken = process.env.AIRTABLE_TOKEN;
  const airtableBaseId = process.env.AIRTABLE_BASE_ID;
  const airtableTable = process.env.AIRTABLE_TABLE_NAME || "Leads";
  let airtableStored = dbAirtableSaved;

  if (
    airtableToken &&
    airtableBaseId &&
    (!dbSaved || !dbAirtableSaved)
  ) {
    const fields: Record<string, string | number> = {};
    const add = (
      name: string,
      value: string | number | undefined,
      includeEmpty = false,
    ) => {
      if (includeEmpty || (value !== undefined && value !== "")) {
        fields[name] = value ?? "";
      }
    };

    add("Lead Reference", leadReference);
    add("Internal Lead ID", internalLeadId);
    add("Submission Token", submissionToken);
    add("Caller Name", fullName);
    add("Phone Number", phone, intent === "general");
    add("Email", email);
    add("Preferred Contact", preferredContact);
    add("Social Platform", socialPlatform);
    add(
      "Social",
      socialPlatform && socialHandle
        ? `${socialPlatform}: ${socialHandle}`
        : socialHandle,
    );
    add("City", city);
    add("Services", servicesJoined);
    add("Treatment Interest", goals);
    add("Timeline", timeline);
    add("Budget", budget);
    add("Financing", financing);
    add("Readiness", readiness);
    add("How did you hear", hear);
    add("Caller Type", callerTypeFor(intent));
    add("Support Category", supportCategory);
    add("Appointment Date", appointmentDate);
    add("Existing Patient Issue", supportMessage);
    add("Organization", organization);
    add("Enquiry Type", enquiryType);
    add("Message", message);
    add("Priority", priority);
    add("Follow Up Status", "New");
    add("Contact Consent", contactConsent ? "Yes" : "No");
    add("Consent Timestamp", consentTimestamp);
    add("Consent Version", modernSubmission ? CONSENT_VERSION : "");
    add("Marketing Consent", marketingConsent ? "Yes" : "No");
    add("Submitted At UTC", submittedAtUtc);
    add("Landing URL", landingUrl);
    add("Referrer URL", referrerUrl);
    add("UTM Source", utmSource);
    add("UTM Medium", utmMedium);
    add("UTM Campaign", utmCampaign);
    add("UTM Content", utmContent);
    add("UTM Term", utmTerm);
    add("FBCLID", fbclid);
    add("TTCLID", ttclid);
    add("Entry Channel", entryChannel);
    add("Entry Account", entryAccount);
    add("Source", "Website");
    add("Photos", photosUrl);
    add("Video Consult", data.videoConsult ? "Yes" : "No");
    if (paid) {
      add("Deposit Paid", "Yes");
      add("Payment ID", paymentId);
      add("Deposit Amount", DEPOSIT_AMOUNT_CENTS / 100);
    }

    const result = await createAirtableRecord(
      airtableToken,
      airtableBaseId,
      airtableTable,
      fields,
    );
    airtableStored = result.ok;
    if (result.ok && dbSaved) {
      try {
        await markInquiryAirtableSaved(submissionToken);
      } catch (error) {
        console.error("[inquiry] DB Airtable marker failed", error);
      }
    }
  } else if (!airtableToken || !airtableBaseId) {
    console.warn("[inquiry] Airtable not configured.");
  }

  const recorded = dbSaved || airtableStored;
  if (paid && !recorded) {
    console.error(
      `[inquiry] PAID BUT UNRECORDED — reconcile in Square. paymentId=${paymentId} reference=${leadReference}`,
    );
  }

  if (modernSubmission && !recorded) {
    return NextResponse.json(
      {
        ok: false,
        recorded: false,
        leadReference,
        error:
          "Your enquiry was not saved. Please try again or contact the concierge team directly.",
      },
      { status: 503 },
    );
  }

  let metaServerEventAccepted = false;
  if (modernSubmission && recorded && analyticsConsent) {
    const storedFbc = cookieValue(req, "_fbc");
    const fbc =
      storedFbc || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : "");
    const metaResult = await sendMetaLead({
      clientIp: clientIp(req),
      eventId: submissionToken,
      eventSourceUrl: landingUrl || baseUrl(req),
      fbc,
      fbp: cookieValue(req, "_fbp"),
      userAgent: (req.headers.get("user-agent") || "").slice(0, 512),
    });
    metaServerEventAccepted = metaResult.accepted;
    if (metaResult.configured && !metaResult.accepted) {
      console.warn(
        `[meta-capi] Lead event was not accepted. status=${metaResult.status || "unavailable"}`,
      );
    }
  }

  return NextResponse.json({
    ok: true,
    stored: airtableStored,
    recorded,
    leadReference,
    metaEventId: analyticsConsent ? submissionToken : undefined,
    metaServerEventAccepted,
    paid,
    paymentId: paymentId || undefined,
    photos: photosWritten,
    photosUrl: photosUrl || undefined,
  });
}
