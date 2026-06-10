import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import IntroVeil from "../components/IntroVeil";
import AtelierNav from "../atelier/components/AtelierNav";
import AtelierFooter from "../atelier/components/AtelierFooter";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import Magnetic from "../components/Magnetic";

export const metadata: Metadata = {
  title: "About Dr. Trev — Teeth by Trev",
  description:
    "Meet Dr. Trevor J. Thomas, DDS — cosmetic & implant dentist blending artistry, precision, and genuine care into every smile.",
};

const credentials = [
  {
    title: "Doctor of Dental Surgery",
    body: "Advanced training in cosmetic and restorative dentistry, with a focus on the art of the natural smile.",
  },
  {
    title: "Cosmetic & Implant Focus",
    body: "Years dedicated to veneers, implants, and full-mouth rehabilitation — the most demanding work in dentistry.",
  },
  {
    title: "Hands-On, Every Case",
    body: "Every restoration is designed and finished by Dr. Thomas himself. Nothing is outsourced, nothing is templated.",
  },
  {
    title: "Cities Coast to Coast",
    body: "Caring for patients across Los Angeles, New York, Atlanta, Houston, Washington D.C., Tampa, and Memphis — by appointment.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-onyx text-ivory">
      <IntroVeil variant="dark" />
      <AtelierNav />
      <main>
        <PageHero
          eyebrow="The Dentist"
          title="Meet Dr. Trev."
          intro="Dr. Trevor J. Thomas, DDS — an artist working in enamel and light, devoted to the people behind every smile."
          image="/stock/process.jpg"
          imageAlt="Dr. Trevor J. Thomas and his assistant caring for a patient in the studio"
        />

        {/* Bio */}
        <section className="bg-onyx py-28 lg:py-40">
          <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:gap-24 lg:px-10">
            <Reveal delay={120} className="order-2 lg:order-1">
              <div className="relative">
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src="/people/dr-trev-portrait.png"
                    alt="Dr. Trevor J. Thomas, DDS"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover object-top"
                  />
                  <div className="pointer-events-none absolute inset-0 border border-ivory/10" />
                </div>
                <div className="absolute -bottom-6 -right-6 hidden h-32 w-32 border border-gold/40 lg:block" />
              </div>
            </Reveal>

            <Reveal className="order-1 lg:order-2">
              <p className="mb-6 text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">
                01 — The Philosophy
              </p>
              <h2 className="font-serif text-4xl font-light leading-[1.1] text-ivory sm:text-5xl">
                Dentistry is my ministry.
              </h2>
              <span className="mt-8 block h-px w-14 bg-gold/50" />
              <div className="mt-8 space-y-6 text-base leading-relaxed text-ivory/65 sm:text-lg">
                <p>
                  For Dr. Trev, a smile is a gateway — to confidence, to better
                  mental health, to a fuller life. Every case begins not with a
                  tooth, but with a person and the story they carry.
                </p>
                <p>
                  Over eight years he has refined a practice where world-class
                  craftsmanship meets genuine care. He studies the face before
                  the teeth, designs every smile by hand, and treats each patient
                  like he&apos;d treat his own mother.
                </p>
                <p>
                  The result is work that looks effortless and feels like coming
                  home to yourself — restorations so natural they seem not done,
                  but inevitable.
                </p>
              </div>
              <p className="mt-10 font-serif text-2xl italic text-gold">
                Real people. Real problems. Real results.
              </p>
              <div className="mt-10">
                <span className="block font-script text-5xl leading-none text-gold sm:text-6xl">
                  Dr. Trev
                </span>
                <span className="mt-3 block text-[0.62rem] uppercase tracking-[0.26em] text-ivory/50">
                  Dr. Trevor Thomas, DDS
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Credentials */}
        <section className="border-t border-ivory/10 bg-ink py-28 lg:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="max-w-2xl">
              <p className="mb-6 text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">
                02 — The Credentials
              </p>
              <h2 className="font-serif text-4xl font-light leading-[1.1] text-ivory sm:text-5xl">
                Training, taste, and a steady hand.
              </h2>
            </Reveal>

            <div className="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-2">
              {credentials.map((item, i) => (
                <Reveal key={item.title} delay={(i % 2) * 100}>
                  <div className="border-t border-ivory/15 pt-6">
                    <h3 className="font-serif text-2xl font-light text-ivory">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-md text-base leading-relaxed text-ivory/60">
                      {item.body}
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
                Let&apos;s design the smile that&apos;s always been yours.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <Magnetic>
                <Link
                  href="/consultation"
                  className="inline-flex items-center justify-center border border-gold px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-gold transition-colors duration-300 hover:bg-gold hover:text-onyx"
                >
                  Book Your Consultation
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
