// Cities served — sticky marquee bar. Update this list as locations change.
const items = ["Los Angeles", "Beverly Hills", "Atlanta", "New York"];

export default function Marquee() {
  const sequence = [...items, ...items];
  return (
    <div className="border-y border-ivory/10 bg-onyx py-6">
      <div className="flex overflow-hidden">
        <div className="flex shrink-0 whitespace-nowrap motion-safe:animate-[marquee_38s_linear_infinite] motion-reduce:animate-none">
          {sequence.map((item, i) => (
            <span
              key={i}
              className="mx-8 flex items-center gap-8 font-serif text-2xl font-light text-ivory/70 sm:text-3xl"
            >
              {item}
              <span className="text-gold">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
