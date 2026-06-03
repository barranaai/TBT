import HeroHeadline from "./HeroHeadline";
import Magnetic from "./Magnetic";

export default function Hero() {
  return (
    <section id="top" className="relative min-h-dvh overflow-hidden bg-ink">
      <video
        className="absolute inset-0 h-full w-full origin-center scale-105 object-cover motion-safe:animate-[heroZoom_24s_ease-in-out_infinite_alternate]"
        autoPlay
        muted
        loop
        playsInline
        poster="/video/trevor-hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/video/trevor-hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/65" />
      {/* Drifting champagne sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-soft-light motion-safe:animate-sheen"
        style={{
          background:
            "radial-gradient(42% 52% at 32% 30%, rgba(184,155,110,0.45), transparent 70%)",
        }}
      />
      {/* Cinematic vignette for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 110% at 50% 35%, transparent 45%, rgba(12,10,8,0.6) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col justify-end px-6 pb-20 pt-40 lg:px-10 lg:pb-28">
        <p className="eyebrow mb-6 text-champagne">
          Cosmetic &amp; Implant Dentistry
        </p>
        <HeroHeadline />
        <p className="mt-8 max-w-xl text-base leading-relaxed text-ivory/80 sm:text-lg">
          Dr. Trevor J. Thomas crafts life-changing smiles for real people with
          real stories — blending artistry, precision, and a little soul into
          every transformation.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-start">
          <Magnetic>
            <a
              href="#consultation"
              className="inline-flex items-center justify-center bg-ivory px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-champagne hover:text-ink"
            >
              Book Your Consultation
            </a>
          </Magnetic>
          <a
            href="#gallery"
            className="inline-flex items-center justify-center border border-ivory/40 px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ivory transition-colors duration-300 hover:border-ivory hover:bg-ivory/10"
          >
            View Smile Gallery
          </a>
        </div>
      </div>

      <a
        href="#philosophy"
        aria-label="Scroll to learn more"
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-ivory/70 transition-colors hover:text-ivory lg:flex"
      >
        <span className="text-[0.62rem] uppercase tracking-[0.28em]">
          Scroll
        </span>
        <span className="relative h-14 w-px overflow-hidden bg-ivory/20">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-ivory to-transparent motion-safe:animate-scrollCue" />
        </span>
      </a>
    </section>
  );
}
