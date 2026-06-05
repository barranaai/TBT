import type { Metadata } from "next";
import Image from "next/image";
import IntroVeil from "../components/IntroVeil";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import Eyebrow from "../components/Eyebrow";
import Stats from "../components/Stats";
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
    title: "Four Flagship Cities",
    body: "Caring for patients across Los Angeles, Beverly Hills, Atlanta, and New York — by appointment.",
  },
];

export default function AboutPage() {
  return (
    <>
      <IntroVeil variant="light" />
      <Nav />
      <main className="flex-1">
        <PageHero
          eyebrow="The Dentist"
          title="Meet Dr. Trev."
          intro="Dr. Trevor J. Thomas, DDS — an artist working in enamel and light, devoted to the people behind every smile."
          image="/stock/dental-19879741.jpg"
          imageAlt="Dr. Thomas working under the studio light"
        />

        {/* Bio */}
        <section className="bg-ivory py-28 lg:py-40">
          <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:gap-24 lg:px-10">
            <Reveal delay={120} className="order-2 lg:order-1">
              <div className="relative">
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src="/stock/dental-7800675.jpg"
                    alt="Dr. Thomas reviewing a patient's treatment plan"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 hidden h-32 w-32 border border-gold/40 lg:block" />
              </div>
            </Reveal>

            <Reveal className="order-1 lg:order-2">
              <Eyebrow index="01" className="mb-6">
                The Philosophy
              </Eyebrow>
              <h2 className="font-serif text-4xl font-light leading-[1.1] text-ink sm:text-5xl">
                Dentistry is my ministry.
              </h2>
              <div className="mt-8 space-y-6 text-base leading-relaxed text-stone sm:text-lg">
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
            </Reveal>
          </div>
        </section>

        <Stats />

        {/* Credentials */}
        <section className="bg-cream py-28 lg:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="max-w-2xl">
              <Eyebrow index="02" className="mb-6">
                The Credentials
              </Eyebrow>
              <h2 className="font-serif text-4xl font-light leading-[1.1] text-ink sm:text-5xl">
                Training, taste, and a steady hand.
              </h2>
            </Reveal>

            <div className="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-2">
              {credentials.map((item, i) => (
                <Reveal key={item.title} delay={(i % 2) * 100}>
                  <div className="border-t border-stone/20 pt-6">
                    <h3 className="font-serif text-2xl font-light text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-md text-base leading-relaxed text-stone">
                      {item.body}
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
                Let&apos;s design the smile that&apos;s always been yours.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <Magnetic>
                <a
                  href="https://www.diverzeent.com/tbv-inquiry/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-ivory px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-champagne"
                >
                  Book Your Consultation
                </a>
              </Magnetic>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
