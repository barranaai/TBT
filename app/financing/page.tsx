import type { Metadata } from "next";
import Link from "next/link";
import IntroVeil from "../components/IntroVeil";
import AtelierNav from "../atelier/components/AtelierNav";
import AtelierFooter from "../atelier/components/AtelierFooter";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import Magnetic from "../components/Magnetic";

export const metadata: Metadata = {
  title: "Financing — Teeth by Trev",
  description:
    "Smile now, pay later. Flexible financing and monthly payment plans make life-changing dentistry by Dr. Trevor J. Thomas accessible.",
};

const benefits = [
  {
    title: "Plans from $0 down",
    body: "Begin your transformation today with low monthly payments tailored to your budget — no large upfront cost.",
    icon: (
      <path
        d="M3 9.5h18M3 9.5A2.5 2.5 0 0 1 5.5 7h13A2.5 2.5 0 0 1 21 9.5m-18 0v7A2.5 2.5 0 0 0 5.5 19h13a2.5 2.5 0 0 0 2.5-2.5v-7M7 15.5h4"
        strokeWidth="1.25"
      />
    ),
  },
  {
    title: "Apply in minutes",
    body: "A simple, soft credit check gets you an answer fast — without affecting your score or interrupting your day.",
    icon: (
      <path
        d="M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        strokeWidth="1.25"
      />
    ),
  },
  {
    title: "Care that fits your life",
    body: "Stretch your investment across comfortable terms so the smile you deserve never has to wait for the perfect moment.",
    icon: (
      <path
        d="M12 20.25S3.75 15.5 3.75 9.62A4.12 4.12 0 0 1 12 7.5a4.12 4.12 0 0 1 8.25 2.12C20.25 15.5 12 20.25 12 20.25Z"
        strokeWidth="1.25"
      />
    ),
  },
];

const partners = [
  {
    name: "CareCredit",
    meta: "Most widely accepted",
    body: "The healthcare credit card accepted at practices nationwide, with special promotional financing on qualifying treatment.",
    href: "https://www.carecredit.com/go/276SNV/",
  },
  {
    name: "Alphaeon Credit",
    meta: "For elective care",
    body: "A dedicated credit card for cosmetic and elective care, offering flexible monthly plans and promotional offers.",
    href: "https://goalphaeon.com/apply?src=cling",
  },
  {
    name: "Cherry",
    meta: "Fast, soft-check approval",
    body: "Paperless approval in minutes with a soft credit check and flexible monthly payments — many patients qualify for 0% APR.",
    href: "https://pay.withcherry.com/trevor-jamal-thomas-dds-inc?utm_source=practice&m=51934",
  },
  {
    name: "Proceed Finance",
    meta: "For larger plans",
    body: "Built for comprehensive and full-mouth cases, with longer terms and higher approval amounts than standard cards.",
    href: "https://www.proceedfinance.com/application/create?referrer=37783-13017-4FDA",
  },
];

const faqs = [
  {
    q: "Will checking my options affect my credit?",
    a: "No. Pre-qualification uses a soft credit check that has no impact on your credit score. You'll see your options before committing to anything.",
  },
  {
    q: "What financing partners do you work with?",
    a: "We partner with CareCredit, Alphaeon, Cherry, and Proceed Finance — leading healthcare lenders offering plans with low and no-interest promotional periods. During your consultation we'll match you to the right fit.",
  },
  {
    q: "Can I combine financing with insurance?",
    a: "Yes. Where applicable, we apply your benefits first and finance the remaining balance — so you only ever pay over time for what's left.",
  },
  {
    q: "How long are the payment terms?",
    a: "Terms range from a few months to several years depending on the plan and treatment. We'll walk you through options that keep your monthly payment comfortable.",
  },
];

