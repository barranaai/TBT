import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import IntroVeil from "../components/IntroVeil";
import AtelierFooter from "../atelier/components/AtelierFooter";
import Reveal from "../components/Reveal";
import Magnetic from "../components/Magnetic";

export const metadata: Metadata = {
  title: "Book a Consultation — Teeth by Trev",
  description:
    "Reserve a private consultation with Dr. Trevor J. Thomas — in person or by video. A considered $250 conversation about the smile you imagine.",
};

// TODO: point this at the WooCommerce $250 consultation checkout once the
// final product/checkout URL is confirmed. Interim: the inquiry form.
const BOOKING_URL = "https://www.diverzeent.com/tbv-inquiry/";

const options = [
  {
    kind: "In Person",
    eyebrow: "At the studio",
    body: "Sit chairside with Dr. Trev. A full clinical assessment, digital imaging, and a tailored plan — designed around your face, in the room where the work happens.",
    points: ["Full clinical exam", "Digital imaging & scans", "Tailored treatment plan"],
    icon: (
      <path d="M12 21s-6.5-5.4-6.5-10A6.5 6.5 0 0 1 18.5 11c0 4.6-6.5 10-6.5 10Z M12 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    ),
  },
  {
    kind: "Video",
    eyebrow: "From anywhere",
    body: "A private virtual consultation by video. Share your goals and photos, and receive Dr. Trev's expert perspective and direction — wherever you are in the world.",
    points: ["Live video with Dr. Trev", "Photo-based assessment", "Clear next steps"],
    icon: (
      <path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h8a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 13 18H5a1.5 1.5 0 0 1-1.5-1.5Z M14.5 10.5l5-3v9l-5-3Z" />
    ),
  },
];

export default function ConsultationPage() {
  return (
    <div className="min-h-screen bg-onyx text-ivory">
      <IntroVeil variant="dark" />

      {/* Minimal dark header */}
      <header className="absolute inset-x-0 top-0 z-40">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6 lg:px-12">
          <Link href="/" aria-label="Teeth by Trev — home">
            <Image
              src="/brand/tbt-atelier-logo.png"
              alt="Teeth by Trev — Dental Atelier"
              width={546}
              height={256}
              priority
              className="h-10 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="text-[0.62rem] uppercase tracking-[0.28em] text-ivory/55 transition-colors hover:text-ivory"
          >
            ← Home
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(184,155,110,0.10),transparent_60%)]" />
          <div className="relative mx-auto max-w-[1600px] px-6 pb-16 pt-40 lg:px-12 lg:pb-24 lg:pt-52">
            <Reveal>
              <p className="text-[0.62rem] uppercase tracking-[0.3em] text-gold">
                The Consultation
              </p>
              <h1 className="mt-6 max-w-4xl font-serif text-5xl font-light leading-[1.04] text-ivory sm:text-6xl lg:text-7xl">
                Begin with a conversation.
              </h1>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-ivory/65 sm:text-lg">
                Every transformation starts here — an unhurried, expert
                assessment of where you are and the smile you imagine. Choose to
                meet in person or by video.
              </p>
              <p className="mt-10 inline-flex items-baseline gap-3 border-t border-ivory/15 pt-6">
                <span className="font-serif text-4xl font-light text-ivory">
                  $250
                </span>
                <span className="text-[0.66rem] uppercase tracking-[0.26em] text-ivory/50">
                  Private consultation
                </span>
              </p>
            </Reveal>
          </div>
        </section>

        {/* Two options */}
        <section className="border-t border-ivory/10 bg-onyx py-20 lg:py-28">
          <div className="mx-auto grid max-w-[1600px] gap-6 px-6 lg:grid-cols-2 lg:gap-8 lg:px-12">
            {options.map((o, i) => (
              <Reveal key={o.kind} delay={i * 120}>
                <article className="flex h-full flex-col border border-ivory/12 bg-ivory/[0.02] p-8 transition-colors duration-500 hover:border-gold/40 lg:p-12">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-9 w-9 text-gold"
                  >
                    {o.icon}
                  </svg>
                  <p className="mt-8 text-[0.62rem] uppercase tracking-[0.3em] text-gold/70">
                    {o.eyebrow}
                  </p>
                  <h2 className="mt-3 font-serif text-3xl font-light text-ivory sm:text-4xl">
                    {o.kind}
                  </h2>
                  <p className="mt-5 text-base leading-relaxed text-ivory/65">
                    {o.body}
                  </p>
                  <ul className="mt-8 space-y-3">
                    {o.points.map((p) => (
                      <li
                        key={p}
                        className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.16em] text-ivory/55"
                      >
                        <span className="text-gold">—</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10 flex items-center justify-between border-t border-ivory/10 pt-6">
                    <span className="font-serif text-2xl font-light text-ivory">
                      $250
                    </span>
                    <Magnetic>
                      <a
                        href={BOOKING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 border border-gold px-7 py-3.5 text-[0.66rem] uppercase tracking-[0.24em] text-gold transition-colors duration-300 hover:bg-gold hover:text-onyx"
                      >
                        Reserve {o.kind}
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </a>
                    </Magnetic>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="mx-auto mt-12 max-w-xl px-6 text-center text-[0.72rem] uppercase tracking-[0.2em] text-ivory/40">
              Consultations are by appointment and limited each month.
            </p>
          </Reveal>
        </section>
      </main>

      <AtelierFooter />
    </div>
  );
}
