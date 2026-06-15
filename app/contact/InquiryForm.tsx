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
  { id: "photo-bite", caption: "Photo of your natural smile while biting down." },
  { id: "photo-top", caption: "Photo of your top teeth with your lip lifted." },
  {
    id: "photo-bottom",
    caption: "Photo of your bottom teeth with your lip pulled down.",
  },
  { id: "photo-left", caption: "Photo of your mouth open from a left angle." },
  { id: "photo-right", caption: "Photo of your mouth open from a right angle." },
];

const inputClass =
  "w-full border border-ivory/25 bg-transparent px-4 py-3 text-ivory placeholder:text-ivory/30 transition-colors focus:border-champagne focus:outline-none";
const selectClass = `${inputClass} appearance-none`;
const labelClass = "eyebrow mb-3 block text-champagne";

function Req() {
  return <span className="text-gold">*</span>;
}

function PhotoField({ id, caption }: { id: string; caption: string }) {
  const [name, setName] = useState<string | null>(null);
  return (
    <div>
      <label
        htmlFor={id}
        className="inline-flex cursor-pointer items-center gap-3 border border-ivory/25 px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.18em] text-ivory/70 transition-colors hover:border-champagne hover:text-ivory"
      >
        <span aria-hidden="true">📷</span>
        {name ? "Replace file" : "Choose a file"}
        <input
          id={id}
          name={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setName(e.target.files?.[0]?.name ?? null)}
        />
      </label>
      <p className="mt-2 text-xs text-ivory/45">
        {name ? <span className="text-gold">{name}</span> : caption}
      </p>
    </div>
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
      <p className="mb-12 text-base leading-relaxed text-ivory/65">
        <span className="font-medium text-ivory">
          Book Your Consultation Today!
        </span>{" "}
        Take the first step toward achieving the smile you&apos;ve always
        wanted. Enter your information below and we&apos;ll confirm your
        appointment shortly.
      </p>

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
      <div className="mt-12">
        <p className="mb-6 text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">
          Photos of Your Smile
        </p>
        <div className="space-y-6">
          {photoFields.map((p) => (
            <PhotoField key={p.id} id={p.id} caption={p.caption} />
          ))}
        </div>
      </div>

      <div className="mt-12">
        <Magnetic>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-champagne px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-onyx transition-colors duration-300 hover:bg-gold"
          >
            Submit
          </button>
        </Magnetic>
      </div>
    </form>
  );
}
