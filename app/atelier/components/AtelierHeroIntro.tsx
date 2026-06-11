"use client";

import { useEffect, useState } from "react";
import Magnetic from "../../components/Magnetic";

export default function AtelierHeroIntro() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 150);
    return () => clearTimeout(t);
  }, []);

  const cls = `line-reveal ${revealed ? "is-revealed" : ""}`;

  return (
    <>
      <div className="mb-10 flex items-center justify-between text-[0.6rem] uppercase tracking-[0.32em] text-ivory/45">
        <span
          className={`transition-all duration-1000 ${
            revealed ? "opacity-100" : "opacity-0"
          }`}
        >
          N° 01
        </span>
        <span
          className={`hidden transition-all duration-1000 sm:block ${
            revealed ? "opacity-100" : "opacity-0"
          }`}
        >
          Cosmetic Atelier — Est. Beverly Hills
        </span>
        <span
          className={`transition-all duration-1000 ${
            revealed ? "opacity-100" : "opacity-0"
          }`}
        >
          Dr. Trevor J. Thomas
        </span>
      </div>

      <h1 className="mx-auto max-w-5xl text-center font-serif text-[3.25rem] font-light leading-[0.98] tracking-[-0.01em] text-ivory sm:text-7xl lg:text-[7.5rem]">
        <span className={cls}>
          <span style={{ transitionDelay: "200ms" }}>Where the smile</span>
        </span>
        <span className={cls}>
          <span style={{ transitionDelay: "340ms" }}>
            becomes <span className="italic text-gold">art.</span>
          </span>
        </span>
      </h1>

      <p
        className={`mx-auto mt-10 max-w-md text-center text-sm leading-relaxed tracking-wide text-ivory/55 transition-all duration-1000 ${
          revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{ transitionDelay: "650ms" }}
      >
        An atelier of cosmetic &amp; implant dentistry — composing faces,
        restoring confidence, and finishing every smile by hand.
      </p>

      <div
        className={`mt-12 flex justify-center transition-all duration-1000 ${
          revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{ transitionDelay: "800ms" }}
      >
        <Magnetic>
          <a
            href="/consultation"
            className="group inline-flex items-center gap-4 border border-ivory/30 px-9 py-4 text-[0.66rem] uppercase tracking-[0.26em] text-ivory transition-colors duration-300 hover:border-gold hover:text-gold"
          >
            Request a Consultation
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </Magnetic>
      </div>
    </>
  );
}
