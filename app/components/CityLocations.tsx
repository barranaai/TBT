"use client";

import { useEffect, useRef, useState } from "react";

// The cities Teeth by Trev serves, as refined chips. Clicking a chip reveals
// the location card — partner venue, address and a directions link. Cities
// without a confirmed address invite the visitor to text the concierge number.
type CityLocation = {
  city: string;
  venue?: string;
  lines?: string[];
  maps?: string;
};

const PHONE_DISPLAY = "424-672-3910";
const PHONE_SMS = "sms:+14246723910";

const gmaps = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

const locations: CityLocation[] = [
  {
    city: "Beverly Hills",
    venue: "Bedford Dental Group",
    lines: ["436 N Bedford Dr, Suite 300", "Beverly Hills, CA 90210"],
    maps: gmaps("Bedford Dental Group, 436 N Bedford Dr Suite 300, Beverly Hills, CA 90210"),
  },
  {
    city: "New York",
    venue: "Nylo",
    lines: ["10 W 37th St, 3rd Floor", "New York, NY 10018"],
    maps: gmaps("10 W 37th St 3rd Floor, New York, NY 10018"),
  },
  {
    city: "Brooklyn",
    venue: "Pure Dentistry Arts",
    lines: ["761 Washington Ave", "Brooklyn, NY 11238"],
    maps: gmaps("Pure Dentistry Arts, 761 Washington Ave, Brooklyn, NY 11238"),
  },
  {
    city: "Atlanta",
    venue: "Dentistry in Motion Suites",
    lines: ["572 Hank Aaron Drive SE, Suite 1110", "Atlanta, GA 30312"],
    maps: gmaps("Dentistry in Motion Suites, 572 Hank Aaron Drive SE Suite 1110, Atlanta, GA 30312"),
  },
  {
    city: "Houston",
    venue: "FLOSS Midtown",
    lines: ["2707 Milam St, Suite C", "Houston, TX 77006"],
    maps: gmaps("FLOSS Midtown, 2707 Milam St Suite C, Houston, TX 77006"),
  },
  {
    city: "Miami",
    venue: "All Smiles at Sunset",
    lines: ["8585 SW 72nd Street, Suite 101", "Miami, FL 33143"],
    maps: gmaps("All Smiles at Sunset, 8585 SW 72nd Street Suite 101, Miami, FL 33143"),
  },
  {
    city: "Washington D.C.",
    lines: ["1010 Quincy St NE", "Washington, DC 20017"],
    maps: gmaps("1010 Quincy St NE, Washington, DC 20017"),
  },
  { city: "Tampa" },
  { city: "Memphis" },
];

const chipBase =
  "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[0.58rem] uppercase tracking-[0.22em] transition-colors duration-300";

export default function CityLocations({
  className = "",
  interactive = true,
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
              // On small screens the card is fixed near the bottom center so an
              // edge chip can never push it off-screen; from sm up it floats
              // above the chip.
              <div className="fixed bottom-20 left-1/2 z-50 w-64 -translate-x-1/2 border border-gold/35 bg-onyx p-5 text-left shadow-[0_10px_40px_rgba(0,0,0,0.6)] sm:absolute sm:bottom-full sm:left-1/2 sm:mb-3 sm:w-64">
                <p className="text-[0.6rem] uppercase tracking-[0.24em] text-gold">
                  {location.city}
                </p>
                {location.lines ? (
                  <>
                    {location.venue && (
                      <p className="mt-2 text-sm normal-case leading-snug tracking-normal text-ivory">
                        {location.venue}
                      </p>
                    )}
                    <p className={`${location.venue ? "mt-1" : "mt-2"} text-sm normal-case leading-relaxed tracking-normal text-ivory/70`}>
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
                  <p className="mt-2 text-sm normal-case leading-relaxed tracking-normal text-ivory/70">
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
