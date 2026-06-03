import type { Metadata } from "next";
import Link from "next/link";
import IntroVeil from "../components/IntroVeil";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import Eyebrow from "../components/Eyebrow";
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

const faqs = [
  {
    q: "Will checking my options affect my credit?",
    a: "No. Pre-qualification uses a soft credit check that has no impact on your credit score. You'll see your options before committing to anything.",
  },
  {
    q: "What financing partners do you work with?",
    a: "We work with leading healthcare lenders offering plans with low and no-interest promotional periods. During your consultation we'll match you to the right fit.",
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
    <>
      <IntroVeil variant="light" />
      <Nav />
      <main className="flex-1">
        <PageHero
          eyebrow="Smile Now, Pay Later"
          title="A world-class smile shouldn't wait."
          intro="Flexible financing and monthly payment plans make life-changing dentistry accessible — so you can begin today and pay over time."
          image="/stock/dental-7800675.jpg"
          imageAlt="Clinicians reviewing a patient's treatment plan"
        />

        {/* Benefits */}
        <section className="bg-ivory py-28 lg:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="max-w-2xl">
              <Eyebrow index="01" className="mb-6">
                The Promise
              </Eyebrow>
              <h2 className="font-serif text-4xl font-light leading-[1.1] text-ink sm:text-5xl">
                Transformation, within reach.
              </h2>
            </Reveal>

            <div className="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-3">
              {benefits.map((benefit, i) => (
                <Reveal key={benefit.title} delay={i * 100}>
                  <div className="border-t border-stone/20 pt-7">
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
                    <h3 className="mt-6 font-serif text-2xl font-light text-ink">
                      {benefit.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-stone">
                      {benefit.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-cream py-28 lg:py-40">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[0.8fr_1fr] lg:gap-24 lg:px-10">
            <Reveal>
              <Eyebrow index="02" className="mb-6">
                Questions
              </Eyebrow>
              <h2 className="font-serif text-4xl font-light leading-[1.1] text-ink sm:text-5xl">
                The details, answered.
              </h2>
            </Reveal>

            <div className="divide-y divide-stone/15 border-y border-stone/15">
              {faqs.map((faq, i) => (
                <Reveal key={faq.q} delay={(i % 2) * 90}>
                  <div className="py-8">
                    <h3 className="font-serif text-2xl font-light text-ink">
                      {faq.q}
                    </h3>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-stone">
                      {faq.a}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-espresso py-24 text-ivory lg:py-32">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-6 lg:flex-row lg:items-center lg:px-10">
            <Reveal>
              <h2 className="max-w-2xl font-serif text-4xl font-light leading-[1.08] text-ivory sm:text-5xl">
                Let&apos;s find a plan that fits your life.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <Magnetic>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-ivory px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-champagne"
                >
                  Explore Financing Options
                </Link>
              </Magnetic>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
