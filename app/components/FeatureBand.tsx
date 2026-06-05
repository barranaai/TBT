import Image from "next/image";
import Reveal from "./Reveal";

export default function FeatureBand() {
  return (
    <section className="relative h-[70vh] min-h-[460px] overflow-hidden">
      <Image
        src="/stock/feature-bg.jpg"
        alt="Dr. Trevor J. Thomas and his assistant caring for a patient in the studio"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-ink/45" />
      <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 text-center">
        <Reveal>
          <p className="eyebrow mb-6 text-champagne">The Standard</p>
          <p className="font-serif text-3xl font-light leading-[1.2] text-ivory sm:text-4xl lg:text-5xl">
            Every detail is considered. Every result is earned. Nothing about
            your smile is left to chance.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
