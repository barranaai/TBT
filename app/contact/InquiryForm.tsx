"use client";

import { useState } from "react";
import Magnetic from "../components/Magnetic";

const locations = [
  "Beverly Hills, CA",
  "New York, NY",
  "Atlanta, GA",
  "Houston, TX",
  "Washington, D.C.",
  "Tampa, FL",
  "Memphis, TN",
  "Other — I am flexible",
];

const budgets = [
  "Under $2K",
  "$2K – $5K",
  "$5K – $10K",
  "$10K – $20K",
  "$20K – $40K",
  "$40K+",
];

const photoFields = [
  { id: "photo-bite", caption: "Your natural smile while biting down." },
  { id: "photo-top", caption: "Your top teeth with your lip lifted." },
  { id: "photo-bottom", caption: "Your bottom teeth with your lip pulled down." },
  { id: "photo-left", caption: "Your mouth open from a left angle." },
  { id: "photo-right", caption: "Your mouth open from a right angle." },
];

const inputClass =
  "w-full border border-ivory/15 bg-ivory/[0.03] px-4 py-3.5 text-ivory placeholder:text-ivory/30 transition-colors duration-300 focus:border-champagne focus:bg-ivory/[0.06] focus:outline-none";
const selectClass = `${inputClass} appearance-none bg-[length:0]`;
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

const CameraIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="h-[18px] w-[18px]"
  >
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.2-1.6A1 1 0 0 1 9.5 5h5a1 1 0 0 1 .8.4L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5Z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

function PhotoField({ id, caption }: { id: string; caption: string }) {
  const [name, setName] = useState<string | null>(null);
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-4 border bg-ivory/[0.02] p-4 transition-colors duration-300 ${
        name ? "border-gold/50" : "border-ivory/12 hover:border-gold/40"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
          name ? "border-gold text-gold" : "border-ivory/20 text-ivory/60"
        }`}
      >
        {name ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-[18px] w-[18px]"
          >
            <path d="m5 12 5 5 9-10" />
          </svg>
        ) : (
          <CameraIcon />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-ivory/75">
          {name ? <span className="text-gold">{name}</span> : caption}
        </span>
      </span>
      <span className="shrink-0 text-[0.6rem] uppercase tracking-[0.18em] text-ivory/45">
        {name ? "Replace" : "Choose"}
      </span>
      <input
        id={id}
        name={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => setName(e.target.files?.[0]?.name ?? null)}
      />
    </label>
  );
}

export default function InquiryForm() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire submission delivery (email/CRM) at launch.
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
          We&apos;ve Received Your Request
        </h2>
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-ivory/65">
          Thank you for taking the first step. Dr. Trev or a member of his team
          will review your information and confirm your appointment shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl">
      <div className="relative border border-ivory/10 bg-white/[0.02] p-6 sm:p-10 lg:p-12">
        {/* gold corner accent */}
        <span className="pointer-events-none absolute left-0 top-0 h-12 w-px bg-gold/50" />
        <span className="pointer-events-none absolute left-0 top-0 h-px w-12 bg-gold/50" />

        <p className="mb-10 text-base leading-relaxed text-ivory/65">
          Take the first step toward the smile you&apos;ve always wanted. Enter
          your information below and we&apos;ll confirm your appointment
          shortly.
        </p>

        <SectionLabel>Your Details</SectionLabel>

        <div className="space-y-6">
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Full Name (First and Last) <Req />
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              className={inputClass}
            />
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
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="dob" className={labelClass}>
                Date of Birth <Req />
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                required
                className={`${inputClass} [color-scheme:dark]`}
              />
            </div>
            <div>
              <label htmlFor="location" className={labelClass}>
                Location <Req />
              </label>
              <select
                id="location"
                name="location"
                required
                defaultValue=""
                className={selectClass}
              >
                <option value="" disabled>
                  Select a location
                </option>
                {locations.map((l) => (
                  <option key={l} value={l} className="bg-onyx text-ivory">
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="financing" className={labelClass}>
                Have You Applied For Financing?
              </label>
              <select
                id="financing"
                name="financing"
                defaultValue=""
                className={selectClass}
              >
                <option value="" disabled>
                  Select one
                </option>
                <option value="Yes" className="bg-onyx text-ivory">
                  Yes
                </option>
                <option value="No" className="bg-onyx text-ivory">
                  No
                </option>
              </select>
            </div>
            <div className="hidden sm:block" aria-hidden="true" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="budget" className={labelClass}>
                What is your budget?
              </label>
              <select
                id="budget"
                name="budget"
                defaultValue=""
                className={selectClass}
              >
                <option value="" disabled>
                  Select a range
                </option>
                {budgets.map((b) => (
                  <option key={b} value={b} className="bg-onyx text-ivory">
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="instagram" className={labelClass}>
                Instagram Handle
              </label>
              <input
                id="instagram"
                name="instagram"
                type="text"
                placeholder="@yourhandle"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="goals" className={labelClass}>
              Primary Questions, Goals, or Concerns
            </label>
            <textarea
              id="goals"
              name="goals"
              rows={5}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Photos */}
        <div className="mt-14">
          <SectionLabel>Photos of Your Smile</SectionLabel>
          <p className="-mt-4 mb-6 text-xs leading-relaxed text-ivory/40">
            Optional, but they help Dr. Trev give you the most accurate guidance.
          </p>
          <div className="space-y-4">
            {photoFields.map((p) => (
              <PhotoField key={p.id} id={p.id} caption={p.caption} />
            ))}
          </div>
        </div>

        <div className="mt-12">
          <Magnetic>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-champagne px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-onyx transition-colors duration-300 hover:bg-gold"
            >
              Submit
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
