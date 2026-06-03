import Reveal from "./Reveal";

const outlets = ["SMILE: LA", "Zeus Network", "TMZ", "Yahoo", "Black Enterprise"];

export default function Media() {
  return (
    <section className="border-t border-stone/15 bg-ivory py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="text-center">
          <p className="eyebrow mb-10">As Seen On</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {outlets.map((outlet) => (
              <li
                key={outlet}
                className="font-serif text-2xl font-light text-stone/60 transition-colors hover:text-ink sm:text-3xl"
              >
                {outlet}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
