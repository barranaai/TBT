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

export default function Testimonials() {
  return (
    <section className="bg-ivory py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {quotes.map((q, i) => (
            <Reveal key={q.name} delay={i * 120}>
              <figure className="flex h-full flex-col justify-between border-t border-stone/20 pt-10">
                <blockquote className="font-serif text-3xl font-light italic leading-[1.25] text-ink sm:text-4xl">
                  &ldquo;{q.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-10">
                  <span className="block font-medium text-ink">{q.name}</span>
                  <span className="text-[0.72rem] uppercase tracking-[0.16em] text-taupe">
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
