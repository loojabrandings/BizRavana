"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Scroll-reveal wrapper: fades/slides its children in the first time they
 * enter the viewport.
 *
 * - Adds `js-reveal` to <html> only while JS + motion are available, and the
 *   hiding styles are scoped to that class — so no-JS visitors and
 *   `prefers-reduced-motion` users see everything, unhidden.
 * - `delay` staggers groups (e.g. belief cards) via a CSS transition-delay.
 *
 * Renders a plain <div>; sections themselves stay semantic <section>s with
 * this inside.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Extra transition delay (ms) — stagger a group of reveals. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("js-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      // A touch of the section must be on screen before it reveals; the
      // negative bottom margin keeps content below the fold hidden until it
      // actually approaches the viewport.
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties | undefined =
    delay > 0 ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <div
      ref={ref}
      className={`reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={style}
    >
      {children}
    </div>
  );
}
