import Image from "next/image";
import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";
import SectionMotifs from "./SectionMotifs";

const steps = [
  {
    no: "I",
    title: "The Consultation",
    body: "We listen first. Your goals, your history, your story — mapped into a clear, honest plan with no surprises.",
  },
  {
    no: "II",
    title: "The Design",
    body: "Your new smile is sculpted digitally and previewed before a single procedure — designed around your face, not a template.",
  },
  {
    no: "III",
    title: "The Reveal",
    body: "Precision execution, hand-finished detail, and the moment you see yourself fully — often for the very first time.",
  },
];

export default function Process() {
  return (
    <section className="relative isolate overflow-hidden bg-espresso py-28 text-ivory lg:py-40">
      <SectionMotifs variant={3} />
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[0.85fr_1fr] lg:items-center lg:gap-20 lg:px-10">
        <Reveal>
          <div className="relative aspect-[3/2] overflow-hidden">
            <Image
              src="/stock/process.jpg"
              alt="Dr. Trevor J. Thomas holding a mirror and explorer in the Teeth by Trev operatory"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-ivory/10" />
          </div>
        </Reveal>

        <div>
          <Reveal className="max-w-xl">
            <Eyebrow index="04" className="mb-6 text-champagne">
              The Experience
            </Eyebrow>
            <h2 className="font-serif text-4xl font-light leading-[1.1] text-ivory sm:text-5xl">
              Three steps to the smile that&apos;s always been yours.
            </h2>
          </Reveal>

          <div className="mt-14 space-y-12">
            {steps.map((step, i) => (
              <Reveal key={step.no} delay={i * 120}>
                <div className="flex gap-6 border-t border-ivory/15 pt-8">
                  <span className="font-serif text-4xl font-light leading-none text-champagne">
                    {step.no}
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl font-light text-ivory">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-md text-base leading-relaxed text-ivory/70">
                      {step.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
