import Reveal from "../../components/Reveal";
import LineReveal from "./LineReveal";

const steps = [
  {
    index: "I",
    title: "The Consultation",
    note: "We begin in conversation — studying your face, your bite, and the smile you imagine. Nothing is templated.",
  },
  {
    index: "II",
    title: "The Design",
    note: "A bespoke blueprint, previewed before a single tooth is touched. Proportion, translucency, and line are drawn to your features.",
  },
  {
    index: "III",
    title: "The Craft",
    note: "Each restoration is hand-layered and refined under magnification — ceramic worked like fine material until it disappears.",
  },
  {
    index: "IV",
    title: "The Reveal",
    note: "The finished smile is placed, balanced, and polished. The result looks not done, but inevitable — as though it was always yours.",
  },
];

export default function Process() {
  return (
    <section className="border-t border-ivory/10 bg-onyx py-24 lg:py-32">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="mb-16 flex items-end justify-between border-b border-ivory/10 pb-6">
          <h2 className="font-serif text-4xl font-light text-ivory sm:text-5xl">
            <LineReveal>The Ritual</LineReveal>
          </h2>
          <span className="text-[0.6rem] uppercase tracking-[0.3em] text-ivory/40">
            Four Movements
          </span>
        </div>

        <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.index} delay={i * 90}>
              <div className="flex h-full flex-col border-t border-gold/25 pt-6">
                <span className="font-serif text-5xl font-light leading-none text-gold/40">
                  {step.index}
                </span>
                <h3 className="mt-6 font-serif text-2xl font-light text-ivory">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-ivory/55">
                  {step.note}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
