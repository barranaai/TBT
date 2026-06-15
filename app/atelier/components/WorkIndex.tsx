import Reveal from "../../components/Reveal";
import LineReveal from "./LineReveal";
import ParallaxImage from "./ParallaxImage";

const cases = [
  {
    index: "01",
    title: "The Porcelain Veneer",
    subtitle: "Where artistry meets engineering",
    note: "A hand-layered ceramic restoration tuned to the patient's complexion and lip dynamics — translucency at the edge, warmth at the core.",
    image: "/gallery/trev-veneer-craft.jpg",
  },
  {
    index: "02",
    title: "Full-Mouth Rehabilitation",
    subtitle: "Reconstruction · function & form",
    note: "Rebuilding a collapsed bite into a balanced, youthful smile — engineered for the jaw, finished for the eye.",
    image: "/gallery/trev-scan-suite.jpg",
  },
  {
    index: "03",
    title: "The Implant Restoration",
    subtitle: "Single anterior · seamless",
    note: "A titanium foundation crowned in custom ceramic, placed so precisely that the result disappears into the natural arch.",
    image: "/gallery/trev-intraoral-scan.jpg",
  },
];

export default function WorkIndex() {
  return (
    <section id="work" className="bg-onyx py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="mb-16 flex items-end justify-between border-b border-ivory/10 pb-6 lg:mb-24">
          <div>
            <p className="mb-4 text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">
              Case Studies
            </p>
            <h2 className="font-serif text-4xl font-light text-ivory sm:text-5xl">
              <LineReveal>Selected Work</LineReveal>
            </h2>
          </div>
          <span className="hidden whitespace-nowrap pb-1 text-[0.6rem] uppercase tracking-[0.3em] text-ivory/40 sm:block">
            Cosmetic &amp; Implant Dentistry
          </span>
        </div>

        <div className="space-y-24 lg:space-y-32">
          {cases.map((c, i) => {
            const reverse = i % 2 === 1;
            return (
              <Reveal
                key={c.index}
                as="article"
                className={`group grid items-center gap-12 lg:gap-16 ${
                  reverse ? "lg:grid-cols-[7fr_5fr]" : "lg:grid-cols-[5fr_7fr]"
                }`}
              >
                {/* Image */}
                <div className={reverse ? "lg:order-2" : ""}>
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <ParallaxImage
                      src={c.image}
                      alt={c.title}
                      className="object-cover grayscale transition-[filter,transform] duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-hover:grayscale-0"
                    />
                    <div className="pointer-events-none absolute inset-0 border border-gold/20" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-onyx/40 to-transparent opacity-60 transition-opacity duration-700 group-hover:opacity-20" />
                  </div>
                </div>

                {/* Text */}
                <div className={`relative ${reverse ? "lg:order-1" : ""}`}>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-14 left-0 font-serif text-[7rem] font-light leading-none text-ivory/[0.05] sm:text-[9rem] lg:-top-24 lg:text-[12rem]"
                  >
                    {c.index}
                  </span>
                  <div className="relative">
                    <div className="flex items-center gap-5">
                      <span className="whitespace-nowrap text-[0.62rem] uppercase tracking-[0.28em] text-gold/70">
                        {c.subtitle}
                      </span>
                      <span className="h-px flex-1 bg-ivory/15" />
                    </div>
                    <h3 className="mt-6 font-serif text-3xl font-light leading-[1.08] text-ivory transition-colors duration-500 group-hover:text-champagne sm:text-4xl lg:text-5xl">
                      {c.title}
                    </h3>
                    <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/55 sm:text-base">
                      {c.note}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
