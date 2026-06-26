import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import IntroVeil from "../components/IntroVeil";
import AtelierFooter from "../atelier/components/AtelierFooter";
import Reveal from "../components/Reveal";
import SquareDeposit from "../components/SquareDeposit";

export const metadata: Metadata = {
  title: "Reserve Your Consultation — Teeth by Trev",
  description:
    "Secure your private consultation with Dr. Trevor J. Thomas with a $250 deposit, credited 100% toward your treatment.",
  robots: { index: false },
};

export default async function ReservePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const kind: "in-person" | "video" | undefined =
    type === "in-person" ? "in-person" : type === "video" ? "video" : undefined;
  const label =
    kind === "in-person"
      ? "In-person consultation"
      : kind === "video"
        ? "Video consultation"
        : "Private consultation";

  return (
    <div className="min-h-screen bg-onyx text-ivory">
      <IntroVeil variant="dark" />

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
            href="/consultation"
            className="text-[0.62rem] uppercase tracking-[0.28em] text-ivory/55 transition-colors hover:text-ivory"
          >
            ← Consultation
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(184,155,110,0.10),transparent_60%)]" />
          <div className="relative mx-auto max-w-[1600px] px-6 pb-20 pt-40 lg:px-12 lg:pb-28 lg:pt-52">
            <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
              <Reveal>
                <p className="text-[0.62rem] uppercase tracking-[0.3em] text-gold">
                  Reserve · {label}
                </p>
                <h1 className="mt-6 max-w-xl font-serif text-4xl font-light leading-[1.06] text-ivory sm:text-5xl lg:text-6xl">
                  Secure your place with Dr. Trev.
                </h1>
                <p className="mt-7 max-w-md text-base leading-relaxed text-ivory/65">
                  A $250 deposit confirms your private consultation and is
                  credited 100% toward your treatment. Consultations are by
                  appointment and limited each month.
                </p>
                <ul className="mt-9 space-y-3">
                  {[
                    "Credited fully toward your treatment",
                    "Secured & encrypted by Square",
                    "A considered, unhurried conversation",
                  ].map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.16em] text-ivory/55"
                    >
                      <span className="text-gold">—</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={120}>
                <SquareDeposit type={kind} />
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <AtelierFooter />
    </div>
  );
}
