type SmilePlaceholderProps = {
  label?: string;
  tone?: "warm" | "deep" | "soft";
  className?: string;
};

const tones: Record<string, string> = {
  warm: "from-sand via-cream to-taupe/40",
  deep: "from-espresso via-stone to-taupe/60",
  soft: "from-cream via-ivory to-sand",
};

/**
 * Editorial placeholder standing in for commissioned photography.
 * Swap these for real portraits / before-after imagery before launch.
 */
export default function SmilePlaceholder({
  label = "Portrait",
  tone = "warm",
  className = "",
}: SmilePlaceholderProps) {
  const isDeep = tone === "deep";
  return (
    <div
      role="img"
      aria-label={`Placeholder image — ${label}`}
      className={`relative overflow-hidden bg-gradient-to-br ${tones[tone]} ${className}`}
    >
      <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_30%_20%,#000_1px,transparent_1px)] [background-size:14px_14px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`eyebrow ${isDeep ? "text-cream/70" : "text-stone/70"}`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
