"use client";

import { useEffect, useState } from "react";
import Magnetic from "../components/Magnetic";

const cities = [
  "Beverly Hills, CA",
  "New York, NY",
  "Atlanta, GA",
  "Houston, TX",
  "Washington, D.C.",
  "Tampa, FL",
  "Memphis, TN",
  "Other — I am flexible",
];

const serviceOptions = [
  "Implants",
  "Veneers",
  "Whitening",
  "Crowns",
  "Cleaning",
  "Extraction",
  "Full Smile Makeover",
];

const budgets = [
  "Under $2K",
  "$2K – $5K",
  "$5K – $10K",
  "$10K – $20K",
  "$20K – $40K",
  "$40K+",
];

const hearOptions = [
  "Instagram DM",
  "Instagram Comment",
  "Facebook",
  "Referred by a friend or patient",
  "Found on the website",
  "Other",
];

const financingPartners = [
  { name: "CareCredit", href: "https://www.carecredit.com/go/276SNV/" },
  { name: "Alphaeon", href: "https://goalphaeon.com/apply?src=cling" },
  {
    name: "Cherry",
    href: "https://pay.withcherry.com/trevor-jamal-thomas-dds-inc?utm_source=practice&m=51934",
  },
  {
    name: "Proceed Finance",
    href: "https://www.proceedfinance.com/application/create?referrer=37783-13017-4FDA",
  },
];

// $250 deposit checkout (Square), credited 100% toward treatment.
const CHECKOUT_URL = "https://square.link/u/wISlz03Z";

const steps = [
  { label: "Contact", title: "Let's start with you." },
  { label: "Your Smile", title: "Tell us about your smile." },
  { label: "Investment", title: "Budget, financing & photos." },
  { label: "Finish", title: "A few final touches." },
];

const inputBase =
  "w-full border bg-ivory/[0.03] px-4 py-3.5 text-ivory placeholder:text-ivory/30 transition-colors duration-300 focus:bg-ivory/[0.06] focus:outline-none";
const labelClass =
  "mb-3 block text-[0.62rem] uppercase tracking-[0.22em] text-ivory/55";

function Req() {
  return <span className="text-gold">*</span>;
}

function Check({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}

// Shrink large phone photos in the browser, then return them as a base64 data
// URL so they ride along in the JSON submission (no flaky multipart parsing).
// Falls back to the original bytes if the image can't be decoded.
function photoToDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const MAX = 1600;
    const QUALITY = 0.82;
    const url = URL.createObjectURL(file);
    const fallback = () => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    const img = new Image();
    img.onload = () => {
      try {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (Math.max(w, h) > MAX) {
          const scale = MAX / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", QUALITY));
      } catch {
        URL.revokeObjectURL(url);
        fallback();
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      fallback();
    };
    img.src = url;
  });
}

