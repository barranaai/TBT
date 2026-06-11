import Reveal from "./Reveal";
import SectionMotifs from "./SectionMotifs";

const locations = [
  "Beverly Hills",
  "New York",
  "Atlanta",
  "Houston",
  "Washington D.C.",
  "Tampa",
  "Memphis",
];

export default function Consultation() {
  return (
    <section
      id="consultation"
      className="relative isolate overflow-hidden bg-espresso py-28 text-ivory lg:py-40"
    >
      <SectionMotifs variant={4} />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <p className="eyebrow mb-6 text-champagne">Begin</p>
            <h2 className="font-serif text-4xl font-light leading-[1.05] text-ivory sm:text-5xl lg:text-6xl">
              Book your consultation.
            </h2>
            <p className="mt-8 max-w-md text-base leading-relaxed text-ivory/70 sm:text-lg">
              Tell us a little about your smile and what you&apos;d love to
              change. Texting is the fastest way to reach the team.
            </p>

            <dl className="mt-12 space-y-6 text-ivory/80">
              <div>
                <dt className="eyebrow mb-2 text-champagne">Text / Call</dt>
                <dd className="font-serif text-2xl">
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
                <dd className="font-serif text-2xl">
                  <a
                    href="mailto:TeethByTrev@gmail.com"
                    className="transition-colors hover:text-champagne"
                  >
                    TeethByTrev@gmail.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow mb-2 text-champagne">Flagship Studio</dt>
                <dd className="text-base leading-relaxed">
                  436 N Bedford Dr #300
                  <br />
                  Beverly Hills, CA 90210
                </dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={120}>
            <form className="space-y-6" aria-label="Consultation request">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field id="firstName" label="First name" autoComplete="given-name" />
                <Field id="lastName" label="Last name" autoComplete="family-name" />
              </div>
              <Field id="email" label="Email" type="email" autoComplete="email" />
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
                  rows={4}
                  className="w-full resize-none border border-ivory/25 bg-transparent px-4 py-3 text-ivory placeholder:text-ivory/30 focus:border-champagne focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center bg-ivory px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-champagne sm:w-auto"
              >
                Request Consultation
              </button>
            </form>
          </Reveal>
        </div>

        <Reveal className="mt-20 border-t border-ivory/15 pt-10">
          <ul className="flex flex-wrap items-center gap-x-10 gap-y-3">
            <li className="eyebrow text-champagne">By Appointment</li>
            {locations.map((loc) => (
              <li
                key={loc}
                className="font-serif text-xl font-light text-ivory/80"
              >
                {loc}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
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
