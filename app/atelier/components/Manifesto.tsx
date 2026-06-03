import Reveal from "../../components/Reveal";

export default function Manifesto() {
  return (
    <section id="maison" className="bg-onyx py-32 lg:py-44">
      <div className="mx-auto max-w-5xl px-6 lg:px-12">
        <Reveal>
          <p className="mb-12 text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">
            The Maison
          </p>
        </Reveal>
        <Reveal delay={120}>
          <p className="font-serif text-3xl font-light leading-[1.35] tracking-[-0.01em] text-ivory/85 sm:text-4xl lg:text-[2.85rem]">
            We do not sell dentistry. We compose{" "}
            <span className="italic text-gold">faces</span> — reading the light
            of a smile, the line of a lip, the architecture beneath. Every veneer
            is drawn by hand, every restoration weighed against a single
            question: <span className="italic text-gold">does it look
            inevitable?</span>{" "}
            The finest work is the work no one can see was done.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-16 flex items-center gap-6">
            <span className="h-px w-16 bg-gold/40" />
            <span className="font-serif text-xl italic text-ivory/60">
              Dr. Trevor J. Thomas
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
