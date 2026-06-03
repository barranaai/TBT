"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import LineReveal from "./LineReveal";
import Reveal from "../../components/Reveal";

const services = [
  {
    label: "Porcelain Veneers",
    meta: "Cosmetic",
    image: "/stock/dental-5622257.jpg",
  },
  {
    label: "Dental Implants",
    meta: "Restorative",
    image: "/stock/dental-6627447.jpg",
  },
  {
    label: "Smile Design",
    meta: "Bespoke",
    image: "/stock/poster-48173.jpg",
  },
  {
    label: "Full-Mouth Rehabilitation",
    meta: "Reconstruction",
    image: "/stock/dental-5622257.jpg",
  },
  {
    label: "Professional Whitening",
    meta: "Refinement",
    image: "/stock/poster-48173.jpg",
  },
];

export default function ServiceList() {
  const [active, setActive] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);
  const seeded = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const onMove = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!seeded.current) {
        pos.current = { x: e.clientX, y: e.clientY };
        seeded.current = true;
      }
    };

    const tick = () => {
      const ease = reduce ? 1 : 0.14;
      pos.current.x += (target.current.x - pos.current.x) * ease;
      pos.current.y += (target.current.y - pos.current.y) * ease;
      if (previewRef.current) {
        previewRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      frame.current = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <section id="atelier" className="relative bg-onyx py-24 lg:py-32">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="mb-16 flex items-end justify-between border-b border-ivory/10 pb-6">
          <h2 className="font-serif text-4xl font-light text-ivory sm:text-5xl">
            <LineReveal>The Atelier</LineReveal>
          </h2>
          <span className="text-[0.6rem] uppercase tracking-[0.3em] text-ivory/40">
            Disciplines
          </span>
        </div>

        {/* Cursor-following preview image (desktop) */}
        <div
          ref={previewRef}
          aria-hidden="true"
          className={`pointer-events-none fixed left-0 top-0 z-30 hidden h-72 w-56 lg:block ${
            active === null ? "opacity-0" : "opacity-100"
          } transition-opacity duration-500`}
          style={{ willChange: "transform" }}
        >
          {services.map((s, i) => (
            <div
              key={s.label}
              className={`absolute inset-0 overflow-hidden transition-all duration-500 ${
                active === i ? "scale-100 opacity-100" : "scale-105 opacity-0"
              }`}
            >
              <Image
                src={s.image}
                alt=""
                fill
                sizes="224px"
                className="object-cover"
              />
              <div className="absolute inset-0 border border-gold/30" />
            </div>
          ))}
        </div>

        <ul>
          {services.map((s, i) => (
            <Reveal as="li" key={s.label} delay={i * 70}>
              <a
                href="#contact"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className="group flex items-center justify-between gap-6 border-b border-ivory/10 py-7 transition-colors duration-500 lg:py-9"
              >
                <span className="flex items-baseline gap-5">
                  <span className="font-sans text-[0.7rem] tabular-nums text-gold/60">
                    0{i + 1}
                  </span>
                  <span className="font-serif text-3xl font-light text-ivory/75 transition-colors duration-300 group-hover:text-gold sm:text-5xl lg:text-6xl">
                    {s.label}
                  </span>
                </span>
                <span className="hidden text-[0.6rem] uppercase tracking-[0.28em] text-ivory/40 transition-colors duration-300 group-hover:text-ivory/70 sm:block">
                  {s.meta}
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
