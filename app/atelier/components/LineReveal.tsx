"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type LineRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
};

export default function LineReveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "span",
}: LineRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Component = Tag as React.ElementType;
  return (
    <Component
      ref={ref}
      className={`line-reveal ${revealed ? "is-revealed" : ""} ${className}`}
    >
      <span style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
        {children}
      </span>
    </Component>
  );
}
