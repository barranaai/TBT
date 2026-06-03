import Image from "next/image";
import Link from "next/link";

export default function AtelierFooter() {
  return (
    <footer className="border-t border-ivory/10 bg-onyx py-16">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Image
              src="/brand/tbt-logo.png"
              alt="Teeth by Trev"
              width={1024}
              height={286}
              className="h-8 w-auto"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/45">
              An atelier of cosmetic &amp; implant dentistry by Dr. Trevor J.
              Thomas, DDS.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-[0.62rem] uppercase tracking-[0.26em] text-ivory/45 lg:items-end">
            <a href="#maison" className="transition-colors hover:text-gold">
              Maison
            </a>
            <a href="#work" className="transition-colors hover:text-gold">
              Work
            </a>
            <a href="#atelier" className="transition-colors hover:text-gold">
              Atelier
            </a>
            <Link href="/" className="transition-colors hover:text-gold">
              Classic Site
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-ivory/10 pt-8 text-[0.58rem] uppercase tracking-[0.26em] text-ivory/35 sm:flex-row">
          <span>
            &copy; {new Date().getFullYear()} Teeth by Trev. All rights reserved.
          </span>
          <span>Los Angeles · Beverly Hills · Atlanta · New York</span>
        </div>
      </div>
    </footer>
  );
}
