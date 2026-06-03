import Image from "next/image";
import Eyebrow from "./Eyebrow";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  image: string;
  imageAlt: string;
};

export default function PageHero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/60" />

      <div className="relative z-10 mx-auto flex min-h-[60vh] max-w-7xl flex-col justify-end px-6 pb-20 pt-40 lg:px-10 lg:pb-28 lg:pt-52">
        <Eyebrow className="mb-6 text-champagne">{eyebrow}</Eyebrow>
        <h1 className="max-w-4xl font-serif text-5xl font-light leading-[1.04] text-ivory sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-8 max-w-xl text-base leading-relaxed text-ivory/75 sm:text-lg">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}
