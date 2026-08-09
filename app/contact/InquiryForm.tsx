"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Magnetic from "../components/Magnetic";
import {
  getAnalyticsConsent,
  trackMetaLead,
} from "../components/MetaPixel";

type Intent = "" | "new" | "existing" | "general";

type Attribution = {
  landingUrl: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  fbclid: string;
  ttclid: string;
  entryChannel: string;
  entryAccount: string;
};

const CONSENT_VERSION = "2026-07-23-v1";
const TEAM_HANDLE = "@teethbytrev.team";
const TEAM_URL = "https://www.instagram.com/teethbytrev.team/";

const cities = [
  "Beverly Hills, CA",
  "New York, NY",
  "Atlanta, GA",
  "Houston, TX",
  "Miami, FL",
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
  "I am not sure yet",
];

const timelines = [
  "As soon as possible",
  "Within 1–3 months",
  "Within 3–6 months",
  "Within 6–12 months",
  "I am researching for the future",
];

const readinessOptions = [
  "I am ready to schedule a consultation",
  "I would like the concierge team to contact me first",
  "I am comparing options",
  "I am researching for the future",
];

const hearOptions = [
  "Instagram — @dr.trevthomas",
  "Instagram — @teethbytrev",
  "Instagram — @teethbytrev.team",
  "TikTok",
  "Facebook",
  "Google or another search engine",
  "Referred by a friend or patient",
  "Website",
  "Other",
];

const supportCategories = [
  "Appointment scheduling or change",
  "Post-appointment question",
  "Billing or financing question",
  "Records request",
  "Other support",
];

const generalEnquiryTypes = [
  "Media or speaking",
  "Partnership",
  "Vendor",
  "Employment",
  "General enquiry",
];

const branchSteps: Record<Exclude<Intent, "">, { label: string; title: string }[]> = {
  new: [
    { label: "Contact", title: "Let’s start with you." },
    { label: "Your Smile", title: "Tell us about your smile." },
    { label: "Investment", title: "Plan the next step with confidence." },
    { label: "Permission", title: "Choose how our team should respond." },
  ],
  existing: [
    { label: "Contact", title: "Help us find the right patient record." },
    { label: "Support", title: "Tell us what kind of help you need." },
    { label: "Permission", title: "Choose how our team should respond." },
  ],
  general: [
    { label: "Contact", title: "Tell us how to reach you." },
    { label: "Enquiry", title: "What would you like to discuss?" },
    { label: "Permission", title: "Choose how our team should respond." },
  ],
};

const inputBase =
  "w-full border bg-ivory/[0.03] px-4 py-3.5 text-ivory placeholder:text-ivory/30 transition-colors duration-300 focus:bg-ivory/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50";
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

