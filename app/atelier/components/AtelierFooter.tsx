import Image from "next/image";
import Link from "next/link";

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/dr.trevthomas/",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/dr.trevthomas/",
    icon: (
      <path
        d="M14 8.5h2.5M14 8.5V7a2 2 0 0 1 2-2h.5M14 8.5V21M14 8.5h-1.5m1.5 4.5h-3"
        strokeWidth="1.5"
      />
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@dr.trevthomas",
    icon: (
      <path
        d="M13.5 4v9.5a3.5 3.5 0 1 1-3.5-3.5M13.5 4c.3 2.2 1.8 3.8 4 4"
        strokeWidth="1.5"
      />
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/drtrev/",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth="1.5" />
        <path
          d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7"
          strokeWidth="1.5"
        />
      </>
    ),
  },
];

export default function AtelierFooter() {
  return (
    <footer className="border-t border-ivory/10 bg-onyx py-16">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Image
              src="/brand/tbt-atelier-logo.png"
              alt="Teeth by Trev — Dental Atelier"
              width={546}
              height={256}
              className="h-14 w-auto"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/45">
              An atelier of cosmetic &amp; implant dentistry by Dr. Trevor J.
              Thomas, DDS.
            </p>
            <address className="mt-6 text-sm not-italic leading-relaxed text-ivory/45">
              436 N Bedford Dr #300
              <br />
              Beverly Hills, CA 90210
              <br />
              <a
                href="tel:+14243946159"
                className="transition-colors hover:text-gold"
              >
                424-394-6159
              </a>
            </address>

            <ul className="mt-7 flex items-center gap-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory/55 transition-colors duration-300 hover:border-gold hover:text-gold"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-[18px] w-[18px]"
                    >
                      {s.icon}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
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
            <Link href="/consultation" className="transition-colors hover:text-gold">
              Book
            </Link>
            <Link href="/classic" className="transition-colors hover:text-gold">
              Classic Site
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-ivory/10 pt-8 text-[0.58rem] uppercase tracking-[0.26em] text-ivory/35 sm:flex-row">
          <span>
            &copy; {new Date().getFullYear()} Teeth by Trev. All rights reserved.
          </span>
          <span>
            Beverly Hills · New York · Atlanta · Houston · Washington D.C. ·
            Tampa · Memphis
          </span>
        </div>
      </div>
    </footer>
  );
}
