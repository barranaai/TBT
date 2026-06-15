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

// $250 deposit checkout (Square), credited toward treatment.
const CHECKOUT_URL = "https://square.link/u/wISlz03Z";

const inputClass =
  "w-full border border-ivory/25 bg-transparent px-4 py-3 text-ivory placeholder:text-ivory/30 transition-colors focus:border-champagne focus:outline-none";
const labelClass = "eyebrow mb-3 block text-champagne";
const sectionLabel =
  "mb-6 text-[0.6rem] uppercase tracking-[0.34em] text-gold/70";

function Req() {
  return <span className="text-gold">*</span>;
}

export default function InquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [videoConsult, setVideoConsult] = useState(false);
  const [files, setFiles] = useState<string[]>([]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire delivery (email/CRM) at launch. The $250 deposit is taken
    // via the Square checkout link on the confirmation below.
    setSubmitted(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl text-center">
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
          <div className="mx-auto mt-12 max-w-md border-t border-ivory/10 pt-10">
            <p className="text-sm leading-relaxed text-ivory/65">
              Your{" "}
              <span className="text-gold">
                $250 deposit is credited 100% toward your treatment
              </span>{" "}
              — reserve your private video consultation below. Please use the
              same email you entered above so your booking connects
              automatically.
            </p>
            <Magnetic>
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-3 border border-gold px-8 py-4 text-[0.66rem] uppercase tracking-[0.24em] text-gold transition-colors duration-300 hover:bg-gold hover:text-onyx"
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
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-16">
      {/* Contact Information */}
      <fieldset>
        <p className={sectionLabel}>Contact Information</p>
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
      </fieldset>

      {/* Your Location */}
      <fieldset>
        <p className={sectionLabel}>Your Location</p>
        <label htmlFor="city" className={labelClass}>
          Which city would you like to be seen in? <Req />
        </label>
        <select
          id="city"
          name="city"
          required
          defaultValue=""
          className={`${inputClass} appearance-none`}
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
      </fieldset>

      {/* Services Interested In */}
      <fieldset>
        <p className={sectionLabel}>Services Interested In</p>
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
      </fieldset>

      {/* Your Goals */}
      <fieldset>
        <p className={sectionLabel}>Your Goals</p>
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
      </fieldset>

      {/* Estimated Budget */}
      <fieldset>
        <p className={sectionLabel}>Estimated Budget</p>
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
      </fieldset>

      {/* Financing */}
      <fieldset>
        <p className={sectionLabel}>Financing</p>
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
        <p className="mt-6 text-[0.62rem] uppercase tracking-[0.2em] text-ivory/40">
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
      </fieldset>

      {/* Video consultation */}
      <fieldset>
        <label className="flex cursor-pointer items-start gap-4 border border-gold/30 bg-gold/[0.04] p-5 transition-colors hover:border-gold/60">
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
      </fieldset>

      {/* Photos */}
      <fieldset>
        <p className={sectionLabel}>Photos of Your Teeth</p>
        <label
          htmlFor="photos"
          className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-ivory/25 px-6 py-10 text-center transition-colors hover:border-gold/60"
        >
          <span aria-hidden="true" className="text-2xl">
            📷
          </span>
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
                className="border border-ivory/15 px-3 py-1 text-xs text-ivory/60"
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
      </fieldset>

      {/* How did you hear */}
      <fieldset>
        <p className={sectionLabel}>How Did You Hear About Us?</p>
        <label htmlFor="hear" className="sr-only">
          How did you hear about us?
        </label>
        <select
          id="hear"
          name="hear"
          defaultValue=""
          className={`${inputClass} appearance-none`}
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
      </fieldset>

      <div>
        <Magnetic>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center bg-ivory px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-champagne sm:w-auto"
          >
            Submit My Inquiry
          </button>
        </Magnetic>
        <p className="mt-6 text-xs text-ivory/40">
          Your information is kept private and will only be used to assist with
          your care.
        </p>
      </div>
    </form>
  );
}
