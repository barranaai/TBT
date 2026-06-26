"use client";

import { useState } from "react";
import { useSquareCard } from "./useSquareCard";

const fieldClass =
  "mt-2 w-full border border-onyx/20 bg-transparent px-3 py-3 text-sm normal-case tracking-normal text-onyx outline-none placeholder:text-onyx/35 focus:border-gold";
const labelClass =
  "block text-[0.7rem] uppercase tracking-[0.18em] text-onyx/55";

export default function SquareDeposit({
  type,
}: {
  type?: "in-person" | "video";
}) {
  const card = useSquareCard(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  const pay = async () => {
    if (paying || card.status !== "ready") return;
    setPaying(true);
    const tok = await card.tokenize({ amount: "250.00", email });
    if (!tok) {
      setPaying(false);
      return; // card.error is set by the hook
    }
    try {
      const res = await fetch("/api/square/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: tok.sourceId,
          verificationToken: tok.verificationToken,
          idempotencyKey: tok.idempotencyKey,
          type,
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        card.setError(data.error || "Payment could not be completed.");
        setPaying(false);
        return;
      }
      setSuccess(true);
    } catch {
      // A network error after sending is ambiguous — the charge may have gone
      // through. Keep the button disabled so a blind retry can't double-charge.
      card.setError(
        "We couldn't confirm your payment. Please contact us before trying again so you're not charged twice.",
      );
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-md border border-gold/30 bg-ivory px-8 py-14 text-center text-onyx">
        <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-serif text-3xl font-light">Deposit Received</h2>
        <p className="mt-5 text-sm leading-relaxed text-onyx/70">
          Thank you — your $250 consultation deposit is confirmed and credited
          100% toward your treatment. Dr. Trev&rsquo;s team will be in touch to
          schedule your appointment.
        </p>
      </div>
    );
  }

  if (card.status === "unconfigured") {
    return (
      <div className="mx-auto max-w-md border border-ivory/15 bg-ivory/[0.03] px-8 py-12 text-center">
        <p className="text-sm leading-relaxed text-ivory/70">
          Online deposits are being set up. Please{" "}
          <a href="/contact" className="text-gold underline-offset-4 hover:underline">
            reach out to our team
          </a>{" "}
          and we&rsquo;ll reserve your consultation directly.
        </p>
      </div>
    );
  }

  const disabled = card.status !== "ready" || paying;

  return (
    <div className="mx-auto max-w-md border border-gold/25 bg-ivory px-7 py-9 text-onyx sm:px-9 sm:py-10">
      <p className="text-[0.62rem] uppercase tracking-[0.28em] text-gold">
        Secure payment
      </p>
      <div className="mt-2 flex items-baseline justify-between">
        <h2 className="font-serif text-3xl font-light">Consultation deposit</h2>
        <span className="font-serif text-3xl font-light">$250</span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-onyx/60">
        Credited 100% toward your treatment. Processed securely by Square — your
        card details never touch our servers.
      </p>

      <label className="mt-7 block">
        <span className={labelClass}>Full name</span>
        <input
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jordan Avery"
          className={fieldClass}
        />
      </label>
      <label className="mt-4 block">
        <span className={labelClass}>Email for your receipt</span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={fieldClass}
        />
      </label>
      <label className="mt-4 block">
        <span className={labelClass}>Phone</span>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(310) 555-0123"
          className={fieldClass}
        />
      </label>

      <div className="mt-5">
        <span className={labelClass}>Card details</span>
        {/* Square Web Payments SDK mounts its secure card iframe here. */}
        <div ref={card.containerRef} className="mt-2 min-h-[52px]" />
      </div>

      {card.error && (
        <p className="mt-3 text-xs text-red-700" role="alert" aria-live="polite">
          {card.error}
        </p>
      )}

      <button
        type="button"
        onClick={pay}
        disabled={disabled}
        className="mt-6 w-full rounded-full bg-onyx px-8 py-4 text-[0.66rem] uppercase tracking-[0.22em] text-ivory transition-colors duration-300 hover:bg-gold hover:text-onyx disabled:cursor-not-allowed disabled:opacity-50"
      >
        {card.status === "loading" || card.status === "idle"
          ? "Loading secure form…"
          : paying
            ? "Processing…"
            : "Pay $250 deposit"}
      </button>
    </div>
  );
}
