import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
  photoNames?: string[];
};

export async function POST(req: Request) {
  let data: Payload;
  try {
    data = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  // Mirror the form's required fields.
  if (
    !data.firstName?.trim() ||
    !data.lastName?.trim() ||
    !data.phone?.trim() ||
    !data.email?.trim() ||
    !data.city?.trim() ||
    !data.goals?.trim()
  ) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 422 },
    );
  }

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE_NAME || "Inquiries";

  // Not configured yet (no credentials). Don't break the visitor's flow —
  // accept the submission and log so we know it wasn't persisted.
  if (!token || !baseId) {
    console.warn(
      "[inquiry] Airtable not configured (set AIRTABLE_TOKEN + AIRTABLE_BASE_ID). Submission NOT stored.",
    );
    return NextResponse.json({ ok: true, stored: false });
  }

  const fields: Record<string, string> = {
    "First Name": data.firstName.trim(),
    "Last Name": data.lastName.trim(),
    Phone: data.phone.trim(),
    Email: data.email.trim(),
    Social: data.social?.trim() || "",
    City: data.city.trim(),
    Services: (data.services || []).join(", "),
    Goals: data.goals.trim(),
    Budget: data.budget || "",
    Financing: data.financing || "",
    "Video Consult": data.videoConsult ? "Yes" : "No",
    "How Heard": data.hear || "",
    Photos: (data.photoNames || []).join(", "),
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
        // typecast lets Airtable coerce strings into select/option fields and
        // create missing options, so the table is forgiving about field types.
        body: JSON.stringify({ records: [{ fields }], typecast: true }),
      },
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error("[inquiry] Airtable error", res.status, detail);
      // Still let the visitor finish (and reach the deposit step); surface the
      // failure in server logs rather than losing the UX.
      return NextResponse.json({ ok: true, stored: false });
    }

    return NextResponse.json({ ok: true, stored: true });
  } catch (err) {
    console.error("[inquiry] Airtable request failed", err);
    return NextResponse.json({ ok: true, stored: false });
  }
}
