"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_KEY,
  AnalyticsConsentChoice,
  getAnalyticsConsent,
} from "./MetaPixel";

function saveChoice(choice: AnalyticsConsentChoice) {
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, choice);
  } catch {
    // If storage is unavailable, the choice applies only to this page view.
  }
  window.dispatchEvent(
    new CustomEvent<AnalyticsConsentChoice>(ANALYTICS_CONSENT_EVENT, {
      detail: choice,
    }),
  );
}

export default function AnalyticsConsent() {
  const [choice, setChoice] = useState<AnalyticsConsentChoice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = getAnalyticsConsent();
      setChoice(saved);
      setOpen(saved === null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const choose = (nextChoice: AnalyticsConsentChoice) => {
    saveChoice(nextChoice);
    setChoice(nextChoice);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-[70] rounded-full border border-ink/15 bg-ivory/95 px-4 py-2 text-[0.58rem] uppercase tracking-[0.16em] text-ink shadow-lg backdrop-blur transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
      >
        Privacy choices
        <span className="sr-only">
          . Analytics is currently {choice === "granted" ? "allowed" : "off"}.
        </span>
      </button>
    );
  }

  return (
    <section
      aria-label="Analytics privacy choices"
      className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-3xl border border-ivory/15 bg-ink/95 p-5 text-ivory shadow-2xl backdrop-blur sm:p-6"
    >
      <p className="text-[0.6rem] uppercase tracking-[0.28em] text-gold">
        Your privacy choice
      </p>
      <h2 className="mt-2 font-serif text-2xl font-light">
        Optional analytics is off unless you allow it.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory/65">
        If allowed, Meta receives page visits and a generic conversion after a
        successfully saved enquiry. We do not send your contact details,
        treatment choices, budget, messages, photos or clinical information to
        Meta.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => choose("denied")}
          className="rounded-full border border-ivory/25 px-5 py-3 text-[0.65rem] uppercase tracking-[0.18em] text-ivory transition-colors hover:border-ivory/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          Essential only
        </button>
        <button
          type="button"
          onClick={() => choose("granted")}
          className="rounded-full bg-champagne px-5 py-3 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-onyx transition-colors hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          Allow analytics
        </button>
        <Link
          href="/privacy"
          className="text-center text-[0.62rem] uppercase tracking-[0.16em] text-ivory/55 underline-offset-4 hover:text-gold hover:underline sm:ml-auto"
        >
          Privacy details
        </Link>
      </div>
    </section>
  );
}
