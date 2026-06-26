"use client";

import { useEffect, useRef, useState } from "react";

// Shared Square Web Payments SDK card logic, used by both the standalone
// /reserve form and the inline payment inside the contact wizard. Handles
// runtime config fetch, SDK load, mounting the secure card iframe, and
// tokenizing (+ best-effort buyer verification). `enabled` lets a caller defer
// setup until the field is actually shown (e.g. when the deposit box is ticked).

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

export type SquareCardStatus =
  | "idle"
  | "loading"
  | "unconfigured"
  | "ready"
  | "error";

export type TokenizeResult = {
  sourceId: string;
  verificationToken?: string;
  idempotencyKey: string;
} | null;

function makeIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  const a = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

const SDK_URL: Record<"production" | "sandbox", string> = {
  production: "https://web.squarecdn.com/v1/square.js",
  sandbox: "https://sandbox.web.squarecdn.com/v1/square.js",
};

// Square only accepts a narrow set of selectors/values — note "input::placeholder"
// (a bare "::placeholder" throws InvalidStylesError), and no fontFamily.
const CARD_STYLE = {
  input: { color: "#16130f", fontSize: "16px" },
  ".input-container": { borderColor: "rgba(20,17,13,0.18)", borderRadius: "0px" },
  ".input-container.is-focus": { borderColor: "#9a7b46" },
  ".input-container.is-error": { borderColor: "#b91c1c" },
  ".message-text.is-error": { color: "#b91c1c" },
  "input::placeholder": { color: "rgba(20,17,13,0.4)" },
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

export function useSquareCard(enabled: boolean = true) {
  const [status, setStatus] = useState<SquareCardStatus>("idle");
  const [error, setError] = useState("");
  const cardRef = useRef<SqCard | null>(null);
  const paymentsRef = useRef<SqPayments | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const idemRef = useRef<string>("");
  const tokenizingRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      cardRef.current?.destroy?.().catch(() => {});
      cardRef.current = null;
      setStatus("idle");
      setError("");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setError("");

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

        // Square validates styles at attach time; fall back to defaults if a
        // style is ever rejected rather than breaking the field.
        const mountCard = async (style?: unknown): Promise<SqCard> => {
          const c = await payments.card(style ? { style } : undefined);
          try {
            if (containerRef.current) {
              containerRef.current.innerHTML = "";
              await c.attach(containerRef.current);
            }
          } catch (attachErr) {
            // Destroy the half-initialized card before any retry so it doesn't
            // leak SDK state.
            await c.destroy?.().catch(() => {});
            throw attachErr;
          }
          return c;
        };
        let card: SqCard;
        try {
          card = await mountCard(CARD_STYLE);
        } catch (styleErr) {
          console.warn("[square] styled card failed; retrying unstyled", styleErr);
          card = await mountCard();
        }
        if (cancelled) {
          card.destroy?.().catch(() => {});
          return;
        }
        cardRef.current = card;
        // One stable key per mounted card; reused across retries so Square
        // collapses an honest retry into a single charge.
        idemRef.current = makeIdempotencyKey();
        setStatus("ready");
      } catch (e) {
        console.error("[square] init failed", e);
        if (!cancelled) {
          setStatus("error");
          setError("Could not load the secure payment field. Please refresh.");
        }
      }
    })();

    return () => {
      cancelled = true;
      cardRef.current?.destroy?.().catch(() => {});
      cardRef.current = null;
    };
  }, [enabled]);

  const tokenize = async (verify?: {
    amount: string;
    email?: string;
  }): Promise<TokenizeResult> => {
    if (!cardRef.current) {
      setError("The secure payment field isn't ready yet.");
      return null;
    }
    if (tokenizingRef.current) return null; // guard rapid double-submit
    tokenizingRef.current = true;
    setError("");
    try {
      let result: { status: string; token?: string; errors?: { message: string }[] };
      try {
        result = await cardRef.current.tokenize();
      } catch (e) {
        console.error("[square] tokenize threw", e);
        setError("Please check your card details and try again.");
        return null;
      }
      if (result.status !== "OK" || !result.token) {
        setError(result.errors?.[0]?.message || "Please check your card details.");
        return null;
      }
      let verificationToken: string | undefined;
      if (verify) {
        try {
          const v = await paymentsRef.current?.verifyBuyer?.(result.token, {
            amount: verify.amount,
            currencyCode: "USD",
            intent: "CHARGE",
            ...(verify.email ? { billingContact: { email: verify.email } } : {}),
          });
          verificationToken = v?.token;
        } catch {
          /* verification is optional */
        }
      }
      return {
        sourceId: result.token,
        verificationToken,
        idempotencyKey: idemRef.current,
      };
    } finally {
      tokenizingRef.current = false;
    }
  };

  return { status, error, setError, containerRef, tokenize };
}
