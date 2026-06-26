import { NextResponse } from "next/server";
import {
  squareConfigured,
  createDepositPayment,
  DEPOSIT_AMOUNT_CENTS,
} from "../../../lib/square";
import { recordDeposit } from "../../../lib/deposits";

export const runtime = "nodejs";

type Body = {
  sourceId?: string;
  verificationToken?: string;
  idempotencyKey?: string;
  type?: string;
  name?: string;
  email?: string;
  phone?: string;
};

const str = (v: unknown, max = 190) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(req: Request) {
  if (!squareConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Payments are not configured yet." },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const sourceId = str(body.sourceId, 1024);
  if (!sourceId) {
    return NextResponse.json(
      { ok: false, error: "Missing card token." },
      { status: 400 },
    );
  }

  const kind =
    body.type === "in-person" ? "in-person" : body.type === "video" ? "video" : "";
  const serviceLabel =
    kind === "in-person"
      ? "In-person consultation"
      : kind === "video"
        ? "Video consultation"
        : "Private consultation";
  const note = `Teeth by Trev — consultation deposit${kind ? ` (${kind})` : ""}`;

  const name = str(body.name);
  const phone = str(body.phone, 40);
  const email = body.email && body.email.includes("@") ? str(body.email, 120) : "";

  const result = await createDepositPayment({
    sourceId,
    verificationToken: str(body.verificationToken, 1024) || undefined,
    idempotencyKey: str(body.idempotencyKey, 64) || undefined,
    note,
    buyerEmail: email || undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 402 });
  }

  // Charge succeeded — log the deposit (DB + Airtable + lead match). This is
  // best-effort and never affects the success the customer sees.
  try {
    await recordDeposit({
      paymentId: result.paymentId,
      name,
      email,
      phone,
      service: serviceLabel,
      amountCents: DEPOSIT_AMOUNT_CENTS,
    });
  } catch (err) {
    console.error("[square/pay] recordDeposit failed", err);
  }

  return NextResponse.json({ ok: true, paymentId: result.paymentId, status: result.status });
}
