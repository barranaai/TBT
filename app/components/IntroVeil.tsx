"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type IntroVeilProps = {
  variant?: "light" | "dark";
};

export default function IntroVeil({ variant = "light" }: IntroVeilProps) {
  const [phase, setPhase] = useState<"hidden" | "in" | "lift" | "done">(
    "hidden",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const seen = sessionStorage.getItem("tbt-intro-seen");

    if (seen || reduce) {
      setPhase("done");
      return;
    }

    sessionStorage.setItem("tbt-intro-seen", "1");
    document.body.style.overflow = "hidden";

    const t1 = setTimeout(() => setPhase("in"), 60);
    const t2 = setTimeout(() => setPhase("lift"), 1100);
    const t3 = setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = "";
    }, 2050);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "done") return null;

  const dark = variant === "dark";
  const logo = dark ? "/brand/tbt-logo.png" : "/brand/tbt-logo-dark.png";

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[10000] flex items-center justify-center transition-transform duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
        dark ? "bg-onyx" : "bg-ivory"
      } ${phase === "lift" ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div
        className={`flex flex-col items-center transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          phase === "in"
            ? "translate-y-0 opacity-100"
            : "translate-y-3 opacity-0"
        }`}
      >
        <Image
          src={logo}
          alt="Teeth by Trev"
          width={1024}
          height={286}
          priority
          className="h-9 w-auto sm:h-11"
        />
        <span
          className={`mt-6 h-px bg-gold transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            phase === "in" ? "w-24 opacity-60" : "w-0 opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
