"use client";

import { useEffect, useState } from "react";

const lines = [
  "It’s not about the teeth.",
  "It’s about the life your",
  "smile lets you live.",
];

export default function HeroHeadline() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <h1 className="max-w-4xl font-serif text-[2.75rem] font-light leading-[1.05] text-ivory sm:text-6xl lg:text-7xl">
      {lines.map((line, i) => (
        <span
          key={line}
          className={`line-reveal ${revealed ? "is-revealed" : ""}`}
        >
          <span style={{ transitionDelay: `${150 + i * 120}ms` }}>{line}</span>
        </span>
      ))}
    </h1>
  );
}
