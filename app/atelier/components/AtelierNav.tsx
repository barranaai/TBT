"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Financing", href: "/financing" },
  { label: "Contact", href: "/contact" },
];

export default function AtelierNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Solid backdrop once scrolled (or while the overlay menu is open) so the
  // logo and menu stay legible over light page content.
  const showBackdrop = scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        showBackdrop ? "border-b border-ivory/10 bg-onyx/85 backdrop-blur-md" : ""
      }`}
    >
      <nav
        className={`mx-auto flex max-w-[1600px] items-center justify-between px-8 transition-all duration-500 sm:px-11 lg:px-14 ${
          showBackdrop
            ? "py-4 sm:py-5 lg:py-5"
            : "py-8 sm:py-11 lg:py-14"
        }`}
      >
        <Link href="/" aria-label="Teeth by Trev — home" className="relative z-10">
          <Image
            src="/brand/tbt-atelier-logo.png"
            alt="Teeth by Trev — Dental Atelier"
            width={546}
            height={256}
            priority
            className="h-12 w-auto"
          />
        </Link>

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
          <ul className="space-y-1">
            {links.map((link, i) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-6 py-2"
                >
                  <span className="font-sans text-[0.7rem] tabular-nums text-gold/70">
                    0{i + 1}
                  </span>
                  <span className="font-serif text-4xl font-light text-ivory/80 transition-colors duration-300 group-hover:text-gold sm:text-6xl">
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-wrap items-center gap-6">
            <Link
              href="/consultation"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-3 border border-gold px-7 py-3.5 text-[0.62rem] uppercase tracking-[0.24em] text-gold transition-colors duration-300 hover:bg-gold hover:text-onyx"
            >
              Book a Consultation →
            </Link>
            <Link
              href="/classic"
              onClick={() => setOpen(false)}
              className="text-[0.62rem] uppercase tracking-[0.28em] text-ivory/50 transition-colors hover:text-ivory"
            >
              Classic Site
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
