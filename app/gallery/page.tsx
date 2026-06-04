import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import IntroVeil from "../components/IntroVeil";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import BeforeAfter from "../components/BeforeAfter";
import Reveal from "../components/Reveal";
import Eyebrow from "../components/Eyebrow";
import Magnetic from "../components/Magnetic";

export const metadata: Metadata = {
  title: "Smile Gallery — Teeth by Trev",
  description:
    "Real transformations by Dr. Trevor J. Thomas — veneers, implants, whitening, and full-mouth makeovers. Transformations, not just teeth.",
};

const cases = [
  {
    name: "Maya",
    note: "Veneers · Smile makeover",
    image: "/stock/poster-48173.jpg",
    alt: "Close-up of a natural, confident smile",
  },
  {
    name: "Andre",
    note: "Professional whitening",
    image: "/stock/dental-5622257.jpg",
    alt: "Patient receiving a professional whitening treatment",
  },
  {
    name: "Priya",
    note: "Implants · Veneers",
    image: "/stock/dental-7800666.jpg",
    alt: "Dentists planning treatment from dental imaging",
  },
  {
    name: "Jordan",
    note: "Smile makeover",
    image: "/stock/dental-6627320.jpg",
    alt: "Dentist consulting with a patient",
  },
  {
    name: "Camille",
    note: "Cosmetic detailing",
    image: "/stock/dental-6627447.jpg",
    alt: "Dentist adjusting the studio light before a procedure",
  },
  {
    name: "Marcus",
    note: "Full-mouth rehabilitation",
    image: "/stock/dental-7800669.jpg",
    alt: "Care team reviewing a treatment plan",
  },
  {
    name: "Elena",
    note: "Porcelain veneers",
    image: "/stock/dental-3881296.jpg",
    alt: "Detailed cosmetic dental work in progress",
  },
  {
    name: "Devon",
    note: "Implant restoration",
    image: "/stock/dental-9951402.jpg",
    alt: "Patient's-eye view of the care team at work",
  },
  {
    name: "Sofia",
    note: "Smile makeover",
    image: "/stock/dental-8413334.jpg",
    alt: "Dentist treating a patient under studio light",
  },
];

export default function GalleryPage() {
  return (
    <>
      <IntroVeil variant="light" />
      <Nav />
      <main className="flex-1">
        <PageHero
          eyebrow="The Smile Gallery"
          title="Transformations, not just teeth."
          intro="Every smile here belongs to a real person with a real story. This is the work — placed, balanced, and unmistakably theirs."
          image="/stock/poster-48173.jpg"
          imageAlt="A natural, confident smile"
        />

        {/* Before / After */}
        <section className="bg-ivory py-28 lg:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Eyebrow index="01" className="mb-6 justify-center">
                Before &amp; After
              </Eyebrow>
              <h2 className="font-serif text-4xl font-light leading-[1.1] text-ink sm:text-5xl">
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
              <p className="mt-4 text-center text-[0.72rem] uppercase tracking-[0.2em] text-stone">
                Drag to reveal the transformation
              </p>
            </Reveal>
          </div>
        </section>

        {/* Case grid */}
        <section className="bg-cream py-28 lg:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="max-w-2xl">
              <Eyebrow index="02" className="mb-6">
                The Cases
              </Eyebrow>
              <h2 className="font-serif text-4xl font-light leading-[1.1] text-ink sm:text-5xl">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
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
        <section className="bg-espresso py-24 text-ivory lg:py-32">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-6 lg:flex-row lg:items-center lg:px-10">
            <Reveal>
              <h2 className="max-w-2xl font-serif text-4xl font-light leading-[1.08] text-ivory sm:text-5xl">
                Your story could be the next one we tell.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <Magnetic>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-ivory px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-champagne"
                >
                  Start Your Story
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
