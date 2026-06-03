import Reveal from "./Reveal";

export default function PullQuote() {
  return (
    <section className="relative overflow-hidden bg-cream py-28 lg:py-40">
      {/* Ghosted editorial quotation mark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 font-serif text-[16rem] leading-none text-gold/10 sm:text-[22rem]"
      >
        &ldquo;
      </span>

      <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-10">
        <Reveal>
          <p className="eyebrow mb-10">In His Words</p>
          <blockquote className="font-serif text-3xl font-light leading-[1.22] text-ink sm:text-4xl lg:text-[3.25rem] lg:leading-[1.18]">
            A smile isn&apos;t cosmetic. It&apos;s the first thing you give the
            world and the last thing you forget about yourself. My work is to
            give people back something they thought was gone for good.
          </blockquote>
          <div className="mt-12 flex items-center justify-center gap-4">
            <span aria-hidden="true" className="h-px w-10 bg-gold/50" />
            <span className="text-[0.72rem] uppercase tracking-[0.26em] text-stone">
              Dr. Trevor J. Thomas, DDS
            </span>
            <span aria-hidden="true" className="h-px w-10 bg-gold/50" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
