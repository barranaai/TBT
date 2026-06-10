import type { Metadata } from "next";
import IntroVeil from "../components/IntroVeil";
import AtelierNav from "../atelier/components/AtelierNav";
import AtelierFooter from "../atelier/components/AtelierFooter";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";

export const metadata: Metadata = {
  title: "Contact — Teeth by Trev",
  description:
    "Reach Dr. Trevor J. Thomas. Text, call, or send a note — and tell us about the smile you imagine.",
};

const locations = [
  "Los Angeles",
  "New York",
  "Atlanta",
  "Houston",
  "Washington D.C.",
  "Tampa",
  "Memphis",
];

export default function ContactPage() {
  return (
    <div className="bg-onyx text-ivory">
      <IntroVeil variant="dark" />
      <AtelierNav />
      <main>
        <PageHero
          eyebrow="Get in Touch"
          title="Let's start the conversation."
          intro="Tell us a little about your smile and what you'd love to change. Texting is the fastest way to reach the team."
          image="/gallery/trev-exam.jpg"
          imageAlt="Dr. Trevor J. Thomas performing a detailed examination in the studio"
        />

        <section className="bg-onyx py-28 lg:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
              <Reveal>
                <dl className="space-y-8 text-ivory/80">
                  <div>
                    <dt className="eyebrow mb-2 text-champagne">Text / Call</dt>
                    <dd className="font-serif text-3xl">
                      <a
                        href="tel:+14243946159"
                        className="transition-colors hover:text-champagne"
                      >
                        424-394-6159
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow mb-2 text-champagne">Email</dt>
                    <dd className="font-serif text-3xl">
                      <a
                        href="mailto:TeethByTrev@gmail.com"
                        className="transition-colors hover:text-champagne"
                      >
                        TeethByTrev@gmail.com
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow mb-2 text-champagne">
                      Flagship Studio
                    </dt>
                    <dd className="text-base leading-relaxed">
                      11980 San Vicente Blvd # 507
                      <br />
                      Los Angeles, CA 90049
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow mb-3 text-champagne">By Appointment</dt>
                    <dd>
                      <ul className="flex flex-wrap gap-x-8 gap-y-2">
                        {locations.map((loc) => (
                          <li
                            key={loc}
                            className="font-serif text-xl font-light text-ivory/80"
                          >
                            {loc}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </Reveal>

              <Reveal delay={120}>
                <form className="space-y-6" aria-label="Consultation request">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field
                      id="firstName"
                      label="First name"
                      autoComplete="given-name"
                    />
                    <Field
                      id="lastName"
                      label="Last name"
                      autoComplete="family-name"
                    />
                  </div>
                  <Field
                    id="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                  />
                  <Field id="phone" label="Phone" type="tel" autoComplete="tel" />
                  <div>
                    <label
                      htmlFor="message"
                      className="eyebrow mb-3 block text-champagne"
                    >
                      What would you love to change?
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="w-full resize-none border border-ivory/25 bg-transparent px-4 py-3 text-ivory placeholder:text-ivory/30 focus:border-champagne focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center border border-gold px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-gold transition-colors duration-300 hover:bg-gold hover:text-onyx sm:w-auto"
                  >
                    Request Consultation
                  </button>
                </form>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <AtelierFooter />
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-3 block text-champagne">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        className="w-full border border-ivory/25 bg-transparent px-4 py-3 text-ivory placeholder:text-ivory/30 focus:border-champagne focus:outline-none"
      />
    </div>
  );
}
