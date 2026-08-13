import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

// Public documentation of the SMS opt-in flow, for mobile-carrier campaign
// review (A2P 10DLC). Reviewers must be able to load this without an account,
// so it is public — but noindex, since it is not marketing content.
export const metadata: Metadata = {
  title: "SMS Opt-In Flow — Teeth by Trev",
  description:
    "How Teeth by Trev, operated by Trevor Jamal Thomas DDS, Inc., collects consent to send service text messages.",
  robots: { index: false, follow: false },
};

const CONSENT_TEXT =
  "Optional: I agree to receive service text messages (SMS) from Teeth by Trev at the mobile number provided — appointment availability, booking and payment confirmations, rescheduling, and follow-ups. Message frequency varies. Message and data rates may apply. Consent is not a condition of purchase. Reply STOP, END, QUIT, CANCEL or UNSUBSCRIBE to opt out, or HELP for help. See our Privacy Policy and Terms & Conditions.";

const steps = [
  {
    file: "01-choose-enquiry-type.jpg",
    title: "Choose an enquiry type",
    body: "The visitor first selects the kind of enquiry. This screenshot shows the page as it loads at teethbytrev.com/contact.",
  },
  {
    file: "02-step1-contact.jpg",
    title: "Step 01 — Contact",
    body: "Name, mobile number, email, preferred contact method and Instagram username. The mobile number entered here is the number the opt-in applies to.",
  },
  {
    file: "03-step2-your-smile.jpg",
    title: "Step 02 — Your Smile",
    body: "Treatment interests and goals. Photographs are optional.",
  },
  {
    file: "04-step3-investment.jpg",
    title: "Step 03 — Investment",
    body: "Budget, financing preference, and whether the visitor would like a private video consultation.",
  },
  {
    file: "05-step4-permission-sms-optin.jpg",
    title: "Step 04 — Permission (the SMS opt-in)",
    body: "The text-message consent checkbox. It is separate from every other permission, unchecked by default, and never required — the enquiry can be submitted with it left unticked. The disclosures and both policy links sit beside the checkbox itself.",
  },
];

export default function SmsOptInPage() {
  return (
    <main className="min-h-screen bg-ink px-6 py-28 text-ivory lg:px-10">
      <article className="mx-auto max-w-3xl">
        <p className="text-[0.62rem] uppercase tracking-[0.3em] text-gold">
          SMS opt-in flow
        </p>
        <h1 className="mt-5 font-serif text-5xl font-light sm:text-6xl">
          How we collect consent to text you.
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

        <div className="mt-10 space-y-6 text-base leading-relaxed text-ivory/70">
          <p>
            This page documents, step by step, the only way we collect
            permission to send text messages: a checkbox on our own website
            form at{" "}
            <Link href="/contact" className="text-gold underline-offset-4 hover:underline">
              teethbytrev.com/contact
            </Link>
            . We do not buy, rent or import phone numbers, and we never treat
            consent given to another business as consent to us.
          </p>

          <div className="border border-gold/25 bg-gold/[0.05] p-6">
            <p className="text-[0.58rem] uppercase tracking-[0.25em] text-ivory/45">
              The exact consent wording on the form
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ivory/80">
              {CONSENT_TEXT}
            </p>
          </div>

          <p>
            The checkbox is <strong className="font-normal text-ivory">unchecked by default</strong>,{" "}
            <strong className="font-normal text-ivory">optional</strong>, and{" "}
            <strong className="font-normal text-ivory">
              not a condition of submitting the form
            </strong>{" "}
            or of any purchase. Marketing email is a separate checkbox and does
            not subscribe anyone to text messages. Message frequency varies,
            typically two to four messages per month. Message and data rates may
            apply. Reply STOP, END, QUIT, CANCEL or UNSUBSCRIBE to opt out at
            any time, or HELP for assistance. Full details are in our{" "}
            <Link href="/privacy" className="text-gold underline-offset-4 hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-gold underline-offset-4 hover:underline">
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </div>

        <div className="mt-14 space-y-14">
          {steps.map((step, index) => (
            <section key={step.file}>
              <p className="text-[0.58rem] uppercase tracking-[0.25em] text-gold/70">
                Screen {index + 1} of {steps.length}
              </p>
              <h2 className="mt-2 font-serif text-3xl font-light text-ivory">
                {step.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ivory/65">
                {step.body}
              </p>
              <a
                href={`/consent-flow/${step.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block border border-ivory/15 transition-colors hover:border-gold/50"
              >
                <Image
                  src={`/consent-flow/${step.file}`}
                  alt={`${step.title} — Teeth by Trev contact form`}
                  width={1400}
                  height={5000}
                  unoptimized
                  className="h-auto w-full"
                />
              </a>
              <p className="mt-2 text-xs text-ivory/35">
                Open the image in a new tab to view it full size.
              </p>
            </section>
          ))}
        </div>

        <Link
          href="/"
          className="mt-16 inline-flex rounded-full border border-ivory/25 px-6 py-3 text-[0.68rem] uppercase tracking-[0.18em] text-ivory transition-colors hover:border-gold hover:text-gold"
        >
          Return to Teeth by Trev
        </Link>
      </article>
    </main>
  );
}