export default function InquiryForm() {
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    social: "",
    city: "",
    goals: "",
    budget: "",
    financing: "",
    hear: "",
  });
  const [services, setServices] = useState<string[]>([]);
  const [videoConsult, setVideoConsult] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  // Re-trigger the entrance transition whenever the step changes.
  useEffect(() => {
    setShown(false);
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [step]);

  const isLast = step === steps.length - 1;

  const set =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { value } = e.target;
      setForm((f) => ({ ...f, [key]: value }));
      setErrors((er) => {
        if (!er[key]) return er;
        const next = { ...er };
        delete next[key];
        return next;
      });
    };

  const toggleService = (s: string) =>
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const validate = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.firstName.trim()) e.firstName = "Required";
      if (!form.lastName.trim()) e.lastName = "Required";
      if (!form.phone.trim()) e.phone = "Required";
      if (!form.social.trim()) e.social = "Required";
      if (!form.email.trim()) e.email = "Required";
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
        e.email = "Enter a valid email address";
    }
    if (s === 1) {
      if (!form.city) e.city = "Please choose a city";
      if (!form.goals.trim()) e.goals = "Please tell us a little";
    }
    return e;
  };

  const scrollTop = () => {
    if (typeof document === "undefined") return;
    document
      .getElementById("inquiry-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goNext = () => {
    const e = validate(step);
    if (Object.keys(e).length) {
      setErrors(e);
      const first = document.getElementById(Object.keys(e)[0]);
      first?.focus();
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, steps.length - 1));
    scrollTop();
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    scrollTop();
  };

  const handleSubmit = async () => {
    if (submitting) return;
    // Guard: ensure earlier required steps are complete, jumping back if not.
    for (const s of [0, 1]) {
      const er = validate(s);
      if (Object.keys(er).length) {
        setErrors(er);
        setStep(s);
        scrollTop();
        return;
      }
    }

    setSubmitting(true);
    // Persist to Airtable (text) and upload photos to our own server route,
    // which holds the secret token and writes files to the persistent disk. We
    // don't block the visitor on the result — they still reach the success
    // screen and the $250 deposit step; delivery issues are logged server-side.
    try {
      const photoPayload = (
        await Promise.all(
          photos.map(async (file, i) => {
            const dataUrl = await photoToDataUrl(file);
            if (!dataUrl) return null;
            const stem = file.name.replace(/\.[^.]+$/, "") || `photo-${i + 1}`;
            return { name: `${stem}.jpg`, dataUrl };
          }),
        )
      ).filter(Boolean);

      await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          social: form.social,
          city: form.city,
          services,
          goals: form.goals,
          budget: form.budget,
          financing: form.financing,
          videoConsult,
          hear: form.hear,
          photos: photoPayload,
        }),
      });
    } catch {
      // Network failure — still complete the flow for the visitor.
    }

    setSubmitting(false);
    setSubmitted(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl border border-ivory/10 bg-white/[0.02] px-8 py-16 text-center sm:px-12">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">
          <Check />
        </div>
        <h2 className="font-serif text-4xl font-light text-ivory sm:text-5xl">
          We Received Your Inquiry
        </h2>
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-ivory/65">
          Thank you for reaching out. Dr. Trev or a member of his team will
          review your submission and get back to you shortly. We look forward to
          being part of your smile journey.
        </p>

        {videoConsult && (
          <div className="mx-auto mt-10 max-w-md border-t border-ivory/10 pt-10">
            <p className="text-sm leading-relaxed text-ivory/65">
              Your{" "}
              <span className="text-gold">
                $250 deposit is credited 100% toward your treatment
              </span>
              . Reserve your private video consultation below — please use the
              same email you entered above so your booking connects
              automatically.
            </p>
            <Magnetic>
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-champagne px-8 py-4 text-[0.66rem] uppercase tracking-[0.22em] text-onyx transition-colors duration-300 hover:bg-gold"
              >
                Reserve My Consultation — $250 →
              </a>
            </Magnetic>
          </div>
        )}
      </div>
    );
  }

  const inputCls = (key: string) =>
    `${inputBase} ${errors[key] ? "border-rose-400/70" : "border-ivory/15 focus:border-champagne"}`;

  const Error = ({ name }: { name: string }) =>
    errors[name] ? (
      <p className="mt-2 text-xs text-rose-300/90">{errors[name]}</p>
    ) : null;

  return (
    <form
      id="inquiry-form"
      onSubmit={(e) => e.preventDefault()}
      className="mx-auto max-w-2xl scroll-mt-28"
    >
      {/* Progress stepper */}
      <ol className="mb-10 flex items-center">
        {steps.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li
              key={s.label}
              className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[0.7rem] tabular-nums transition-colors duration-300 ${
                    done
                      ? "border-gold bg-gold text-onyx"
                      : current
                        ? "border-gold text-gold"
                        : "border-ivory/20 text-ivory/40"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : `0${i + 1}`}
                </span>
                <span
                  className={`hidden text-[0.62rem] uppercase tracking-[0.2em] transition-colors duration-300 lg:inline ${
                    current
                      ? "text-ivory"
                      : done
                        ? "text-ivory/70"
                        : "text-ivory/35"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span
                  className={`mx-3 h-px flex-1 transition-colors duration-500 ${
                    done ? "bg-gold/60" : "bg-ivory/15"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="relative border border-ivory/10 bg-white/[0.02] p-6 sm:p-10 lg:p-12">
        {/* gold corner accent */}
        <span className="pointer-events-none absolute left-0 top-0 h-12 w-px bg-gold/50" />
        <span className="pointer-events-none absolute left-0 top-0 h-px w-12 bg-gold/50" />

        {/* Step heading */}
        <p className="text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">
          Step 0{step + 1} / 0{steps.length} — {steps[step].label}
        </p>
        <h2 className="mt-4 font-serif text-3xl font-light leading-[1.1] text-ivory sm:text-4xl">
          {steps[step].title}
        </h2>

        <div
          key={step}
          className={`mt-10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          {/* STEP 1 — Contact */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={labelClass}>
                    First Name <Req />
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={set("firstName")}
                    className={inputCls("firstName")}
                  />
                  <Error name="firstName" />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass}>
                    Last Name <Req />
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={set("lastName")}
                    className={inputCls("lastName")}
                  />
                  <Error name="lastName" />
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Phone Number <Req />
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(424) 000-0000"
                    value={form.phone}
                    onChange={set("phone")}
                    className={inputCls("phone")}
                  />
                  <Error name="phone" />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email Address <Req />
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set("email")}
                    className={inputCls("email")}
                  />
                  <Error name="email" />
                </div>
              </div>
              <div>
                <label htmlFor="social" className={labelClass}>
                  Social Media Handle(s) <Req />
                </label>
                <input
                  id="social"
                  type="text"
                  placeholder="@yourhandle — Instagram, TikTok, etc."
                  value={form.social}
                  onChange={set("social")}
                  className={inputCls("social")}
                />
                <Error name="social" />
              </div>
            </div>
          )}

          {/* STEP 2 — Your Smile */}
          {step === 1 && (
            <div className="space-y-10">
              <div>
                <label htmlFor="city" className={labelClass}>
                  Which city would you like to be seen in? <Req />
                </label>
                <select
                  id="city"
                  value={form.city}
                  onChange={set("city")}
                  className={`${inputCls("city")} appearance-none`}
                >
                  <option value="" disabled>
                    Select a city
                  </option>
                  {cities.map((c) => (
                    <option key={c} value={c} className="bg-onyx text-ivory">
                      {c}
                    </option>
                  ))}
                </select>
                <Error name="city" />
              </div>

              <div>
                <p className={labelClass}>Services interested in</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {serviceOptions.map((s) => {
                    const active = services.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleService(s)}
                        aria-pressed={active}
                        className={`flex items-center justify-between gap-2 border px-4 py-3 text-left text-sm transition-colors duration-200 ${
                          active
                            ? "border-gold/70 bg-gold/10 text-ivory"
                            : "border-ivory/15 text-ivory/70 hover:border-ivory/35"
                        }`}
                      >
                        {s}
                        {active && <Check className="h-3.5 w-3.5 text-gold" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="goals" className={labelClass}>
                  Tell us about your goals and concerns <Req />
                </label>
                <textarea
                  id="goals"
                  rows={5}
                  placeholder="Describe what you'd like to change or improve about your smile. The more detail, the better Dr. Trev can assist you."
                  value={form.goals}
                  onChange={set("goals")}
                  className={`${inputCls("goals")} resize-none`}
                />
                <Error name="goals" />
              </div>
            </div>
          )}

          {/* STEP 3 — Investment */}
          {step === 2 && (
            <div className="space-y-10">
              <div>
                <p className={labelClass}>Estimated budget</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {budgets.map((b) => {
                    const active = form.budget === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, budget: b }))}
                        aria-pressed={active}
                        className={`border px-4 py-3 text-center text-sm transition-colors duration-200 ${
                          active
                            ? "border-gold/70 bg-gold/10 text-ivory"
                            : "border-ivory/15 text-ivory/70 hover:border-ivory/35"
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className={labelClass}>Would you like financing options?</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { v: "Yes", t: "Yes, I'd like financing options" },
                    { v: "No", t: "No, paying out of pocket" },
                  ].map((o) => {
                    const active = form.financing === o.v;
                    return (
                      <button
                        key={o.v}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, financing: o.v }))
                        }
                        aria-pressed={active}
                        className={`border px-5 py-3 text-sm transition-colors duration-200 ${
                          active
                            ? "border-gold/70 bg-gold/10 text-ivory"
                            : "border-ivory/15 text-ivory/70 hover:border-ivory/35"
                        }`}
                      >
                        {o.t}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-6 text-[0.6rem] uppercase tracking-[0.2em] text-ivory/40">
                  Financing partners — apply with any of these:
                </p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                  {financingPartners.map((p) => (
                    <a
                      key={p.name}
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-ivory/70 underline-offset-4 transition-colors hover:text-gold hover:underline"
                    >
                      {p.name} ↗
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <p className={labelClass}>Photos of your teeth</p>
                <label
                  htmlFor="photos"
                  className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-ivory/25 bg-ivory/[0.02] px-6 py-10 text-center transition-colors hover:border-gold/60"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-7 w-7 text-gold"
                  >
                    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.2-1.6A1 1 0 0 1 9.5 5h5a1 1 0 0 1 .8.4L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5Z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  <span className="mt-3 text-sm text-ivory/70">
                    <span className="text-gold">Tap to upload photos</span>
                  </span>
                  <span className="mt-1 text-xs text-ivory/40">
                    Front view, side view, and any areas of concern
                  </span>
                  <input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const fs = Array.from(e.target.files ?? []);
                      setPhotos((p) => [...p, ...fs]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {photos.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {photos.map((f, idx) => (
                      <li
                        key={`${f.name}-${idx}`}
                        className="flex items-center gap-2 border border-gold/30 px-3 py-1 text-xs text-gold"
                      >
                        {f.name}
                        <button
                          type="button"
                          aria-label={`Remove ${f.name}`}
                          onClick={() =>
                            setPhotos((p) => p.filter((_, i) => i !== idx))
                          }
                          className="text-gold/60 transition-colors hover:text-gold"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-xs text-ivory/40">
                  JPG, PNG or HEIC. Max 10MB per photo. Photos help Dr. Trev
                  provide an accurate estimate.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4 — Finish */}
          {step === 3 && (
            <div className="space-y-10">
              <label className="flex cursor-pointer items-start gap-4 border border-gold/30 bg-gold/[0.05] p-5 transition-colors hover:border-gold/60">
                <input
                  type="checkbox"
                  checked={videoConsult}
                  onChange={(e) => setVideoConsult(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-gold"
                />
                <span className="text-sm leading-relaxed text-ivory/80">
                  Reserve a private video consultation with Dr. Trev —{" "}
                  <span className="text-gold">$250, credited 100%</span> toward
                  your treatment.
                </span>
              </label>

              <div>
                <label htmlFor="hear" className={labelClass}>
                  How did you hear about us?
                </label>
                <select
                  id="hear"
                  value={form.hear}
                  onChange={set("hear")}
                  className={`${inputCls("hear")} appearance-none`}
                >
                  <option value="" disabled>
                    Select one
                  </option>
                  {hearOptions.map((o) => (
                    <option key={o} value={o} className="bg-onyx text-ivory">
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <p className="border-t border-ivory/10 pt-6 text-sm leading-relaxed text-ivory/55">
                Almost there — review your details, then send your inquiry and
                Dr. Trev will personally take it from here.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-12 flex items-center justify-between gap-4">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-ivory/55 transition-colors duration-300 hover:text-ivory"
            >
              ← Back
            </button>
          ) : (
            <span aria-hidden="true" />
          )}

          {isLast ? (
            <Magnetic key="submit">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={submitting}
                className="inline-flex items-center gap-3 rounded-full bg-champagne px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-onyx transition-colors duration-300 hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit My Inquiry"}
              </button>
            </Magnetic>
          ) : (
            <Magnetic key="next">
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-3 rounded-full bg-champagne px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-onyx transition-colors duration-300 hover:bg-gold"
              >
                Continue →
              </button>
            </Magnetic>
          )}
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-ivory/40">
        Your information is kept private and used only to assist with your care.
      </p>
    </form>
  );
}
