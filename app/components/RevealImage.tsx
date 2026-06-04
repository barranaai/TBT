"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

type RevealImageProps = ImageProps & {
  /** Classes applied to the (unclipped) observed wrapper, e.g. positioning. */
  wrapperClassName?: string;
  /** Delay the reveal, in ms — useful for staggering grids. */
  delay?: number;
};

/**
 * Wraps next/image with an editorial "curtain" reveal: the photo wipes in via
 * an animated clip-path and settles from a slight scale as it enters the
 * viewport. Pairs with the .img-reveal styles in globals.css and respects
 * prefers-reduced-motion.
 *
 * The clip-path lives on an INNER element, never on the observed wrapper — a
 * clipped element reports a zero intersection ratio and would never trigger
 * its own reveal.
 */
export default function RevealImage({
  wrapperClassName = "",
  delay = 0,
  className = "",
  ...imageProps
}: RevealImageProps) {
  const ref = useRef<HTMLDivElement | null>(null);
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
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={wrapperClassName}>
      <div
        className={`img-reveal relative h-full w-full ${revealed ? "is-revealed" : ""}`}
        style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      >
        <Image className={className} {...imageProps} />
      </div>
    </div>
  );
}
