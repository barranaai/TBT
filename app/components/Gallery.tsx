import Reveal from "./Reveal";
import RevealImage from "./RevealImage";
import Eyebrow from "./Eyebrow";
import BeforeAfter from "./BeforeAfter";

const featured = {
  image: "/gallery/trev-exam.jpg",
  alt: "Dr. Trevor J. Thomas performing a detailed examination in the Teeth by Trev studio",
  title: "Inside the chair",
  note: "Precision diagnostics, every visit",
};

const portraits = [
  {
    image: "/gallery/trev-scan-suite.jpg",
    alt: "Dr. Trevor J. Thomas treating a patient with a 3D scan on screen",
    title: "The Treatment",
    note: "Meticulous, comfortable care",
  },
  {
    image: "/gallery/trev-consult-suit.jpg",
    alt: "Dr. Trevor J. Thomas presenting a dental model to a patient",
    title: "The Consultation",
    note: "Your plan, personalized",
  },
  {
    image: "/gallery/trev-veneer-craft.jpg",
    alt: "Dr. Trevor J. Thomas hand-finishing a porcelain veneer at the bench",
    title: "The Craft",
    note: "Hand-finished veneers",
  },
  {
    image: "/gallery/trev-intraoral-scan.jpg",
    alt: "Dr. Trevor J. Thomas capturing a 3D intraoral scan of a patient",
    title: "Digital Scanning",
    note: "3D smile design",
  },
  {
    image: "/gallery/trev-consult-blue.jpg",
    alt: "Dr. Trevor J. Thomas discussing a treatment model with a patient",
    title: "One-on-One",
    note: "Every patient, every story",
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

        {/* Featured wide shot */}
        <div className="mt-20">
          <figure className="group relative aspect-[3/2] w-full overflow-hidden sm:aspect-[2/1] lg:aspect-[5/2]">
            <RevealImage
              src={featured.image}
              alt={featured.alt}
              fill
              sizes="(min-width: 1024px) 76rem, 100vw"
              wrapperClassName="absolute inset-0"
              className="object-cover object-center transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
            <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 lg:p-8">
              <span className="block font-serif text-2xl font-light text-ivory sm:text-3xl">
                {featured.title}
              </span>
              <span className="text-[0.72rem] uppercase tracking-[0.18em] text-champagne">
                {featured.note}
              </span>
            </figcaption>
          </figure>
        </div>

        {/* Portrait filmstrip */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {portraits.map((c, i) => (
            <figure
              key={c.title}
              className="group relative aspect-[4/5] overflow-hidden"
            >
              <RevealImage
                src={c.image}
                alt={c.alt}
                fill
                sizes="(min-width: 1024px) 15rem, (min-width: 640px) 33vw, 50vw"
                delay={i * 80}
                wrapperClassName="absolute inset-0"
                className="object-cover object-top transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="block font-serif text-xl font-light text-ivory">
                  {c.title}
                </span>
                <span className="text-[0.66rem] uppercase tracking-[0.16em] text-champagne">
                  {c.note}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
