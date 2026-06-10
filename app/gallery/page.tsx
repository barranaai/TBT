import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import IntroVeil from "../components/IntroVeil";
import AtelierNav from "../atelier/components/AtelierNav";
import AtelierFooter from "../atelier/components/AtelierFooter";
import PageHero from "../components/PageHero";
import BeforeAfter from "../components/BeforeAfter";
import Reveal from "../components/Reveal";
import Magnetic from "../components/Magnetic";

export const metadata: Metadata = {
  title: "Smile Gallery — Teeth by Trev",
  description:
    "Real transformations by Dr. Trevor J. Thomas — veneers, implants, whitening, and full-mouth makeovers. Transformations, not just teeth.",
};

const cases = [
  {
    name: "Inside the Chair",
    note: "Precision diagnostics",
    image: "/gallery/trev-exam.jpg",
    alt: "Dr. Trevor J. Thomas performing a detailed examination in the studio",
  },
  {
    name: "The Treatment",
    note: "Meticulous, comfortable care",
    image: "/gallery/trev-scan-suite.jpg",
    alt: "Dr. Trevor J. Thomas treating a patient with a 3D scan on screen",
  },
  {
    name: "The Consultation",
    note: "Your plan, personalized",
    image: "/gallery/trev-consult-suit.jpg",
    alt: "Dr. Trevor J. Thomas presenting a dental model to a patient",
  },
  {
    name: "The Craft",
    note: "Hand-finished veneers",
    image: "/gallery/trev-veneer-craft.jpg",
    alt: "Dr. Trevor J. Thomas hand-finishing a porcelain veneer at the bench",
  },
  {
    name: "Digital Scanning",
    note: "3D smile design",
    image: "/gallery/trev-intraoral-scan.jpg",
    alt: "Dr. Trevor J. Thomas capturing a 3D intraoral scan of a patient",
  },
  {
    name: "One-on-One",
    note: "Every patient, every story",
    image: "/gallery/trev-consult-blue.jpg",
    alt: "Dr. Trevor J. Thomas discussing a treatment model with a patient",
  },
];

export default function GalleryPage() {
  return (
    <div className="bg-onyx text-ivory">
      <IntroVeil variant="dark" />
      <AtelierNav />
      <main>
        <PageHero
          eyebrow="The Smile Gallery"
          title="Transformations, not just teeth."
          intro="Every smile here belongs to a real person with a real story. This is the work — placed, balanced, and unmistakably theirs."
          image="/stock/feature-bg.jpg"
          imageAlt="Dr. Trevor J. Thomas and his assistant caring for a patient in the studio"
        />

        {/* Before / After */}
        <section className="bg-onyx py-28 lg:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="mb-6 text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">
                01 — Before &amp; After
              </p>
              <h2 className="font-serif text-4xl font-light leading-[1.1] text-ivory sm:text-5xl">
                See the difference, side by side.
              </h2>
            </Reveal>

            <Reveal className="mt-16">
              <BeforeAfter
                beforeSrc="/stock/before-smile.jpg"
                afterSrc="/stock/after-smile.jpg"
                beforeAlt="Worn, damaged smile before treatment by Dr. Trevor J. Thomas"
                afterAlt="Bright, restored smile after treatment by Dr. Trevor J. Thomas"
              />
              <p className="mt-4 text-center text-[0.72rem] uppercase tracking-[0.2em] text-ivory/45">
                Drag to reveal the transformation
              </p>
            </Reveal>
          </div>
        </section>

        {/* Case grid */}
        <section className="border-t border-ivory/10 bg-ink py-28 lg:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="max-w-2xl">
              <p className="mb-6 text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">
                02 — The Cases
              </p>
              <h2 className="font-serif text-4xl font-light leading-[1.1] text-ivory sm:text-5xl">
                A few of the smiles we&apos;ve had the honor to craft.
              </h2>
            </Reveal>

            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cases.map((c, i) => (
                <Reveal key={c.name} delay={(i % 3) * 90}>
                  <figure className="group relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={c.image}
                      alt={c.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-0 border border-ivory/10" />
                    <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="block font-serif text-2xl font-light text-ivory">
                        {c.name}
                      </span>
                      <span className="text-[0.72rem] uppercase tracking-[0.18em] text-champagne">
                        {c.note}
                      </span>
                    </figcaption>
                  </figure>
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
                Your story could be the next one we tell.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <Magnetic>
                <Link
                  href="/consultation"
                  className="inline-flex items-center justify-center border border-gold px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-gold transition-colors duration-300 hover:bg-gold hover:text-onyx"
                >
                  Start Your Story
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
