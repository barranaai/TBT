import Image from "next/image";
import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";
import BeforeAfter from "./BeforeAfter";

const cases = [
  {
    name: "Maya",
    note: "Veneers · Smile makeover",
    image: "/stock/poster-48173.jpg",
    alt: "Close-up of a natural, confident smile",
    span: "col-span-2 row-span-2",
    sizes: "(min-width: 1024px) 50vw, 100vw",
  },
  {
    name: "Andre",
    note: "Professional whitening",
    image: "/stock/dental-5622257.jpg",
    alt: "Patient receiving a professional whitening treatment",
    span: "col-span-2 row-span-1",
    sizes: "(min-width: 1024px) 50vw, 100vw",
  },
  {
    name: "Priya",
    note: "Implants · Veneers",
    image: "/stock/dental-7800666.jpg",
    alt: "Dentists planning treatment from dental imaging",
    span: "col-span-1 row-span-1",
    sizes: "(min-width: 1024px) 25vw, 50vw",
  },
  {
    name: "Jordan",
    note: "Smile makeover",
    image: "/stock/dental-6627320.jpg",
    alt: "Dentist consulting with a patient",
    span: "col-span-1 row-span-1",
    sizes: "(min-width: 1024px) 25vw, 50vw",
  },
  {
    name: "Camille",
    note: "Cosmetic detailing",
    image: "/stock/dental-6627447.jpg",
    alt: "Dentist adjusting the studio light before a procedure",
    span: "col-span-2 row-span-1",
    sizes: "(min-width: 1024px) 50vw, 100vw",
  },
  {
    name: "Marcus",
    note: "Full-mouth rehabilitation",
    image: "/stock/dental-7800669.jpg",
    alt: "Care team reviewing a treatment plan",
    span: "col-span-2 row-span-1",
    sizes: "(min-width: 1024px) 50vw, 100vw",
  },
];

export default function Gallery() {
  return (
    <section id="gallery" className="bg-ivory pb-28 pt-12 lg:pb-40 lg:pt-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <Eyebrow index="03" className="mb-6">
              The Smile Gallery
            </Eyebrow>
            <h2 className="font-serif text-4xl font-light leading-[1.1] text-ink sm:text-5xl">
              Transformations, not just teeth.
            </h2>
            <span className="accent-line mt-8" />
          </div>
          <a
            href="#consultation"
            className="shrink-0 border-b border-ink pb-1 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ink transition-colors hover:border-gold hover:text-gold"
          >
            Start your story
          </a>
        </Reveal>

        <Reveal className="mt-16">
          <BeforeAfter
            beforeSrc="/stock/dental-5622257.jpg"
            afterSrc="/stock/poster-48173.jpg"
            beforeAlt="Smile before treatment"
            afterAlt="Smile after treatment"
          />
          <p className="mt-4 text-center text-[0.72rem] uppercase tracking-[0.2em] text-stone">
            Drag to reveal the transformation
          </p>
        </Reveal>

        <div className="mt-20 grid grid-cols-2 gap-4 auto-rows-[10rem] sm:auto-rows-[12rem] lg:grid-cols-4 lg:auto-rows-[13rem]">
          {cases.map((c, i) => (
            <Reveal
              key={c.name}
              delay={(i % 3) * 90}
              className={`${c.span} h-full`}
            >
              <figure className="group relative h-full overflow-hidden">
                <Image
                  src={c.image}
                  alt={c.alt}
                  fill
                  sizes={c.sizes}
                  className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
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
  );
}
