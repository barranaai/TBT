import { NextResponse } from "next/server";
import { squareConfigured, createDepositPayment } from "../../../lib/square";

export const runtime = "nodejs";

type Body = {
  sourceId?: string;
  verificationToken?: string;
  type?: string;
  email?: string;
};

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

  const sourceId = typeof body.sourceId === "string" ? body.sourceId : "";
  if (!sourceId) {
    return NextResponse.json(
      { ok: false, error: "Missing card token." },
      { status: 400 },
    );
  }

  const kind =
    body.type === "in-person" ? "in-person" : body.type === "video" ? "video" : "";
  const note = `Teeth by Trev — consultation deposit${kind ? ` (${kind})` : ""}`;
  const email =
    typeof body.email === "string" && body.email.includes("@")
      ? body.email.trim().slice(0, 120)
      : undefined;

  const result = await createDepositPayment({
    sourceId,
    verificationToken:
      typeof body.verificationToken === "string" ? body.verificationToken : undefined,
    note,
    buyerEmail: email,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 402 });
  }
  return NextResponse.json({ ok: true, paymentId: result.paymentId, status: result.status });
}
