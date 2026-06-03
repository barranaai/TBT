import Image from "next/image";
import AtelierHeroIntro from "./AtelierHeroIntro";

export default function AtelierHero() {
  return (
    <section
      id="top"
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden bg-onyx"
    >
      <Image
        src="/stock/dental-6627447.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-25 motion-safe:animate-[heroZoom_28s_ease-in-out_infinite_alternate]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-onyx via-onyx/70 to-onyx" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(12,10,8,0.9)_100%)]" />

      {/* Gold inset frame */}
      <div className="pointer-events-none absolute inset-5 z-10 border border-gold/25 sm:inset-8 lg:inset-10" />

      <div className="relative z-20 mx-auto w-full max-w-[1600px] px-6 lg:px-12">
        <AtelierHeroIntro />
      </div>

      <div className="absolute inset-x-0 bottom-8 z-20 flex justify-center">
        <span className="text-[0.58rem] uppercase tracking-[0.3em] text-ivory/40">
          Scroll to enter
        </span>
      </div>
    </section>
  );
}
