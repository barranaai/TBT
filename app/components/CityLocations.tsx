"use client";

import { useEffect, useRef, useState } from "react";

// The cities Teeth by Trev serves, shown as refined chips wherever the street
// address used to appear. For now the chips are decorative; once per-city
// addresses are confirmed, set `interactive` and fill in `lines`/`maps` to get
// a click-to-reveal address card per city.
type CityLocation = {
  city: string;
  lines?: string[];
  maps?: string;
};

const PHONE_DISPLAY = "424-672-3910";
const PHONE_SMS = "sms:+14246723910";

const locations: CityLocation[] = [
  { city: "Beverly Hills" },
  { city: "New York" },
  { city: "Atlanta" },
  { city: "Houston" },
  { city: "Miami" },
  { city: "Washington D.C." },
  { city: "Tampa" },
  { city: "Memphis" },
];

const chipBase =
  "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[0.58rem] uppercase tracking-[0.22em] transition-colors duration-300";

export default function CityLocations({
  className = "",
  interactive = false,
}: {
  className?: string;
  interactive?: boolean;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`flex flex-wrap items-center gap-2 ${className}`}
    >
      {locations.map((location) => {
        const isOpen = open === location.city;

        if (!interactive) {
          return (
            <span
              key={location.city}
              className={`${chipBase} border-ivory/12 text-ivory/45 hover:border-gold/40 hover:text-ivory/70`}
            >
              {location.city}
            </span>
          );
        }

        return (
          <span key={location.city} className="relative inline-flex">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : location.city)}
              className={`${chipBase} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
                isOpen
                  ? "border-gold/70 text-gold"
                  : "border-ivory/12 text-ivory/45 hover:border-gold/40 hover:text-gold"
              }`}
            >
              {location.city}
            </button>

            {isOpen && (
              <div className="absolute bottom-full left-1/2 z-50 mb-3 w-60 -translate-x-1/2 border border-gold/35 bg-onyx p-4 text-left shadow-[0_10px_40px_rgba(0,0,0,0.55)]">
                <p className="text-[0.6rem] uppercase tracking-[0.24em] text-gold">
                  {location.city}
                </p>
                {location.lines ? (
                  <>
                    <p className="mt-2 text-sm normal-case leading-relaxed tracking-normal text-ivory/80">
                      {location.lines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </p>
                    {location.maps && (
                      <a
                        href={location.maps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-[0.62rem] uppercase tracking-[0.2em] text-gold underline-offset-4 hover:underline"
                      >
                        Get directions ↗
                      </a>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-sm normal-case leading-relaxed tracking-normal text-ivory/80">
                    By appointment.{" "}
                    <a
                      href={PHONE_SMS}
                      className="text-gold underline-offset-4 hover:underline"
                    >
                      Text {PHONE_DISPLAY}
                    </a>{" "}
                    to arrange your visit.
                  </p>
                )}
              </div>
            )}
          </span>
        );
      })}
    </div>
  );
}
