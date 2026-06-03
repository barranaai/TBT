import Image from "next/image";
import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";

const services = [
  {
    no: "01",
    title: "Smile Makeovers",
    body: "A fully bespoke redesign of your smile — proportion, shade, and character tailored to your face and personality.",
    image: "/stock/dental-8413334.jpg",
    alt: "Dentist carefully treating a patient under studio light",
  },
  {
    no: "02",
    title: "Porcelain Veneers",
    body: "Hand-finished ceramic artistry that corrects shape, color, and alignment with natural, light-catching translucency.",
    image: "/stock/dental-6627524.jpg",
    alt: "Close-up of a refined dental procedure in progress",
  },
  {
    no: "03",
    title: "Dental Implants",
    body: "Permanent, lifelike tooth replacement — engineered for function and finished for beauty.",
    image: "/stock/dental-7800675.jpg",
    alt: "Clinicians reviewing a patient's dental imaging together",
  },
  {
    no: "04",
    title: "Full-Mouth Rehabilitation",
    body: "Complex, life-restoring reconstruction that rebuilds health, bite, and confidence from the ground up.",
    image: "/stock/dental-3845954.jpg",
    alt: "Detailed restorative dental work being performed",
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-cream py-28 lg:py-40">
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
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    sizes="(min-width: 640px) 45vw, 100vw"
                    className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
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
