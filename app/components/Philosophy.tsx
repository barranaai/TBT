import Reveal from "./Reveal";
import RevealImage from "./RevealImage";
import Eyebrow from "./Eyebrow";

export default function Philosophy() {
  return (
    <section id="philosophy" className="bg-ivory py-28 lg:py-40">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:gap-24 lg:px-10">
        <Reveal>
          <Eyebrow index="01" className="mb-6">
            The Philosophy
          </Eyebrow>
          <h2 className="font-serif text-4xl font-light leading-[1.1] text-ink sm:text-5xl">
            Dentistry is my ministry.
          </h2>
          <span className="accent-line mt-8" />
          <div className="mt-8 space-y-6 text-base leading-relaxed text-stone sm:text-lg">
            <p>
              For Dr. Trev, a smile is a gateway — to confidence, to better
              mental health, to a fuller life. Every case begins not with a
              tooth, but with a person and the story they carry.
            </p>
            <p>
              That belief has shaped a practice where world-class craftsmanship
              meets genuine care. The result is work that looks effortless and
              feels like coming home to yourself.
            </p>
          </div>
          <p className="mt-10 font-serif text-2xl italic text-gold">
            Real people. Real problems. Real results.
          </p>
          <div className="mt-10">
            <span className="block font-script text-6xl leading-none text-champagne sm:text-7xl">
              Dr. Trev
            </span>
            <span className="mt-3 block text-[0.7rem] uppercase tracking-[0.24em] text-stone">
              Dr. Trevor Thomas, DDS
            </span>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative">
            <div className="group relative aspect-[4/5] w-full overflow-hidden">
              <RevealImage
                src="/people/dr-trev-portrait.png"
                alt="Dr. Trevor J. Thomas, DDS"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                wrapperClassName="absolute inset-0"
                className="object-contain transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden h-32 w-32 border border-gold/40 lg:block" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
