import Reveal from "../../components/Reveal";
import Magnetic from "../../components/Magnetic";
import LineReveal from "./LineReveal";

export default function AtelierContact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-onyx py-32 lg:py-44"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,137,92,0.08)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-12">
        <Reveal>
          <p className="mb-8 text-[0.6rem] uppercase tracking-[0.34em] text-gold/70">
            Request a Consultation
          </p>
        </Reveal>
        <h2 className="font-serif text-5xl font-light leading-[1.02] tracking-[-0.01em] text-ivory sm:text-6xl lg:text-7xl">
          <LineReveal as="span" className="!inline-block">
            Begin your
          </LineReveal>
          <br />
          <LineReveal as="span" delay={120} className="!inline-block italic text-gold">
            commission.
          </LineReveal>
        </h2>
        <Reveal delay={120}>
          <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-ivory/55">
            Consultations are by appointment and limited each month, so that
            every smile receives the attention of the atelier.
          </p>
        </Reveal>

        <Reveal delay={200} className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Magnetic>
            <a
              href="tel:+14243946159"
              className="group inline-flex items-center gap-4 border border-gold px-9 py-4 text-[0.66rem] uppercase tracking-[0.26em] text-gold transition-colors duration-300 hover:bg-gold hover:text-onyx"
            >
              Call the Studio
            </a>
          </Magnetic>
          <a
            href="mailto:TeethByTrev@gmail.com"
            className="text-[0.66rem] uppercase tracking-[0.26em] text-ivory/60 transition-colors duration-300 hover:text-ivory"
          >
            TeethByTrev@gmail.com
          </a>
        </Reveal>

        <Reveal delay={280}>
          <address className="mx-auto mt-10 text-[0.66rem] not-italic uppercase tracking-[0.26em] text-ivory/40">
            436 N Bedford Dr #300 · Beverly Hills, CA 90210
          </address>
        </Reveal>
      </div>
    </section>
  );
}
