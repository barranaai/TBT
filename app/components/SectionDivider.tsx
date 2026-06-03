import Reveal from "./Reveal";

type SectionDividerProps = {
  variant?: "light" | "dark";
  className?: string;
};

export default function SectionDivider({
  variant = "light",
  className = "",
}: SectionDividerProps) {
  const line =
    variant === "dark"
      ? "from-transparent via-champagne/40 to-transparent"
      : "from-transparent via-gold/40 to-transparent";
  const mark = variant === "dark" ? "text-champagne/70" : "text-gold/70";

  return (
    <Reveal
      className={`mx-auto flex max-w-7xl items-center justify-center gap-5 px-6 lg:px-10 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-px w-24 bg-gradient-to-r sm:w-40 ${line}`}
      />
      <span aria-hidden="true" className={`text-[0.7rem] ${mark}`}>
        ✦
      </span>
      <span
        aria-hidden="true"
        className={`h-px w-24 bg-gradient-to-l sm:w-40 ${line}`}
      />
    </Reveal>
  );
}
