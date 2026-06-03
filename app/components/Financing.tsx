import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";

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

export default function Financing() {
  return (
    <section id="financing" className="bg-sand py-28 lg:py-40">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-24 lg:px-10">
        <Reveal className="max-w-xl">
          <Eyebrow index="05" className="mb-6">
            Smile Now, Pay Later
          </Eyebrow>
          <h2 className="font-serif text-4xl font-light leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
            A world-class smile shouldn&apos;t wait for the perfect moment.
          </h2>
          <span className="accent-line mt-8" />
          <p className="mt-8 max-w-lg text-base leading-relaxed text-stone sm:text-lg">
            We believe transformation should be within reach. Flexible financing
            and monthly payment plans make life-changing dentistry accessible —
            so you can begin today and pay over time.
          </p>
          <a
            href="#consultation"
            className="mt-10 inline-flex items-center justify-center bg-ink px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ivory transition-colors duration-300 hover:bg-espresso"
          >
            Explore Financing Options
          </a>
        </Reveal>

        <Reveal delay={120}>
          <div className="divide-y divide-stone/15 border-y border-stone/15">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-5 py-7">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="mt-1 h-7 w-7 shrink-0 text-gold"
                >
                  {benefit.icon}
                </svg>
                <div>
                  <h3 className="font-serif text-2xl font-light text-ink">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 max-w-sm text-[0.95rem] leading-relaxed text-stone">
                    {benefit.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
