import Reveal from "./Reveal";

const outlets = ["SMILE: LA", "Zeus Network", "TMZ", "Yahoo", "Black Enterprise"];

export default function Media({ dark = false }: { dark?: boolean }) {
  return (
    <section
      className={`border-t py-20 ${
        dark ? "border-ivory/10 bg-onyx" : "border-stone/15 bg-ivory"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center">
          <Reveal>
            <p
              className={`eyebrow mb-10 ${dark ? "text-gold/70" : ""}`}
            >
              As Seen On
            </p>
          </Reveal>
          <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {outlets.map((outlet, i) => (
              <Reveal
                as="li"
                key={outlet}
                delay={i * 80}
                className={`font-serif text-2xl font-light transition-colors sm:text-3xl ${
                  dark
                    ? "text-ivory/55 hover:text-ivory"
                    : "text-stone/60 hover:text-ink"
                }`}
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
