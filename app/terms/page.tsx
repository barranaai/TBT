import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions — Teeth by Trev",
  description:
    "Website and text messaging terms for Teeth by Trev, operated by Trevor Jamal Thomas DDS, Inc.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-ink px-6 py-28 text-ivory lg:px-10">
      <article className="mx-auto max-w-3xl">
        <p className="text-[0.62rem] uppercase tracking-[0.3em] text-gold">
          Terms &amp; Conditions
        </p>
        <h1 className="mt-5 font-serif text-5xl font-light sm:text-6xl">
          The terms of working with us.
        </h1>
        <div className="mt-6 space-y-1 text-sm leading-relaxed text-ivory/45">
          <p>
            Teeth by Trev is operated by Trevor Jamal Thomas DDS, Inc., a
            California professional corporation.
          </p>
          <p>
            Registered business address: 8605 Santa Monica Blvd #691841, West
            Hollywood, CA 90069
          </p>
          <p>
            Practice location: 436 N Bedford Dr #300, Beverly Hills, CA 90210 ·
            424-394-6159 · SMS program: 424-672-3910 ·
            dr.trev@teethbytrev.com
          </p>
        </div>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-ivory/70">
          <section>
            <h2 className="font-serif text-3xl font-light text-ivory">
              Business identity
            </h2>
            <p className="mt-3">
              Teeth by Trev is the public-facing brand of Trevor Jamal Thomas
              DDS, Inc. References to “Teeth by Trev,” “we,” “us,” or “our” in
              these terms mean Trevor Jamal Thomas DDS, Inc.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-light text-ivory">
              Text messaging program
            </h2>
            <p className="mt-3">
              By ticking the optional text-message box on our contact form, you
              agree to receive service text messages from Teeth by Trev at the
              mobile number you provide. These messages relate to your enquiry
              and your care: appointment availability and reminders, booking and
              payment confirmations, rescheduling, and follow-ups about your
              enquiry.
            </p>
            <p className="mt-3">
              Message frequency varies, and is typically two to four messages
              per month depending on your appointments. Message and data rates
              may apply. Consent is not a condition of any purchase or of using
              our services. No mobile information will be shared with third
              parties or affiliates for marketing or promotional purposes.
              Information sharing to subcontractors in support services, such as
              customer service, is permitted.
            </p>
            <p className="mt-3">
              You can opt out at any time by replying STOP, END, QUIT, CANCEL,
              UNSUBSCRIBE, REVOKE or OPT-OUT to any message. Keywords are not
              case sensitive. We will send a single message confirming that you
              have been removed, after which you will receive no further texts.
              You may also opt out by calling 424-394-6159, emailing
              dr.trev@teethbytrev.com, or simply asking us in your own words to
              stop texting you; we honor every request. Reply HELP for
              assistance at any time.
            </p>
            <p className="mt-3">
              Carriers are not liable for delayed or undelivered messages.
              Delivery depends on your mobile carrier and is not guaranteed. How
              we handle the information collected for this program is described
              in our{" "}
              <Link href="/privacy" className="text-gold underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-light text-ivory">
              No medical advice
            </h2>
            <p className="mt-3">
              This website, our messages, and our social media accounts are for
              general information and scheduling. They are not medical or dental
              advice, and they are not a substitute for an in-person examination
              or a consultation with a licensed clinician. Using this site or
              submitting an enquiry does not create a doctor-patient
              relationship. For urgent clinical concerns, contact the treating
              office or emergency services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-light text-ivory">
              Consultations and deposits
            </h2>
            <p className="mt-3">
              A private video consultation may be reserved with a $250 deposit,
              which is credited in full toward your treatment. Payments are
              processed securely by Square; we never receive or store your card
              details. Consultations are by appointment and limited each month.
              To reschedule or ask about a deposit, contact us at 424-394-6159.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-light text-ivory">
              Use of this site
            </h2>
            <p className="mt-3">
              You agree to use this site lawfully and not to disrupt it or
              attempt to access areas you are not authorized to use. Please do
              not submit medical records, payment-card details, passwords or
              verification codes through the contact form or social media.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-light text-ivory">
              Content and photography
            </h2>
            <p className="mt-3">
              All text, photography, and branding on this site belong to Teeth
              by Trev unless stated otherwise, and may not be reproduced without
              permission. Treatment images represent individual patients;
              results vary from person to person and are not a guarantee of any
              particular outcome. Links to third-party sites, including
              financing partners, are provided for convenience, and we are not
              responsible for their content or practices.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-light text-ivory">
              Changes and contact
            </h2>
            <p className="mt-3">
              We may update these terms from time to time; the version published
              here is the one that applies. Questions about these terms are
              welcome at dr.trev@teethbytrev.com or 424-394-6159, or by post to
              the registered business address at 8605 Santa Monica Blvd
              #691841, West Hollywood, CA 90069. Practice correspondence may
              also be sent to 436 N Bedford Dr #300, Beverly Hills, CA 90210.
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
