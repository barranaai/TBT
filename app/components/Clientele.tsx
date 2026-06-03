import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";

const names = [
  "Offset",
  "Takeoff",
  "Sexyy Red",
  "Ne-Yo",
  "Flavor Flav",
  "Tyga",
  "Rich the Kid",
  "Chief Keef",
  "Michael Blackson",
  "Chrisean Rock",
  "Amber Rose",
  "Bobby Shmurda",
  "03 Greedo",
  "Lil Xan",
  "Inayah",
];

export default function Clientele() {
  return (
    <section className="bg-ink py-28 lg:py-40">
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
            celebrity smile behind some of music and entertainment&apos;s most
            recognizable faces — designed with the same care given to every
            patient who sits in the chair.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-16">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-ivory/15 pt-10 sm:grid-cols-3 lg:grid-cols-5">
            {names.map((name) => (
              <li
                key={name}
                className="font-serif text-xl font-light text-ivory/75 transition-colors duration-300 hover:text-champagne sm:text-2xl"
              >
                {name}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
