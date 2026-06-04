import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import IntroVeil from "../components/IntroVeil";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import Process from "../components/Process";
import Reveal from "../components/Reveal";
import Eyebrow from "../components/Eyebrow";
import Magnetic from "../components/Magnetic";

export const metadata: Metadata = {
  title: "Services — Teeth by Trev",
  description:
    "Smile makeovers, porcelain veneers, dental implants, and full-mouth rehabilitation — signature cosmetic & implant dentistry by Dr. Trevor J. Thomas.",
};

const services = [
  {
    no: "01",
    title: "Smile Makeovers",
    body: "A fully bespoke redesign of your smile. We study proportion, shade, and character against your face and personality, then build a plan that looks like the best version of you — never someone else.",
    points: ["Digital smile preview", "Custom shade & shape", "Face-first design"],
    image: "/stock/service-smile-makeover.jpg",
    alt: "Dr. Trevor J. Thomas presenting a smile makeover plan to a patient",
    position: "object-top",
  },
  {
    no: "02",
    title: "Porcelain Veneers",
    body: "Hand-finished ceramic artistry that corrects shape, color, and alignment with natural, light-catching translucency. Each veneer is layered by hand until it disappears into your smile.",
    points: ["Minimal-prep options", "Hand-layered ceramic", "Lifelike translucency"],
    image: "/stock/service-veneers.jpg",
    alt: "Dr. Trevor J. Thomas hand-finishing porcelain veneers at the bench",
  },
  {
    no: "03",
    title: "Dental Implants",
    body: "Permanent, lifelike tooth replacement engineered for function and finished for beauty. From single teeth to full arches, implants restore your bite and your confidence for good.",
    points: ["Single & full-arch", "Guided placement", "Restored function"],
    image: "/stock/service-implants.jpg",
    alt: "Dr. Trevor J. Thomas discussing dental implants with a patient beside a panoramic X-ray",
  },
  {
    no: "04",
    title: "Full-Mouth Rehabilitation",
    body: "Complex, life-restoring reconstruction that rebuilds health, bite, and confidence from the ground up. The most demanding work in dentistry, performed with patience and precision.",
    points: ["Comprehensive plan", "Bite & health restored", "Staged for comfort"],
    image: "/stock/service-full-mouth.jpg",
    alt: "Dr. Trevor J. Thomas performing a full-mouth rehabilitation procedure",
  },
];

export default function ServicesPage() {
  return (
    <>
      <IntroVeil variant="light" />
      <Nav />
      <main className="flex-1">
        <PageHero
          eyebrow="The Craft"
          title="Signature services, executed as artistry."
          intro="Every treatment is designed and finished by hand — proportion, translucency, and line drawn to your features."
          image="/stock/service-veneers.jpg"
          imageAlt="Dr. Trevor J. Thomas hand-finishing porcelain veneers at the bench"
        />

        <section className="bg-ivory py-28 lg:py-40">
          <div className="mx-auto max-w-7xl space-y-28 px-6 lg:space-y-40 lg:px-10">
            {services.map((service, i) => (
              <div
                key={service.no}
                className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24"
              >
                <Reveal
                  className={i % 2 === 1 ? "lg:order-2" : ""}
                >
                  <div className="relative aspect-[5/4] overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.alt}
                      fill
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className={`object-cover ${service.position ?? "object-center"}`}
                    />
                  </div>
                </Reveal>

                <Reveal
                  delay={120}
                  className={i % 2 === 1 ? "lg:order-1" : ""}
                >
                  <span className="font-serif text-5xl font-light leading-none text-gold/40">
                    {service.no}
                  </span>
                  <h2 className="mt-6 font-serif text-4xl font-light leading-[1.1] text-ink sm:text-5xl">
                    {service.title}
                  </h2>
                  <p className="mt-6 max-w-md text-base leading-relaxed text-stone sm:text-lg">
                    {service.body}
                  </p>
                  <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                    {service.points.map((point) => (
                      <li
                        key={point}
                        className="text-[0.72rem] uppercase tracking-[0.18em] text-stone"
                      >
                        <span className="mr-2 text-gold">—</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            ))}
          </div>
        </section>

        <Process />

        {/* CTA */}
        <section className="bg-espresso py-24 text-ivory lg:py-32">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-6 lg:flex-row lg:items-center lg:px-10">
            <Reveal>
              <Eyebrow className="mb-6 text-champagne">Begin</Eyebrow>
              <h2 className="max-w-2xl font-serif text-4xl font-light leading-[1.08] text-ivory sm:text-5xl">
                Not sure where to start? Let&apos;s talk it through.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <Magnetic>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-ivory px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-champagne"
                >
                  Book Your Consultation
                </Link>
              </Magnetic>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
