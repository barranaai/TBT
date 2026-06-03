import Reveal from "../../components/Reveal";
import LineReveal from "./LineReveal";
import ParallaxImage from "./ParallaxImage";

const cases = [
  {
    index: "01",
    title: "The Porcelain Veneer",
    subtitle: "Eight units · upper arch",
    note: "A hand-layered ceramic restoration tuned to the patient's complexion and lip dynamics — translucency at the edge, warmth at the core.",
    image: "/stock/dental-5622257.jpg",
  },
  {
    index: "02",
    title: "Full-Mouth Rehabilitation",
    subtitle: "Reconstruction · function & form",
    note: "Rebuilding a collapsed bite into a balanced, youthful smile — engineered for the jaw, finished for the eye.",
    image: "/stock/poster-48173.jpg",
  },
  {
    index: "03",
    title: "The Implant Restoration",
    subtitle: "Single anterior · seamless",
    note: "A titanium foundation crowned in custom ceramic, placed so precisely that the result disappears into the natural arch.",
    image: "/stock/dental-6627447.jpg",
  },
];

export default function WorkIndex() {
  return (
    <section id="work" className="bg-onyx py-24 lg:py-32">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="mb-16 flex items-end justify-between border-b border-ivory/10 pb-6">
          <h2 className="font-serif text-4xl font-light text-ivory sm:text-5xl">
            <LineReveal>Selected Work</LineReveal>
          </h2>
          <span className="text-[0.6rem] uppercase tracking-[0.3em] text-ivory/40">
            2024 — 2026
          </span>
        </div>

        <div className="space-y-24 lg:space-y-32">
          {cases.map((c, i) => (
            <Reveal
              key={c.index}
              as="article"
              className={`flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16 ${
                i % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="group relative aspect-[4/5] w-full overflow-hidden lg:w-1/2">
                <ParallaxImage
                  src={c.image}
                  alt={c.title}
                  className="object-cover grayscale transition-[filter] duration-700 group-hover:grayscale-0"
                />
                <div className="pointer-events-none absolute inset-0 z-10 border border-ivory/10" />
              </div>

              <div className="lg:w-1/2">
                <span className="block font-serif text-[5rem] font-light leading-none text-gold/25 lg:text-[7rem]">
                  {c.index}
                </span>
                <h3 className="mt-4 font-serif text-3xl font-light text-ivory sm:text-4xl">
                  {c.title}
                </h3>
                <p className="mt-3 text-[0.62rem] uppercase tracking-[0.28em] text-gold/70">
                  {c.subtitle}
                </p>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/55">
                  {c.note}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
