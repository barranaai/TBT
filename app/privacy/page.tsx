import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Teeth by Trev",
  description:
    "How Teeth by Trev handles website enquiries, text messaging, and optional analytics.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-ink px-6 py-28 text-ivory lg:px-10">
      <article className="mx-auto max-w-3xl">
        <p className="text-[0.62rem] uppercase tracking-[0.3em] text-gold">
          Privacy Policy
        </p>
        <h1 className="mt-5 font-serif text-5xl font-light sm:text-6xl">
          Your information stays under your control.
        </h1>
        <p className="mt-6 text-sm text-ivory/45">
          Teeth by Trev · Trevor J. Thomas, DDS · 436 N Bedford Dr #300, Beverly
          Hills, CA 90210 · 424-394-6159
        </p>
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
              Text messaging (SMS)
            </h2>
            <p className="mt-3">
              If you tick the optional text-message box on our contact form, we
              collect your mobile number and your consent so we can send service
              messages about your enquiry and your care — appointment
              availability, booking and payment confirmations, rescheduling,
              and follow-ups. Consent is not a condition of any purchase or of
              using our services, and you may still submit the form without it.
              Message frequency varies. Message and data rates may apply.
            </p>
            <p className="mt-3">
              <strong className="font-normal text-ivory">
                No mobile information will be shared with third parties or
                affiliates for marketing or promotional purposes. All other
                categories exclude text messaging originator opt-in data and
                consent; this information will not be shared with any third
                parties.
              </strong>{" "}
              We do not share, sell, rent, or transfer your mobile phone number
              or SMS consent data to third parties or affiliates for marketing
              or promotional purposes. Your number is used only by Teeth by Trev
              and the messaging provider that delivers our texts on our behalf.
            </p>
            <p className="mt-3">
              You may opt out at any time by replying STOP, UNSUBSCRIBE or
              CANCEL to any message; we will send one confirmation of your
              removal. Reply HELP for assistance, call 424-394-6159, or email
              TeethByTrev@gmail.com. Full messaging terms are in our{" "}
              <Link href="/terms" className="text-gold underline-offset-4 hover:underline">
                Terms &amp; Conditions
              </Link>
              .
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
              budget, messages, photos or clinical information. This analytics
              signal never includes text messaging opt-in data or consent.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-light text-ivory">
              Change your choice
            </h2>
            <p className="mt-3">
              Use the “Privacy choices” control at the bottom of any page to
              allow or turn off optional analytics. Your preference is stored in
              your browser. To stop text messages, reply STOP to any message. To
              stop marketing email, use the unsubscribe link in any message. To
              request removal of your enquiry record, contact us at
              TeethByTrev@gmail.com or 424-394-6159.
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
