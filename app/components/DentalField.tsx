type MotifType = "tooth" | "veneer" | "implant";

type Motif = {
  type: MotifType;
  top: string;
  left: string;
  size: number;
  dur: number;
  delay: number;
  anim: "motifFloatA" | "motifFloatB" | "motifFloatC";
};

// Sparse, edge-biased placements so the motifs read as ambient texture
// rather than crowding the centered content.
const motifs: Motif[] = [
  { type: "tooth", top: "9%", left: "5%", size: 128, dur: 17, delay: 0, anim: "motifFloatA" },
  { type: "implant", top: "20%", left: "84%", size: 96, dur: 20, delay: 1.5, anim: "motifFloatB" },
  { type: "veneer", top: "44%", left: "9%", size: 84, dur: 18, delay: 0.8, anim: "motifFloatC" },
  { type: "tooth", top: "61%", left: "88%", size: 150, dur: 22, delay: 1.2, anim: "motifFloatB" },
  { type: "implant", top: "80%", left: "12%", size: 78, dur: 16, delay: 2.4, anim: "motifFloatA" },
  { type: "veneer", top: "90%", left: "72%", size: 104, dur: 21, delay: 0.5, anim: "motifFloatC" },
  { type: "tooth", top: "33%", left: "46%", size: 64, dur: 19, delay: 3, anim: "motifFloatA" },
  { type: "veneer", top: "14%", left: "62%", size: 72, dur: 18, delay: 2, anim: "motifFloatB" },
  { type: "implant", top: "52%", left: "70%", size: 88, dur: 20, delay: 0, anim: "motifFloatC" },
  { type: "tooth", top: "72%", left: "40%", size: 92, dur: 23, delay: 1.8, anim: "motifFloatB" },
  { type: "veneer", top: "30%", left: "26%", size: 70, dur: 17, delay: 3.5, anim: "motifFloatA" },
];

function MotifShape({ type }: { type: MotifType }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      {type === "tooth" && (
        <path
          d="M9 6c-2.2 0-3.6 2-3.4 4.6.2 2.4 1.3 3.8 1.7 6.4.3 2 .3 4.2.9 6.4.5 1.8 2.3 1.9 2.8 0 .4-1.6.5-3.4 1-4.8.3-.9 1.3-.9 1.6 0 .5 1.4.6 3.2 1 4.8.5 1.9 2.3 1.8 2.8 0 .6-2.2.6-4.4.9-6.4.4-2.6 1.5-4 1.7-6.4C21.6 8 20.2 6 18 6c-1.6 0-2.6 1.1-4.5 1.1S10.6 6 9 6Z"
          {...common}
        />
      )}
      {type === "veneer" && (
        <>
          <path
            d="M11 4c4-1 8 .4 9.5 1.2.6 4-1 9.4-4 13.8-1.2 1.8-2.6 1.8-3.8 0C9.6 14.6 8 9.2 8.6 5.2 9.2 4.8 10 4.3 11 4Z"
            {...common}
          />
          <path d="M12 7.2c2.6-.7 5.2-.1 6.7.6" {...common} />
        </>
      )}
      {type === "implant" && (
        <>
          <path d="M13 4.5c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5V7h-6Z" {...common} />
          <path d="M12 8.5h8l-1.2 13.5a2.8 2.8 0 0 1-5.6 0Z" {...common} />
          <path
            d="M12.5 11.6h7M12.8 14.6h6.4M13.1 17.6h5.8M13.4 20.6h5.2"
            {...common}
          />
        </>
      )}
    </svg>
  );
}

/**
 * Ambient, decorative field of slowly drifting dental line-art motifs
 * (tooth / veneer / implant). Fixed, faint, and non-interactive — a luxury
 * "watermark" texture. Pure SVG + CSS (see .dental-field in globals.css),
 * and disabled under prefers-reduced-motion.
 */
export default function DentalField() {
  return (
    <div className="dental-field" aria-hidden="true">
      {motifs.map((m, i) => (
        <span
          key={i}
          className="dental-motif"
          style={{
            top: m.top,
            left: m.left,
            width: `${m.size}px`,
            height: `${m.size}px`,
            animation: `${m.anim} ${m.dur}s ease-in-out ${m.delay}s infinite`,
          }}
        >
          <MotifShape type={m.type} />
        </span>
      ))}
    </div>
  );
}
