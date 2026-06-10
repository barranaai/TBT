"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { label: "Maison", href: "#maison" },
  { label: "Work", href: "#work" },
  { label: "Atelier", href: "#atelier" },
  { label: "Contact", href: "#contact" },
];

export default function AtelierNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-8 sm:px-11 sm:py-11 lg:px-14 lg:py-14">
        <a href="#top" aria-label="Teeth by Trev — Atelier" className="relative z-10">
          <Image
            src="/brand/tbt-atelier-logo.png"
            alt="Teeth by Trev — Dental Atelier"
            width={546}
            height={256}
            priority
            className="h-12 w-auto"
          />
        </a>

        <div className="flex items-center gap-8">
          <Link
            href="/consultation"
            className="hidden border border-gold/50 px-5 py-2.5 text-[0.6rem] uppercase tracking-[0.24em] text-gold transition-colors duration-300 hover:bg-gold hover:text-onyx sm:block"
          >
            Book
          </Link>
          <Link
            href="/classic"
            className="hidden text-[0.62rem] uppercase tracking-[0.28em] text-ivory/55 transition-colors hover:text-ivory sm:block"
          >
            Classic Site
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="relative z-10 flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.28em] text-ivory"
          >
            <span className="flex flex-col gap-[5px]">
              <span
                className={`h-px w-6 bg-current transition-transform duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`}
              />
              <span
                className={`h-px w-6 bg-current transition-opacity duration-300 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`h-px w-6 bg-current transition-transform duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
              />
            </span>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {/* Full-screen overlay menu */}
      <div
        className={`fixed inset-0 z-0 bg-onyx transition-opacity duration-500 ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1600px] flex-col justify-center px-6 lg:px-12">
          <ul className="space-y-2">
            {links.map((link, i) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-6 py-2"
                >
                  <span className="font-sans text-[0.7rem] tabular-nums text-gold/70">
                    0{i + 1}
                  </span>
                  <span className="font-serif text-5xl font-light text-ivory/80 transition-colors duration-300 group-hover:text-gold sm:text-7xl">
                    {link.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <Link
            href="/classic"
            onClick={() => setOpen(false)}
            className="mt-12 inline-block text-[0.62rem] uppercase tracking-[0.28em] text-ivory/50 transition-colors hover:text-ivory sm:hidden"
          >
            ← Classic Site
          </Link>
        </div>
      </div>
    </header>
  );
}
