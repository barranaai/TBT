import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy & Analytics — Teeth by Trev",
  description:
    "How Teeth by Trev handles website enquiries and optional analytics.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-ink px-6 py-28 text-ivory lg:px-10">
      <article className="mx-auto max-w-3xl">
        <p className="text-[0.62rem] uppercase tracking-[0.3em] text-gold">
          Privacy &amp; analytics
        </p>
        <h1 className="mt-5 font-serif text-5xl font-light sm:text-6xl">
          Your information stays under your control.
        </h1>
        <div className="mt-10 space-y-8 text-base leading-relaxed text-ivory/70">
          <section>
            <h2 className="font-serif text-3xl font-light text-ivory">
              Enquiry information
            </h2>
            <p className="mt-3">
              Information you submit is used to route your enquiry, let the
              concierge team respond, and maintain an internal lead record.
              Please do not submit medical records, payment-card details,
              passwords or verification codes through the form or social media.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-3xl font-light text-ivory">
              Optional Meta analytics
            </h2>
            <p className="mt-3">
              Analytics is off by default. If you select “Allow analytics,” the
              site may send Meta a page-visit signal and a generic Lead event
              after an enquiry is successfully saved. The site does not send
              Meta your name, email address, phone number, treatment choices,
              budget, messages, photos or clinical information.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-3xl font-light text-ivory">
              Change your choice
            </h2>
            <p className="mt-3">
              Use the “Privacy choices” control at the bottom of any page to
              allow or turn off optional analytics. Your preference is stored
              in your browser.
            </p>
          </section>
        </div>
        <Link
          href="/"
          className="mt-12 inline-flex rounded-full border border-ivory/25 px-6 py-3 text-[0.68rem] uppercase tracking-[0.18em] text-ivory transition-colors hover:border-gold hover:text-gold"
        >
          Return to Teeth by Trev
        </Link>
      </article>
    </main>
  );
}