function IntentMark({ kind }: { kind: Exclude<Intent, ""> }) {
  const paths = {
    new: (
      <>
        <path d="M12 3c2.8 0 5 2.2 5 5 0 4.4-2.8 9.4-5 13-2.2-3.6-5-8.6-5-13 0-2.8 2.2-5 5-5Z" />
        <path d="M9.5 8.5h5M12 6v5" />
      </>
    ),
    existing: (
      <>
        <path d="M5 5h14v14H5z" />
        <path d="M8 9h8M8 12h8M8 15h5" />
      </>
    ),
    general: (
      <>
        <path d="M4 6h16v12H4z" />
        <path d="m5 7 7 6 7-6" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-7 w-7"
    >
      {paths[kind]}
    </svg>
  );
}

function ChoiceButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-4 py-3 text-left text-sm leading-snug transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
        active
          ? "border-gold/70 bg-gold/10 text-ivory"
          : "border-ivory/15 text-ivory/70 hover:border-ivory/35"
      }`}
    >
      {children}
    </button>
  );
}

export default function InquiryForm() {
  const [intent, setIntent] = useState<Intent>("");
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leadReference, setLeadReference] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submissionTokenRef = useRef("");

  const [attribution, setAttribution] = useState<Attribution>({
    landingUrl: "",
    referrer: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmContent: "",
    utmTerm: "",
    fbclid: "",
    ttclid: "",
    entryChannel: "",
    entryAccount: "",
  });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    preferredContact: "",
    socialPlatform: "",
    socialHandle: "",
    city: "",
    goals: "",
    timeline: "",
    budget: "",
    financing: "",
    readiness: "",
    hear: "",
    supportCategory: "",
    appointmentDate: "",
    supportMessage: "",
    organization: "",
    enquiryType: "",
    message: "",
  });
  const [services, setServices] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [contactConsent, setContactConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const routedIntent = params.get("intent");

    submissionTokenRef.current =
      window.crypto?.randomUUID?.() ||
      `tbt-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const utmSource = params.get("utm_source") || "";
    const utmContent = params.get("utm_content") || "";
    const frame = requestAnimationFrame(() => {
      if (
        routedIntent === "new" ||
        routedIntent === "existing" ||
        routedIntent === "general"
      ) {
        setIntent(routedIntent);
      }
      setAttribution({
        landingUrl: window.location.href,
        referrer: document.referrer,
        utmSource,
        utmMedium: params.get("utm_medium") || "",
        utmCampaign: params.get("utm_campaign") || "",
        utmContent,
        utmTerm: params.get("utm_term") || "",
        fbclid: params.get("fbclid") || "",
        ttclid: params.get("ttclid") || "",
        entryChannel: params.get("entry_channel") || utmSource,
        entryAccount: params.get("entry_account") || utmContent,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const steps = intent ? branchSteps[intent] : [];
  const isLast = Boolean(intent) && step === steps.length - 1;

  const set =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { value } = e.target;
      setForm((current) => ({ ...current, [key]: value }));
      setErrors((current) => {
        if (!current[key]) return current;
        const next = { ...current };
        delete next[key];
        return next;
      });
    };

  const inputCls = (key: string) =>
    `${inputBase} ${
      errors[key]
        ? "border-rose-400/70"
        : "border-ivory/15 focus:border-champagne"
    }`;

  const ErrorMessage = ({ name }: { name: string }) =>
    errors[name] ? (
      <p className="mt-2 text-xs text-rose-300/90" role="alert">
        {errors[name]}
      </p>
    ) : null;

  const chooseIntent = (nextIntent: Exclude<Intent, "">) => {
    setIntent(nextIntent);
    setStep(0);
    setErrors({});
    setSubmitError("");
    window.requestAnimationFrame(() => {
      document
        .getElementById("inquiry-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const toggleService = (service: string) => {
    setServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
    setErrors((current) => {
      if (!current.services) return current;
      const next = { ...current };
      delete next.services;
      return next;
    });
  };

  const validate = (index: number): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!intent) return next;

    if (index === 0) {
      if (!form.firstName.trim()) next.firstName = "Required";
      if (!form.lastName.trim()) next.lastName = "Required";
      if (intent !== "general" && !form.phone.trim()) next.phone = "Required";
      if (!form.email.trim()) next.email = "Required";
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
        next.email = "Enter a valid email address";
      if (!form.preferredContact)
        next.preferredContact = "Choose a contact method";
      // Required for every enquiry, whatever the preferred contact method.
      if (!form.socialHandle.trim()) {
        next.socialHandle = "Enter your Instagram username";
      }
    }

    if (intent === "new" && index === 1) {
      if (!form.city) next.city = "Choose a city";
      if (!services.length) next.services = "Choose at least one service";
      if (!form.goals.trim()) next.goals = "Tell us a little about your goals";
      if (!form.timeline) next.timeline = "Choose a timeline";
      if (!photos.length)
        next.photos = "Add at least one photo of your smile";
    }

    if (intent === "new" && index === 2) {
      if (!form.budget) next.budget = "Choose an investment range";
      if (!form.financing) next.financing = "Choose one option";
      if (!form.readiness) next.readiness = "Choose your next step";
    }

    if (intent === "existing" && index === 1) {
      if (!form.city) next.city = "Choose a city";
      if (!form.supportCategory)
        next.supportCategory = "Choose a support category";
      if (!form.supportMessage.trim())
        next.supportMessage = "Add a short description";
      if (!photos.length)
        next.photos = "Add at least one photo of your smile";
    }

    if (intent === "general" && index === 1) {
      if (!form.enquiryType) next.enquiryType = "Choose an enquiry type";
      if (!form.message.trim()) next.message = "Add a short message";
      if (!photos.length)
        next.photos = "Add at least one photo of your smile";
    }

    if (index === steps.length - 1 && !contactConsent) {
      next.contactConsent = "Permission is required so the team can respond";
    }

    return next;
  };

  const scrollTop = () => {
    document
      .getElementById("inquiry-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goNext = () => {
    const nextErrors = validate(step);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    setErrors({});
    setStep((current) => Math.min(current + 1, steps.length - 1));
    scrollTop();
  };

  const goBack = () => {
    setErrors({});
    setSubmitError("");
    if (step === 0) {
      setIntent("");
      return;
    }
    setStep((current) => Math.max(current - 1, 0));
    scrollTop();
  };

  const handleSubmit = async () => {
    if (!intent || submitting) return;

    for (let index = 0; index < steps.length; index += 1) {
      const nextErrors = validate(index);
      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        setStep(index);
        scrollTop();
        return;
      }
    }

    setSubmitting(true);
    setSubmitError("");
    const analyticsConsent = getAnalyticsConsent() === "granted";

    try {
      // Downscale the required smile photos in-browser and send them as base64
      // data URLs — every enquiry type submits photos.
      const photoPayload = (
        await Promise.all(
          photos.map(async (file, index) => {
            const dataUrl = await photoToDataUrl(file);
            if (!dataUrl) return null;
            const stem =
              file.name.replace(/\.[^.]+$/, "") || `photo-${index + 1}`;
            return { name: `${stem}.jpg`, dataUrl };
          }),
        )
      ).filter(Boolean);

      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          submissionToken:
            submissionTokenRef.current ||
            `tbt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          preferredContact: form.preferredContact,
          // The handle field is always an Instagram handle.
          socialPlatform: "Instagram",
          socialHandle: form.socialHandle,
          city: form.city,
          services,
          goals: form.goals,
          timeline: form.timeline,
          budget: form.budget,
          financing: form.financing,
          readiness: form.readiness,
          hear: form.hear,
          supportCategory: form.supportCategory,
          appointmentDate: form.appointmentDate,
          supportMessage: form.supportMessage,
          organization: form.organization,
          enquiryType: form.enquiryType,
          message: form.message,
          contactConsent,
          consentVersion: CONSENT_VERSION,
          marketingConsent,
          analyticsConsent,
          attribution,
          photos: photoPayload,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result?.ok || result?.recorded === false) {
        throw new Error(
          result?.error ||
            "Your enquiry was not saved. Please check your connection and try again.",
        );
      }

      setLeadReference(result.leadReference || "");
      if (analyticsConsent) {
        trackMetaLead(
          result.metaEventId ||
            submissionTokenRef.current ||
            result.leadReference,
        );
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Your enquiry was not saved. Please try again.",
      );
      scrollTop();
    } finally {
      setSubmitting(false);
    }
  };

  const handoffMessage = `Hi, I just completed the Teeth by Trev ${
    intent === "new" ? "smile assessment" : "enquiry"
  }. My reference is ${leadReference}.`;

  const copyHandoff = async () => {
    try {
      await navigator.clipboard.writeText(handoffMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl border border-ivory/10 bg-white/[0.02] px-6 py-12 text-center sm:px-12 sm:py-16">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">
          <Check />
        </div>
        <p className="text-[0.6rem] uppercase tracking-[0.32em] text-gold">
          Concierge handoff
        </p>
        <h2 className="mt-4 font-serif text-4xl font-light text-ivory sm:text-5xl">
          Thank you — your enquiry is with our team.
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-ivory/65">
          A Teeth by Trev concierge team member will review your submission and
          respond using the contact method you selected.
        </p>

        <div className="mx-auto mt-10 max-w-lg border border-gold/25 bg-gold/[0.05] p-6 text-left">
          <p className="text-[0.58rem] uppercase tracking-[0.25em] text-ivory/45">
            Your private reference
          </p>
          <p className="mt-2 font-serif text-3xl font-light tracking-wide text-gold">
            {leadReference}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ivory/60">
            Keep this reference. It lets our team match your Instagram
            conversation with your form securely.
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-lg border border-ivory/10 p-5 text-left">
          <p className="text-[0.58rem] uppercase tracking-[0.25em] text-ivory/45">
            Message to send
          </p>
          <p
            id="handoff-message"
            className="mt-3 text-sm leading-relaxed text-ivory/75"
          >
            {handoffMessage}
          </p>
          <button
            type="button"
            onClick={copyHandoff}
            className="mt-4 text-[0.65rem] uppercase tracking-[0.2em] text-gold transition-colors hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            {copied ? "Copied" : "Copy message"}
          </button>
        </div>

        <p className="mx-auto mt-8 max-w-lg text-sm leading-relaxed text-ivory/60">
          For the fastest Instagram response, follow our official concierge
          account and send the message above. This starts the conversation in
          the correct team inbox.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Magnetic>
            <a
              href={TEAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-champagne px-7 py-4 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-onyx transition-colors hover:bg-gold"
            >
              Follow &amp; message {TEAM_HANDLE} →
            </a>
          </Magnetic>
          {intent === "new" &&
          form.readiness === "I am ready to schedule a consultation" ? (
            <Link
              href="/reserve?type=video"
              className="inline-flex items-center justify-center rounded-full border border-ivory/20 px-7 py-4 text-[0.68rem] uppercase tracking-[0.2em] text-ivory/75 transition-colors hover:border-gold hover:text-gold"
            >
              Reserve a private video consultation
            </Link>
          ) : (
            <Link
              href="/"
              className="text-[0.68rem] uppercase tracking-[0.2em] text-ivory/55 transition-colors hover:text-gold"
            >
              Return to the website
            </Link>
          )}
        </div>

        <p className="mx-auto mt-10 max-w-lg border-t border-ivory/10 pt-6 text-xs leading-relaxed text-ivory/40">
          Please do not send medical records, payment-card information,
          passwords or verification codes through social media.
        </p>
      </div>
    );
  }

  if (!intent) {
    const options: {
      kind: Exclude<Intent, "">;
      title: string;
      description: string;
    }[] = [
      {
        kind: "new",
        title: "New smile consultation",
        description:
          "Share your goals, timeline and investment readiness with our concierge team.",
      },
      {
        kind: "existing",
        title: "Existing-patient support",
        description:
          "Get help with an appointment, billing, records or a general support question.",
      },
      {
        kind: "general",
        title: "General or business enquiry",
        description:
          "Contact us about media, speaking, partnerships, vendors or employment.",
      },
    ];

    return (
      <form
        id="inquiry-form"
        noValidate
        onSubmit={(event) => event.preventDefault()}
        className="mx-auto max-w-3xl scroll-mt-28"
      >
        <div className="relative border border-ivory/10 bg-white/[0.02] p-6 sm:p-10 lg:p-12">
          <span className="pointer-events-none absolute left-0 top-0 h-14 w-px bg-gold/60" />
          <span className="pointer-events-none absolute left-0 top-0 h-px w-14 bg-gold/60" />
          <p className="text-[0.6rem] uppercase tracking-[0.34em] text-gold/75">
            Concierge desk
          </p>
          <h2 className="mt-4 font-serif text-3xl font-light leading-[1.1] text-ivory sm:text-4xl">
            How can the Teeth by Trev team help?
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory/55">
            Choose the option that best matches your enquiry. We will only ask
            for information relevant to that request.
          </p>

          <div className="mt-9 grid gap-4">
            {options.map((option) => (
              <button
                key={option.kind}
                type="button"
                onClick={() => chooseIntent(option.kind)}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 border border-ivory/15 p-5 text-left transition-colors hover:border-gold/60 hover:bg-gold/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 sm:p-6"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/35 text-gold transition-colors group-hover:border-gold">
                  <IntentMark kind={option.kind} />
                </span>
                <span>
                  <span className="block font-serif text-xl font-light text-ivory sm:text-2xl">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-ivory/50">
                    {option.description}
                  </span>
                </span>
                <span className="text-gold transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      </form>
    );
  }

  const renderContactStep = () => (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelClass}>
            First name <Req />
          </label>
          <input
            id="firstName"
            required
            aria-required="true"
            type="text"
            autoComplete="given-name"
            value={form.firstName}
            onChange={set("firstName")}
            className={inputCls("firstName")}
            aria-invalid={Boolean(errors.firstName)}
          />
          <ErrorMessage name="firstName" />
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>
            Last name <Req />
          </label>
          <input
            id="lastName"
            required
            aria-required="true"
            type="text"
            autoComplete="family-name"
            value={form.lastName}
            onChange={set("lastName")}
            className={inputCls("lastName")}
            aria-invalid={Boolean(errors.lastName)}
          />
          <ErrorMessage name="lastName" />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelClass}>
            Mobile number {intent !== "general" && <Req />}
          </label>
          <input
            id="phone"
            required={intent !== "general"}
            aria-required={intent !== "general"}
            type="tel"
            autoComplete="tel"
            placeholder="(424) 000-0000"
            value={form.phone}
            onChange={set("phone")}
            className={inputCls("phone")}
            aria-invalid={Boolean(errors.phone)}
          />
          <ErrorMessage name="phone" />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email address <Req />
          </label>
          <input
            id="email"
            required
            aria-required="true"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
            className={inputCls("email")}
            aria-invalid={Boolean(errors.email)}
          />
          <ErrorMessage name="email" />
        </div>
      </div>

      <div>
        <label htmlFor="preferredContact" className={labelClass}>
          How should our concierge team contact you? <Req />
        </label>
        <select
          id="preferredContact"
          required
          aria-required="true"
          value={form.preferredContact}
          onChange={(event) => {
            const preferredContact = event.target.value;
            // The Instagram handle is collected for every enquiry, so switching
            // contact method must never clear or hide it.
            setForm((current) => ({
              ...current,
              preferredContact,
              socialPlatform: "Instagram",
            }));
            setErrors((current) => {
              const next = { ...current };
              delete next.preferredContact;
              return next;
            });
          }}
          className={`${inputCls("preferredContact")} appearance-none`}
          aria-invalid={Boolean(errors.preferredContact)}
        >
          <option value="" disabled>
            Select a contact method
          </option>
          {["Instagram DM", "Text message", "Phone call", "Email"].map(
            (option) => (
              <option key={option} value={option} className="bg-onyx text-ivory">
                {option}
              </option>
            ),
          )}
        </select>
        <ErrorMessage name="preferredContact" />
      </div>

      {/* The Instagram handle is required for every enquiry regardless of the
          preferred contact method — it is how the concierge team matches the
          enquiry to the visitor's profile. */}
      <div className="border-l border-gold/45 pl-5">
        <label htmlFor="socialHandle" className={labelClass}>
          Your Instagram username <Req />
        </label>
        <input
          id="socialHandle"
          required
          aria-required="true"
          type="text"
          autoComplete="off"
          placeholder="@yourusername"
          value={form.socialHandle}
          onChange={set("socialHandle")}
          className={inputCls("socialHandle")}
          aria-invalid={Boolean(errors.socialHandle)}
        />
        <ErrorMessage name="socialHandle" />
        <p className="mt-3 text-xs leading-relaxed text-ivory/45">
          {form.preferredContact === "Instagram DM"
            ? `Our official concierge response may come from ${TEAM_HANDLE}. You will see this again after submission so you can follow and message the correct account.`
            : "This lets our concierge team connect your enquiry with your Instagram profile."}
        </p>
      </div>
    </div>
  );

  // Smile photos are required for every enquiry type, so each branch's
  // substance step embeds this same upload block (state is shared, so photos
  // survive switching enquiry type).
  const renderPhotoUpload = (note: string) => (
    <div>
      <p className={labelClass}>
        Photos of your smile <Req />
      </p>
      <label
        htmlFor="photos"
        className={`flex cursor-pointer flex-col items-center justify-center border border-dashed bg-ivory/[0.02] px-6 py-10 text-center transition-colors hover:border-gold/60 ${
          errors.photos ? "border-rose-400/70" : "border-ivory/25"
        }`}
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
          aria-required="true"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (files.length) {
              setPhotos((current) => [...current, ...files]);
              setErrors((current) => {
                const next = { ...current };
                delete next.photos;
                return next;
              });
            }
            event.target.value = "";
          }}
        />
      </label>
      {photos.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {photos.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 border border-gold/30 px-3 py-1 text-xs text-gold"
            >
              {file.name}
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() =>
                  setPhotos((current) => current.filter((_, i) => i !== index))
                }
                className="text-gold/60 transition-colors hover:text-gold"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <ErrorMessage name="photos" />
      <p className="mt-3 text-xs text-ivory/40">{note}</p>
    </div>
  );

  const renderNewSmileStep = () => (
    <div className="space-y-9">
      <div>
        <label htmlFor="city" className={labelClass}>
          Which city would you like to be seen in? <Req />
        </label>
        <select
          id="city"
          required
          aria-required="true"
          value={form.city}
          onChange={set("city")}
          className={`${inputCls("city")} appearance-none`}
          aria-invalid={Boolean(errors.city)}
        >
          <option value="" disabled>
            Select a city
          </option>
          {cities.map((city) => (
            <option key={city} value={city} className="bg-onyx text-ivory">
              {city}
            </option>
          ))}
        </select>
        <ErrorMessage name="city" />
      </div>

      <fieldset>
        <legend className={labelClass}>
          Services you are interested in <Req />
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {serviceOptions.map((service) => (
            <ChoiceButton
              key={service}
              active={services.includes(service)}
              onClick={() => toggleService(service)}
            >
              <span className="flex items-center justify-between gap-2">
                {service}
                {services.includes(service) && (
                  <Check className="h-3.5 w-3.5 text-gold" />
                )}
              </span>
            </ChoiceButton>
          ))}
        </div>
        <ErrorMessage name="services" />
      </fieldset>

      <div>
        <label htmlFor="goals" className={labelClass}>
          Your goals and concerns <Req />
        </label>
        <textarea
          id="goals"
          required
          aria-required="true"
          rows={5}
          placeholder="What would you like to change or improve about your smile?"
          value={form.goals}
          onChange={set("goals")}
          className={`${inputCls("goals")} resize-none`}
          aria-invalid={Boolean(errors.goals)}
        />
        <ErrorMessage name="goals" />
      </div>

      <div>
        <label htmlFor="timeline" className={labelClass}>
          When would you like to begin? <Req />
        </label>
        <select
          id="timeline"
          required
          aria-required="true"
          value={form.timeline}
          onChange={set("timeline")}
          className={`${inputCls("timeline")} appearance-none`}
          aria-invalid={Boolean(errors.timeline)}
        >
          <option value="" disabled>
            Select a timeline
          </option>
          {timelines.map((timeline) => (
            <option
              key={timeline}
              value={timeline}
              className="bg-onyx text-ivory"
            >
              {timeline}
            </option>
          ))}
        </select>
        <ErrorMessage name="timeline" />
      </div>

      {renderPhotoUpload(
        "JPG, PNG or HEIC. Photos help Dr. Trev assess your smile and prepare an accurate plan before your consultation.",
      )}
    </div>
  );

  const renderInvestmentStep = () => (
    <div className="space-y-10">
      <fieldset>
        <legend className={labelClass}>
          What investment range are you currently planning? <Req />
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {budgets.map((budget) => (
            <ChoiceButton
              key={budget}
              active={form.budget === budget}
              onClick={() => {
                setForm((current) => ({ ...current, budget }));
                setErrors((current) => {
                  const next = { ...current };
                  delete next.budget;
                  return next;
                });
              }}
            >
              {budget}
            </ChoiceButton>
          ))}
        </div>
        <ErrorMessage name="budget" />
        <p className="mt-4 text-xs leading-relaxed text-ivory/45">
          This helps the team prepare relevant options. It does not determine
          your clinical eligibility.
        </p>
      </fieldset>

      <fieldset>
        <legend className={labelClass}>
          Would financing or monthly payment options be helpful? <Req />
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            "Yes",
            "No, I plan to pay directly",
            "I am not sure yet",
          ].map((financing) => (
            <ChoiceButton
              key={financing}
              active={form.financing === financing}
              onClick={() => {
                setForm((current) => ({ ...current, financing }));
                setErrors((current) => {
                  const next = { ...current };
                  delete next.financing;
                  return next;
                });
              }}
            >
              {financing}
            </ChoiceButton>
          ))}
        </div>
        <ErrorMessage name="financing" />
      </fieldset>

      <fieldset>
        <legend className={labelClass}>
          Which best describes your next step? <Req />
        </legend>
        <div className="grid gap-3">
          {readinessOptions.map((readiness) => (
            <ChoiceButton
              key={readiness}
              active={form.readiness === readiness}
              onClick={() => {
                setForm((current) => ({ ...current, readiness }));
                setErrors((current) => {
                  const next = { ...current };
                  delete next.readiness;
                  return next;
                });
              }}
            >
              {readiness}
            </ChoiceButton>
          ))}
        </div>
        <ErrorMessage name="readiness" />
      </fieldset>
    </div>
  );

  const renderExistingSupportStep = () => (
    <div className="space-y-8">
      <div>
        <label htmlFor="city" className={labelClass}>
          Preferred office or city <Req />
        </label>
        <select
          id="city"
          required
          aria-required="true"
          value={form.city}
          onChange={set("city")}
          className={`${inputCls("city")} appearance-none`}
          aria-invalid={Boolean(errors.city)}
        >
          <option value="" disabled>
            Select a city
          </option>
          {cities.map((city) => (
            <option key={city} value={city} className="bg-onyx text-ivory">
              {city}
            </option>
          ))}
        </select>
        <ErrorMessage name="city" />
      </div>

      <div>
        <label htmlFor="supportCategory" className={labelClass}>
          Support category <Req />
        </label>
        <select
          id="supportCategory"
          required
          aria-required="true"
          value={form.supportCategory}
          onChange={set("supportCategory")}
          className={`${inputCls("supportCategory")} appearance-none`}
          aria-invalid={Boolean(errors.supportCategory)}
        >
          <option value="" disabled>
            Select a category
          </option>
          {supportCategories.map((category) => (
            <option
              key={category}
              value={category}
              className="bg-onyx text-ivory"
            >
              {category}
            </option>
          ))}
        </select>
        <ErrorMessage name="supportCategory" />
      </div>

      <div>
        <label htmlFor="appointmentDate" className={labelClass}>
          Appointment date, if applicable
        </label>
        <input
          id="appointmentDate"
          type="date"
          value={form.appointmentDate}
          onChange={set("appointmentDate")}
          className={inputCls("appointmentDate")}
        />
      </div>

      <div>
        <label htmlFor="supportMessage" className={labelClass}>
          Short description <Req />
        </label>
        <textarea
          id="supportMessage"
          required
          aria-required="true"
          rows={5}
          placeholder="Share only the details our support team needs to route your request."
          value={form.supportMessage}
          onChange={set("supportMessage")}
          className={`${inputCls("supportMessage")} resize-none`}
          aria-invalid={Boolean(errors.supportMessage)}
        />
        <ErrorMessage name="supportMessage" />
        <p className="mt-3 text-xs leading-relaxed text-ivory/45">
          Do not use this form or social media for urgent clinical concerns.
          Contact the treating office or emergency services as appropriate.
        </p>
      </div>

      {renderPhotoUpload(
        "JPG, PNG or HEIC. Current photos of your smile help the team review your request accurately.",
      )}
    </div>
  );

  const renderGeneralEnquiryStep = () => (
    <div className="space-y-8">
      <div>
        <label htmlFor="organization" className={labelClass}>
          Organization, if applicable
        </label>
        <input
          id="organization"
          type="text"
          value={form.organization}
          onChange={set("organization")}
          className={inputCls("organization")}
        />
      </div>

      <div>
        <label htmlFor="enquiryType" className={labelClass}>
          Enquiry type <Req />
        </label>
        <select
          id="enquiryType"
          required
          aria-required="true"
          value={form.enquiryType}
          onChange={set("enquiryType")}
          className={`${inputCls("enquiryType")} appearance-none`}
          aria-invalid={Boolean(errors.enquiryType)}
        >
          <option value="" disabled>
            Select an enquiry type
          </option>
          {generalEnquiryTypes.map((enquiryType) => (
            <option
              key={enquiryType}
              value={enquiryType}
              className="bg-onyx text-ivory"
            >
              {enquiryType}
            </option>
          ))}
        </select>
        <ErrorMessage name="enquiryType" />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message <Req />
        </label>
        <textarea
          id="message"
          required
          aria-required="true"
          rows={6}
          value={form.message}
          onChange={set("message")}
          className={`${inputCls("message")} resize-none`}
          aria-invalid={Boolean(errors.message)}
        />
        <ErrorMessage name="message" />
      </div>

      {renderPhotoUpload(
        "JPG, PNG or HEIC. Current photos of your smile help the team review your request accurately.",
      )}
    </div>
  );

  const renderPermissionStep = () => (
    <div className="space-y-8">
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
          {hearOptions.map((option) => (
            <option key={option} value={option} className="bg-onyx text-ivory">
              {option}
            </option>
          ))}
        </select>
        <p className="mt-3 text-xs leading-relaxed text-ivory/40">
          This answer is secondary to the campaign information captured
          automatically from your link.
        </p>
      </div>

      <div>
        <label
          htmlFor="contactConsent"
          className={`flex cursor-pointer items-start gap-4 border p-5 transition-colors ${
            errors.contactConsent
              ? "border-rose-400/70 bg-rose-400/[0.04]"
              : "border-gold/30 bg-gold/[0.05] hover:border-gold/60"
          }`}
        >
          <input
            id="contactConsent"
            required
            aria-required="true"
            type="checkbox"
            checked={contactConsent}
            onChange={(event) => {
              setContactConsent(event.target.checked);
              setErrors((current) => {
                const next = { ...current };
                delete next.contactConsent;
                return next;
              });
            }}
            className="mt-1 h-4 w-4 shrink-0 accent-gold"
          />
          <span className="text-sm leading-relaxed text-ivory/80">
            I authorize the Teeth by Trev concierge team to contact me about
            this enquiry using my selected contact method. If I selected
            Instagram, I understand that the message may come from the official
            account <span className="text-gold">{TEAM_HANDLE}</span>. <Req />
          </span>
        </label>
        <ErrorMessage name="contactConsent" />
      </div>

      <label className="flex cursor-pointer items-start gap-4 border border-ivory/12 p-5 transition-colors hover:border-ivory/25">
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(event) => setMarketingConsent(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-gold"
        />
        <span className="text-sm leading-relaxed text-ivory/60">
          Optional: I would like to receive occasional Teeth by Trev news and
          offers. I can unsubscribe at any time.
        </span>
      </label>

      <p className="border-t border-ivory/10 pt-6 text-xs leading-relaxed text-ivory/45">
        Instagram and other social messages are for general conversation and
        scheduling. Do not send medical records, payment-card information,
        passwords or verification codes by DM.
      </p>
    </div>
  );

  const stepContent = () => {
    if (step === 0) return renderContactStep();
    if (intent === "new" && step === 1) return renderNewSmileStep();
    if (intent === "new" && step === 2) return renderInvestmentStep();
    if (intent === "existing" && step === 1)
      return renderExistingSupportStep();
    if (intent === "general" && step === 1)
      return renderGeneralEnquiryStep();
    return renderPermissionStep();
  };

  return (
    <form
      id="inquiry-form"
      noValidate
      onSubmit={(event) => event.preventDefault()}
      className="mx-auto max-w-3xl scroll-mt-28"
    >
      <div className="mb-7 flex items-center justify-between gap-4">
        <p className="text-[0.6rem] uppercase tracking-[0.25em] text-ivory/40">
          {intent === "new"
            ? "New smile consultation"
            : intent === "existing"
              ? "Existing-patient support"
              : "General or business enquiry"}
        </p>
        <button
          type="button"
          onClick={() => {
            setIntent("");
            setStep(0);
            setErrors({});
          }}
          className="text-[0.6rem] uppercase tracking-[0.2em] text-gold transition-colors hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          Change enquiry type
        </button>
      </div>

      <ol className="mb-10 flex items-center" aria-label="Form progress">
        {steps.map((currentStep, index) => {
          const done = index < step;
          const current = index === step;
          return (
            <li
              key={currentStep.label}
              className={`flex items-center ${
                index < steps.length - 1 ? "flex-1" : ""
              }`}
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
                  aria-current={current ? "step" : undefined}
                >
                  {done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    `0${index + 1}`
                  )}
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
                  {currentStep.label}
                </span>
              </div>
              {index < steps.length - 1 && (
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
        <span className="pointer-events-none absolute left-0 top-0 h-12 w-px bg-gold/50" />
        <span className="pointer-events-none absolute left-0 top-0 h-px w-12 bg-gold/50" />

        <p className="text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">
          Step 0{step + 1} / 0{steps.length} — {steps[step].label}
        </p>
        <h2 className="mt-4 font-serif text-3xl font-light leading-[1.1] text-ivory sm:text-4xl">
          {steps[step].title}
        </h2>

        <div
          key={`${intent}-${step}`}
          className="mt-10 translate-y-0 opacity-100"
        >
          {stepContent()}
        </div>

        {submitError && (
          <div
            className="mt-8 border border-rose-400/50 bg-rose-400/[0.05] p-4 text-sm leading-relaxed text-rose-200"
            role="alert"
          >
            {submitError}
          </div>
        )}

        <div className="mt-12 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-ivory/55 transition-colors duration-300 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            ← Back
          </button>

          {isLast ? (
            <Magnetic key="submit">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-3 rounded-full bg-champagne px-8 py-4 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-onyx transition-colors duration-300 hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              >
                {submitting ? "Saving your enquiry…" : "Send to the concierge team"}
              </button>
            </Magnetic>
          ) : (
            <Magnetic key="next">
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-3 rounded-full bg-champagne px-8 py-4 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-onyx transition-colors duration-300 hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              >
                Continue →
              </button>
            </Magnetic>
          )}
        </div>
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-ivory/40">
        Your information is kept private and used to respond to this enquiry.
        Clinical records and card details are never collected in this form.
      </p>
    </form>
  );
}
