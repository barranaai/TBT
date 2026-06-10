import Reveal from "./Reveal";

const quotes = [
  {
    quote:
      "I hid my smile for fifteen years. Dr. Trev gave me back something I didn't know I'd lost — myself.",
    name: "Maya R.",
    detail: "Smile makeover",
  },
  {
    quote:
      "It never felt clinical. It felt like someone finally saw me, then made me look the way I always felt inside.",
    name: "Andre T.",
    detail: "Full-mouth rehabilitation",
  },
];

export default function Testimonials({ dark = false }: { dark?: boolean }) {
  return (
    <section
      className={`py-28 lg:py-40 ${dark ? "border-t border-ivory/10 bg-ink" : "bg-ivory"}`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {quotes.map((q, i) => (
            <Reveal key={q.name} delay={i * 120}>
              <figure
                className={`flex h-full flex-col justify-between border-t pt-10 ${
                  dark ? "border-ivory/15" : "border-stone/20"
                }`}
              >
                <blockquote
                  className={`font-serif text-3xl font-light italic leading-[1.25] sm:text-4xl ${
                    dark ? "text-ivory" : "text-ink"
                  }`}
                >
                  &ldquo;{q.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-10">
                  <span
                    className={`block font-medium ${dark ? "text-ivory" : "text-ink"}`}
                  >
                    {q.name}
                  </span>
                  <span
                    className={`text-[0.72rem] uppercase tracking-[0.16em] ${
                      dark ? "text-gold/70" : "text-taupe"
                    }`}
                  >
                    {q.detail}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
