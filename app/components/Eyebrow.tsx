import type { ReactNode } from "react";

type EyebrowProps = {
  index?: string;
  children: ReactNode;
  className?: string;
};

export default function Eyebrow({
  index,
  children,
  className = "",
}: EyebrowProps) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${className}`}>
      {index && <span className="tabular-nums opacity-80">{index}</span>}
      <span className="h-px w-8 bg-current opacity-50" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
