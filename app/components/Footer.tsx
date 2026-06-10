import Image from "next/image";
import Link from "next/link";

const nav = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Smile Gallery", href: "/gallery" },
  { label: "Financing", href: "/financing" },
  { label: "The Atelier", href: "/atelier" },
  {
    label: "Book Consultation",
    href: "https://www.diverzeent.com/tbv-inquiry/",
    external: true,
  },
];

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

export default function Footer() {
  return (
    <footer className="bg-ink py-16 text-ivory/70">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-10 border-b border-ivory/10 pb-12 lg:flex-row">
          <div>
            <Link
              href="/"
              aria-label="Teeth by Trev — home"
              className="inline-block"
            >
              <Image
                src="/brand/tbt-atelier-logo.png"
                alt="Teeth by Trev — Dental Atelier"
                width={546}
                height={256}
                className="h-16 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Cosmetic &amp; implant dentistry by Dr. Trevor J. Thomas, DDS.
              Real people. Real problems. Real results.
            </p>
            <ul className="mt-6 flex items-center gap-4">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory/70 transition-colors hover:border-champagne hover:text-champagne"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      {social.icon}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-col gap-3 lg:items-end">
              {nav.map((item) =>
                item.external ? (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm uppercase tracking-[0.14em] transition-colors hover:text-champagne"
                    >
                      {item.label}
                    </a>
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm uppercase tracking-[0.14em] transition-colors hover:text-champagne"
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>
        </div>
        <div className="mt-8 flex flex-col items-start justify-between gap-3 text-xs uppercase tracking-[0.14em] text-ivory/40 sm:flex-row">
          <span>
            &copy; {new Date().getFullYear()} Teeth by Trev. All rights reserved.
          </span>
          <span>
            Los Angeles · New York · Atlanta · Houston · Washington D.C. ·
            Tampa · Memphis
          </span>
        </div>
      </div>
    </footer>
  );
}