export default function FinancingPage() {
  return (
    <div className="bg-onyx text-ivory">
      <IntroVeil variant="dark" />
      <AtelierNav />
      <main>
        <PageHero
          eyebrow="Smile Now, Pay Later"
          title="A world-class smile shouldn't wait."
          intro="Flexible financing and monthly payment plans make life-changing dentistry accessible — so you can begin today and pay over time."
          image="/stock/financing-hero.jpg"
          imageAlt="Reviewing a panoramic X-ray and dental implant model with a patient in the Teeth by Trev studio"
        />

        {/* Benefits */}
        <section className="bg-onyx py-28 lg:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="max-w-2xl">
              <p className="mb-6 text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">
                01 — The Promise
              </p>
              <h2 className="font-serif text-4xl font-light leading-[1.1] text-ivory sm:text-5xl">
                Transformation, within reach.
              </h2>
            </Reveal>

            <div className="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-3">
              {benefits.map((benefit, i) => (
                <Reveal key={benefit.title} delay={i * 100}>
                  <div className="border-t border-ivory/15 pt-7">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-8 w-8 text-gold"
                    >
                      {benefit.icon}
                    </svg>
                    <h3 className="mt-6 font-serif text-2xl font-light text-ivory">
                      {benefit.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-ivory/60">
                      {benefit.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Financing partners */}
        <section className="border-t border-ivory/10 bg-ink py-28 lg:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="max-w-2xl">
              <p className="mb-6 text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">
                02 — Our Partners
              </p>
              <h2 className="font-serif text-4xl font-light leading-[1.1] text-ivory sm:text-5xl">
                Trusted financing partners.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/60">
                We work with the most respected names in healthcare financing.
                Apply with any of them in minutes — most use a soft credit check
                that won&apos;t affect your score.
              </p>
            </Reveal>

            <div className="mt-16 grid gap-5 sm:grid-cols-2">
              {partners.map((p, i) => (
                <Reveal key={p.name} delay={(i % 2) * 90}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col border border-ivory/12 bg-white/[0.02] p-8 transition-colors duration-300 hover:border-gold/50"
                  >
                    <span className="text-[0.6rem] uppercase tracking-[0.28em] text-gold/70">
                      {p.meta}
                    </span>
                    <h3 className="mt-4 font-serif text-3xl font-light text-ivory">
                      {p.name}
                    </h3>
                    <p className="mt-3 flex-1 text-base leading-relaxed text-ivory/60">
                      {p.body}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em] text-ivory/70 transition-colors duration-300 group-hover:text-gold">
                      Apply with {p.name}
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                  </a>
                </Reveal>
              ))}
            </div>

            <p className="mt-8 text-[0.72rem] uppercase tracking-[0.18em] text-ivory/40">
              Not sure which fits? Dr. Trev&apos;s team will match you to the right
              plan during your consultation.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-ivory/10 bg-onyx py-28 lg:py-40">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[0.8fr_1fr] lg:gap-24 lg:px-10">
            <Reveal>
              <p className="mb-6 text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">
                03 — Questions
              </p>
              <h2 className="font-serif text-4xl font-light leading-[1.1] text-ivory sm:text-5xl">
                The details, answered.
              </h2>
            </Reveal>

            <div className="divide-y divide-ivory/12 border-y border-ivory/12">
              {faqs.map((faq, i) => (
                <Reveal key={faq.q} delay={(i % 2) * 90}>
                  <div className="py-8">
                    <h3 className="font-serif text-2xl font-light text-ivory">
                      {faq.q}
                    </h3>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-ivory/60">
                      {faq.a}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-ivory/10 bg-onyx py-24 lg:py-32">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-6 lg:flex-row lg:items-center lg:px-10">
            <Reveal>
              <h2 className="max-w-2xl font-serif text-4xl font-light leading-[1.08] text-ivory sm:text-5xl">
                Let&apos;s find a plan that fits your life.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <Magnetic>
                <Link
                  href="/consultation"
                  className="inline-flex items-center justify-center border border-gold px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-gold transition-colors duration-300 hover:bg-gold hover:text-onyx"
                >
                  Explore Financing Options
                </Link>
              </Magnetic>
            </Reveal>
          </div>
        </section>
      </main>
      <AtelierFooter />
    </div>
  );
}
