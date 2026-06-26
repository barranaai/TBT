"use client";

import { useEffect, useRef, useState } from "react";

// Minimal typings for the slice of the Web Payments SDK we use.
type SqTokenResult = {
  status: string;
  token?: string;
  errors?: { message: string }[];
};
type SqCard = {
  attach: (el: HTMLElement | string) => Promise<void>;
  tokenize: () => Promise<SqTokenResult>;
  destroy?: () => Promise<void>;
};
type SqPayments = {
  card: (opts?: unknown) => Promise<SqCard>;
  verifyBuyer?: (token: string, details: unknown) => Promise<{ token?: string }>;
};
declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<SqPayments>;
    };
  }
}

type Config = {
  configured: boolean;
  applicationId?: string;
  locationId?: string;
  environment?: "production" | "sandbox";
};
type Status =
  | "loading"
  | "unconfigured"
  | "ready"
  | "processing"
  | "success"
  | "error";

const SDK_URL: Record<"production" | "sandbox", string> = {
  production: "https://web.squarecdn.com/v1/square.js",
  sandbox: "https://sandbox.web.squarecdn.com/v1/square.js",
};

function loadSdk(env: "production" | "sandbox"): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Square) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-square-sdk]",
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("sdk")));
      return;
    }
    const s = document.createElement("script");
    s.src = SDK_URL[env];
    s.async = true;
    s.dataset.squareSdk = "true";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("sdk"));
    document.head.appendChild(s);
  });
}

// Dark text on the light payment panel; gold focus ring to match the brand.
const CARD_STYLE = {
  input: { color: "#16130f", fontSize: "16px" },
  ".input-container": {
    borderColor: "rgba(20,17,13,0.18)",
    borderRadius: "0px",
  },
  ".input-container.is-focus": { borderColor: "#9a7b46" },
  ".input-container.is-error": { borderColor: "#b91c1c" },
  ".message-text.is-error": { color: "#b91c1c" },
  "::placeholder": { color: "rgba(20,17,13,0.4)" },
};

export default function SquareDeposit({
  type,
}: {
  type?: "in-person" | "video";
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const cardRef = useRef<SqCard | null>(null);
  const paymentsRef = useRef<SqPayments | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = (await (await fetch("/api/square/config")).json()) as Config;
        if (!cfg.configured || !cfg.applicationId || !cfg.locationId) {
          if (!cancelled) setStatus("unconfigured");
          return;
        }
        await loadSdk(cfg.environment || "production");
        if (cancelled || !window.Square) return;
        const payments = await window.Square.payments(
          cfg.applicationId,
          cfg.locationId,
        );
        paymentsRef.current = payments;
        const card = await payments.card({ style: CARD_STYLE });
        if (cancelled) return;
        if (containerRef.current) await card.attach(containerRef.current);
        cardRef.current = card;
        if (!cancelled) setStatus("ready");
      } catch (e) {
        console.error("[SquareDeposit] init failed", e);
        if (!cancelled) {
          setStatus("error");
          setError("Could not load the secure payment field. Please refresh.");
        }
      }
    })();
    return () => {
      cancelled = true;
      cardRef.current?.destroy?.().catch(() => {});
    };
  }, []);

  const pay = async () => {
    if (!cardRef.current || status === "processing") return;
    setError("");
    setStatus("processing");
    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== "OK" || !result.token) {
        setStatus("ready");
        setError(result.errors?.[0]?.message || "Please check your card details.");
        return;
      }

      // Best-effort SCA / 3-DS verification (improves auth rates).
      let verificationToken: string | undefined;
      try {
        const v = await paymentsRef.current?.verifyBuyer?.(result.token, {
          amount: "250.00",
          currencyCode: "USD",
          intent: "CHARGE",
          ...(email ? { billingContact: { email } } : {}),
        });
        verificationToken = v?.token;
      } catch {
        /* verification is optional — proceed with the token alone */
      }

      const res = await fetch("/api/square/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: result.token,
          verificationToken,
          type,
          email: email || undefined,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus("ready");
        setError(data.error || "Payment could not be completed.");
        return;
      }
      setStatus("success");
    } catch (e) {
      console.error("[SquareDeposit] pay failed", e);
      setStatus("ready");
      setError("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
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

  if (status === "unconfigured") {
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

  const busy = status === "processing";

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

      <label className="mt-7 block text-[0.7rem] uppercase tracking-[0.18em] text-onyx/55">
        Email for your receipt
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-2 w-full border border-onyx/20 bg-transparent px-3 py-3 text-sm text-onyx outline-none placeholder:text-onyx/35 focus:border-gold"
        />
      </label>

      <div className="mt-5 text-[0.7rem] uppercase tracking-[0.18em] text-onyx/55">
        Card details
        {/* Square Web Payments SDK mounts its secure card iframe here. */}
        <div ref={containerRef} className="mt-2 min-h-[52px]" />
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-700" role="alert" aria-live="polite">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={pay}
        disabled={status !== "ready"}
        className="mt-6 w-full rounded-full bg-onyx px-8 py-4 text-[0.66rem] uppercase tracking-[0.22em] text-ivory transition-colors duration-300 hover:bg-gold hover:text-onyx disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading"
          ? "Loading secure form…"
          : busy
            ? "Processing…"
            : "Pay $250 deposit"}
      </button>
    </div>
  );
}
