// Server-side Square helper for the $250 consultation deposit.
//
// Config comes entirely from runtime env (so it works with the prebuilt-zip
// GoDaddy deploy — nothing is baked at build time):
//   SQUARE_ACCESS_TOKEN   (secret, server only)
//   SQUARE_APPLICATION_ID (public — sent to the browser to init the SDK)
//   SQUARE_LOCATION_ID    (public)
//   SQUARE_ENVIRONMENT    ("production" | "sandbox", default production)
//   SQUARE_VERSION        (optional override of the API version)

import crypto from "crypto";

// Deposit amount is fixed here on the server so the client can never change it.
export const DEPOSIT_AMOUNT_CENTS = 25000; // $250.00
export const DEPOSIT_CURRENCY = "USD";

const SQUARE_VERSION = process.env.SQUARE_VERSION || "2026-05-20";

export type SquareEnv = "production" | "sandbox";

export function squareEnvironment(): SquareEnv {
  return process.env.SQUARE_ENVIRONMENT === "sandbox" ? "sandbox" : "production";
}

// Client-safe identifiers only — never the access token.
export function squarePublicConfig() {
  return {
    applicationId: process.env.SQUARE_APPLICATION_ID || "",
    locationId: process.env.SQUARE_LOCATION_ID || "",
    environment: squareEnvironment(),
  };
}

export function squareConfigured(): boolean {
  return Boolean(
    process.env.SQUARE_ACCESS_TOKEN &&
      process.env.SQUARE_APPLICATION_ID &&
      process.env.SQUARE_LOCATION_ID,
  );
}

function apiBase(): string {
  return squareEnvironment() === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";
}

type CreatePaymentInput = {
  sourceId: string;
  verificationToken?: string;
  note?: string;
  buyerEmail?: string;
  // Stable per-attempt key so an honest retry of the SAME logical payment is
  // collapsed to one charge by Square — even though re-tokenizing mints a new
  // single-use sourceId. The client supplies this; we only mint a random one as
  // a last resort.
  idempotencyKey?: string;
};

type CreatePaymentResult =
  | { ok: true; paymentId: string; status: string }
  | { ok: false; error: string };

// Charge the fixed deposit via Square's Payments API (createPayment). Square
// dedupes on idempotency_key: a retry with the same key returns the original
// payment instead of charging again.
export async function createDepositPayment(
  input: CreatePaymentInput,
): Promise<CreatePaymentResult> {
  const token = process.env.SQUARE_ACCESS_TOKEN!;
  const body: Record<string, unknown> = {
    source_id: input.sourceId,
    idempotency_key: input.idempotencyKey || crypto.randomUUID(),
    amount_money: { amount: DEPOSIT_AMOUNT_CENTS, currency: DEPOSIT_CURRENCY },
    location_id: process.env.SQUARE_LOCATION_ID,
    autocomplete: true,
  };
  if (input.verificationToken) body.verification_token = input.verificationToken;
  if (input.note) body.note = input.note;
  if (input.buyerEmail) body.buyer_email_address = input.buyerEmail;

  let res: Response;
  try {
    res = await fetch(`${apiBase()}/v2/payments`, {
      method: "POST",
      headers: {
        "Square-Version": SQUARE_VERSION,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("[square] network error", err);
    return { ok: false, error: "Payment service unreachable. Please try again." };
  }

  const data = (await res.json().catch(() => ({}))) as {
    payment?: { id: string; status: string };
    errors?: { detail?: string; code?: string }[];
  };

  if (!res.ok || !data.payment) {
    const detail = data.errors?.[0]?.detail || "Your payment was declined.";
    console.error("[square] createPayment failed", res.status, data.errors);
    return { ok: false, error: detail };
  }

  return { ok: true, paymentId: data.payment.id, status: data.payment.status };
}
