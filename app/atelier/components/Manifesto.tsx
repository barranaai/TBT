import Image from "next/image";
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
          <div className="mt-16 flex flex-col items-start gap-7 sm:flex-row sm:items-center sm:gap-10">
            <div className="relative h-36 w-28 shrink-0 overflow-hidden sm:h-40 sm:w-32">
              <Image
                src="/people/dr-trev-portrait.png"
                alt="Dr. Trevor J. Thomas, DDS"
                fill
                sizes="128px"
                className="object-cover object-[center_20%]"
              />
              <div className="pointer-events-none absolute inset-0 border border-gold/30" />
            </div>
            <div>
              <span className="block font-script text-5xl leading-none text-gold sm:text-6xl">
                Dr. Trev
              </span>
              <span className="mt-3 block text-[0.6rem] uppercase tracking-[0.28em] text-ivory/50">
                Dr. Trevor J. Thomas, DDS
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
