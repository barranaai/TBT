import { NextResponse } from "next/server";
import { squareConfigured, squarePublicConfig } from "../../../lib/square";

export const runtime = "nodejs";
// Always read live env (the prebuilt build must not cache a "not configured"
// answer from build time, before the GoDaddy secrets are attached).
export const dynamic = "force-dynamic";

// Public Square identifiers the browser needs to initialize the Web Payments
// SDK. The access token is never exposed here.
export async function GET() {
  if (!squareConfigured()) {
    return NextResponse.json({ configured: false });
  }
  return NextResponse.json({ configured: true, ...squarePublicConfig() });
}
