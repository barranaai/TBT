"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  value: number;
  suffix?: string;
  label: string;
};

const stats: Stat[] = [
  { value: 10, suffix: "+", label: "Years in Practice" },
  { value: 5000, suffix: "+", label: "Smiles Transformed" },
  { value: 7, label: "Cities Served" },
  { value: 15, suffix: "+", label: "Celebrity Smiles" },
];

function useCountUp(target: number, run: boolean, duration = 1600) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Reduced-motion users skip the animation and jump to the final value;
      // matchMedia is client-only so this must run in the effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setN(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return n;
}

function StatItem({ stat, run }: { stat: Stat; run: boolean }) {
  const n = useCountUp(stat.value, run);
  return (
    <div className="text-center">
      <div className="font-serif text-5xl font-light tracking-tight text-ivory tabular-nums sm:text-6xl lg:text-7xl">
        {n.toLocaleString()}
        {stat.suffix && <span className="text-champagne">{stat.suffix}</span>}
      </div>
      <span
        aria-hidden="true"
        className={`mx-auto mt-5 block h-px w-10 origin-center bg-champagne/60 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          run ? "scale-x-100" : "scale-x-0"
        }`}
      />
      <div className="mt-4 text-[0.62rem] uppercase tracking-[0.26em] text-ivory/50">
        {stat.label}
      </div>
    </div>
  );
}

export default function Stats() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRun(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-ink py-24 lg:py-28">
      <div
        ref={ref}
        className="mx-auto grid max-w-7xl grid-cols-2 gap-y-14 px-6 lg:grid-cols-4 lg:gap-y-0 lg:px-10"
      >
        {stats.map((stat) => (
          <StatItem key={stat.label} stat={stat} run={run} />
        ))}
      </div>
    </section>
  );
}
