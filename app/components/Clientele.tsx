import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";
import SectionMotifs from "./SectionMotifs";

const outlets = ["SMILE: LA", "Zeus Network", "TMZ", "Yahoo", "Black Enterprise"];

export default function Clientele() {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-28 lg:py-40">
      <SectionMotifs variant={2} />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="max-w-2xl">
          <Eyebrow index="04" className="mb-6 text-champagne">
            Trusted By
          </Eyebrow>
          <h2 className="font-serif text-4xl font-light leading-[1.1] text-ivory sm:text-5xl">
            The dentist the stars come to.
          </h2>
          <span className="accent-line mt-8" />
          <p className="mt-8 max-w-xl text-base leading-relaxed text-ivory/70 sm:text-lg">
            Star of <span className="text-champagne">SMILE: LA</span>, and the
            Hollywood smile behind some of music and entertainment&apos;s most
            recognizable faces — designed with the same care given to every
            patient who sits in the chair.
          </p>
        </Reveal>

        <div className="mt-16 border-t border-ivory/15 pt-10">
          <p className="eyebrow mb-8 text-gold/70">As Seen On</p>
          <ul className="flex flex-wrap items-center gap-x-12 gap-y-6">
            {outlets.map((outlet, i) => (
              <Reveal
                as="li"
                key={outlet}
                delay={i * 80}
                className="font-serif text-2xl font-light text-ivory/60 transition-colors duration-300 hover:text-ivory sm:text-3xl"
              >
                {outlet}
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
