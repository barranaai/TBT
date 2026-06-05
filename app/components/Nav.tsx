"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Smile Gallery", href: "/gallery" },
  { label: "Financing", href: "/financing" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const light = !scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open
          ? "bg-ivory/90 backdrop-blur-md border-b border-stone/15"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" aria-label="Teeth by Trev — home" className="relative block h-8 w-[114px] sm:h-9 sm:w-[129px]">
          <Image
            src="/brand/tbt-logo.png"
            alt="Teeth by Trev"
            fill
            sizes="129px"
            priority
            className={`object-contain object-left transition-opacity duration-500 ${
              light ? "opacity-100" : "opacity-0"
            }`}
          />
          <Image
            src="/brand/tbt-logo-dark.png"
            alt=""
            aria-hidden="true"
            fill
            sizes="129px"
            className={`object-contain object-left transition-opacity duration-500 ${
              light ? "opacity-0" : "opacity-100"
            }`}
          />
        </Link>

        <ul className="hidden items-center gap-9 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`link-sweep text-[0.8rem] font-medium uppercase tracking-[0.16em] transition-colors duration-300 ${
                  light
                    ? "text-ivory/75 hover:text-ivory"
                    : "text-stone hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/atelier"
              className={`link-sweep inline-flex items-center gap-1.5 text-[0.8rem] font-medium uppercase tracking-[0.16em] transition-colors duration-300 ${
                light ? "text-champagne hover:text-ivory" : "text-gold hover:text-ink"
              }`}
            >
              <span className="text-[0.7em]">✦</span>
              The Atelier
            </Link>
          </li>
        </ul>

        <div className="hidden lg:block">
          <a
            href="https://www.diverzeent.com/tbv-inquiry/"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center border px-6 py-3 text-[0.72rem] font-medium uppercase tracking-[0.2em] transition-colors duration-300 ${
              light
                ? "border-ivory/50 text-ivory hover:bg-ivory hover:text-ink"
                : "border-ink text-ink hover:bg-ink hover:text-ivory"
            }`}
          >
            Book Consultation
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[6px] lg:hidden"
        >
          <span
            className={`h-px w-7 transition-transform duration-300 ${
              light ? "bg-ivory" : "bg-ink"
            } ${open ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-7 transition-opacity duration-300 ${
              light ? "bg-ivory" : "bg-ink"
            } ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`h-px w-7 transition-transform duration-300 ${
              light ? "bg-ivory" : "bg-ink"
            } ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-stone/15 bg-ivory transition-[max-height] duration-500 ease-in-out lg:hidden ${
          open ? "max-h-[80vh]" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-6 py-6">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-3 font-serif text-2xl text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/atelier"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 py-3 font-serif text-2xl text-gold"
            >
              <span className="text-base">✦</span>
              The Atelier
            </Link>
          </li>
          <li className="pt-4">
            <a
              href="https://www.diverzeent.com/tbv-inquiry/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center bg-ink px-6 py-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ivory"
            >
              Book Consultation
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
