import Image from "next/image";
import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";
import SectionMotifs from "./SectionMotifs";

const services = [
  {
    no: "01",
    title: "Smile Makeovers",
    body: "A fully bespoke redesign of your smile — proportion, shade, and character tailored to your face and personality.",
    image: "/stock/service-smile-makeover.jpg",
    alt: "Dr. Trevor J. Thomas presenting a smile makeover plan to a patient",
    position: "object-top",
  },
  {
    no: "02",
    title: "Porcelain Veneers",
    body: "Hand-finished ceramic artistry that corrects shape, color, and alignment with natural, light-catching translucency.",
    image: "/stock/service-veneers.jpg",
    alt: "Dr. Trevor J. Thomas hand-finishing porcelain veneers at the bench",
  },
  {
    no: "03",
    title: "Dental Implants",
    body: "Permanent, lifelike tooth replacement — engineered for function and finished for beauty.",
    image: "/stock/service-implants.jpg",
    alt: "Dr. Trevor J. Thomas discussing dental implants with a patient beside a panoramic X-ray",
  },
  {
    no: "04",
    title: "Full-Mouth Rehabilitation",
    body: "Complex, life-restoring reconstruction that rebuilds health, bite, and confidence from the ground up.",
    image: "/stock/service-full-mouth.jpg",
    alt: "Dr. Trevor J. Thomas performing a full-mouth rehabilitation procedure",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="relative isolate overflow-hidden bg-cream py-28 lg:py-40"
    >
      <SectionMotifs variant={1} />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="max-w-2xl">
          <Eyebrow index="02" className="mb-6">
            The Craft
          </Eyebrow>
          <h2 className="font-serif text-4xl font-light leading-[1.1] text-ink sm:text-5xl">
            Signature services, executed as artistry.
          </h2>
          <span className="accent-line mt-8" />
        </Reveal>

        <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.no} delay={(i % 2) * 100}>
              <article className="group">
                <div className="relative aspect-[5/4] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    sizes="(min-width: 640px) 45vw, 100vw"
                    className={`object-cover ${service.position ?? "object-center"} transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105`}
                  />
                  <div className="absolute inset-0 bg-ink/10 transition-opacity duration-500 group-hover:bg-ink/0" />
                  <span className="absolute left-5 top-5 font-serif text-2xl text-ivory/90 drop-shadow">
                    {service.no}
                  </span>
                </div>
                <div className="mt-7 flex items-start justify-between gap-6 border-t border-stone/20 pt-6">
                  <div>
                    <h3 className="font-serif text-3xl font-light text-ink">
                      {service.title}
                    </h3>
                    <p className="mt-3 max-w-md text-base leading-relaxed text-stone">
                      {service.body}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="mt-2 shrink-0 text-gold transition-transform duration-500 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
