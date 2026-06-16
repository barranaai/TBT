"use client";

import { useState } from "react";
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

const inputClass =
  "w-full border border-ivory/15 bg-ivory/[0.03] px-4 py-3.5 text-ivory placeholder:text-ivory/30 transition-colors duration-300 focus:border-champagne focus:bg-ivory/[0.06] focus:outline-none";
const selectClass = `${inputClass} appearance-none`;
const labelClass =
  "mb-3 block text-[0.62rem] uppercase tracking-[0.22em] text-ivory/55";

function Req() {
  return <span className="text-gold">*</span>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-5">
      <span className="whitespace-nowrap text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">
        {children}
      </span>
      <span className="h-px flex-1 bg-ivory/12" />
    </div>
  );
}

export default function InquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [videoConsult, setVideoConsult] = useState(false);
  const [files, setFiles] = useState<string[]>([]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire submission delivery (email/CRM) at launch. The $250 deposit is
    // taken via the Square checkout link on the confirmation below.
    setSubmitted(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl border border-ivory/10 bg-white/[0.02] px-8 py-16 text-center sm:px-12">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-6 w-6"
          >
            <path d="m5 12 5 5 9-10" />
          </svg>
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

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl">
      <div className="relative border border-ivory/10 bg-white/[0.02] p-6 sm:p-10 lg:p-12">
        {/* gold corner accent */}
        <span className="pointer-events-none absolute left-0 top-0 h-12 w-px bg-gold/50" />
        <span className="pointer-events-none absolute left-0 top-0 h-px w-12 bg-gold/50" />

        <p className="mb-12 text-base leading-relaxed text-ivory/65">
          Fill out the form below and Dr. Trev will personally review your
          inquiry.
        </p>

        {/* Contact Information */}
        <SectionLabel>Contact Information</SectionLabel>
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={labelClass}>
                First Name <Req />
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                autoComplete="given-name"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>
                Last Name <Req />
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                autoComplete="family-name"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone Number <Req />
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="(424) 000-0000"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="social" className={labelClass}>
              Social Media Handle(s) <Req />
            </label>
            <input
              id="social"
              name="social"
              type="text"
              required
              placeholder="@yourhandle — Instagram, TikTok, etc."
              className={inputClass}
            />
          </div>
        </div>

        {/* Your Location */}
        <div className="mt-14">
          <SectionLabel>Your Location</SectionLabel>
          <label htmlFor="city" className={labelClass}>
            Which city would you like to be seen in? <Req />
          </label>
          <select
            id="city"
            name="city"
            required
            defaultValue=""
            className={selectClass}
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
        </div>

        {/* Services Interested In */}
        <div className="mt-14">
          <SectionLabel>Services Interested In</SectionLabel>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            {serviceOptions.map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-3 text-sm text-ivory/75"
              >
                <input
                  type="checkbox"
                  name="services"
                  value={s}
                  className="h-4 w-4 accent-gold"
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        {/* Your Goals */}
        <div className="mt-14">
          <SectionLabel>Your Goals</SectionLabel>
          <label htmlFor="goals" className={labelClass}>
            Tell us about your goals and concerns <Req />
          </label>
          <textarea
            id="goals"
            name="goals"
            required
            rows={5}
            placeholder="Describe what you'd like to change or improve about your smile. The more detail, the better Dr. Trev can assist you."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Estimated Budget */}
        <div className="mt-14">
          <SectionLabel>Estimated Budget</SectionLabel>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            {budgets.map((b) => (
              <label
                key={b}
                className="flex cursor-pointer items-center gap-3 text-sm text-ivory/75"
              >
                <input
                  type="radio"
                  name="budget"
                  value={b}
                  className="h-4 w-4 accent-gold"
                />
                {b}
              </label>
            ))}
          </div>
        </div>

        {/* Financing */}
        <div className="mt-14">
          <SectionLabel>Financing</SectionLabel>
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-ivory/75">
              <input
                type="radio"
                name="financing"
                value="Yes"
                className="h-4 w-4 accent-gold"
              />
              Yes, I&apos;d like financing options
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-ivory/75">
              <input
                type="radio"
                name="financing"
                value="No"
                className="h-4 w-4 accent-gold"
              />
              No, paying out of pocket
            </label>
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

        {/* Video consultation */}
        <div className="mt-14">
          <label className="flex cursor-pointer items-start gap-4 border border-gold/30 bg-gold/[0.05] p-5 transition-colors hover:border-gold/60">
            <input
              type="checkbox"
              name="video_consult"
              value="Yes"
              checked={videoConsult}
              onChange={(e) => setVideoConsult(e.target.checked)}
              className="mt-1 h-4 w-4 accent-gold"
            />
            <span className="text-sm leading-relaxed text-ivory/80">
              Reserve a private video consultation with Dr. Trev —{" "}
              <span className="text-gold">$250, credited 100%</span> toward your
              treatment.
            </span>
          </label>
        </div>

        {/* Photos */}
        <div className="mt-14">
          <SectionLabel>Photos of Your Teeth</SectionLabel>
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
              name="photos"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) =>
                setFiles(Array.from(e.target.files ?? []).map((f) => f.name))
              }
            />
          </label>
          {files.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {files.map((name) => (
                <li
                  key={name}
                  className="border border-gold/30 px-3 py-1 text-xs text-gold"
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-ivory/40">
            JPG, PNG or HEIC. Max 10MB per photo. Photos help Dr. Trev provide an
            accurate estimate.
          </p>
        </div>

        {/* How did you hear */}
        <div className="mt-14">
          <SectionLabel>How Did You Hear About Us?</SectionLabel>
          <label htmlFor="hear" className="sr-only">
            How did you hear about us?
          </label>
          <select
            id="hear"
            name="hear"
            defaultValue=""
            className={selectClass}
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

        <div className="mt-12">
          <Magnetic>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-champagne px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-onyx transition-colors duration-300 hover:bg-gold"
            >
              Submit My Inquiry
            </button>
          </Magnetic>
          <p className="mt-5 text-center text-xs text-ivory/40">
            Your information is kept private and used only to assist with your
            care.
          </p>
        </div>
      </div>
    </form>
  );
}
