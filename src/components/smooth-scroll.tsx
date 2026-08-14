"use client";

import { useEffect } from "react";
import { threeStore } from "./three/store";

/**
 * Advanced smooth scrolling powered by Lenis.
 *
 * - 60fps RAF-driven animation for both mouse wheel and touchpad gestures
 * - Free scrolling — no section snapping; the page scrolls like a normal
 *   document
 * - The `lenis` library is dynamically imported, so its chunk only loads
 *   when this mounts (code-splitting), never blocking initial render
 * - Respects `prefers-reduced-motion`: animation is skipped entirely
 *
 * Renders nothing — it only wires up the scrolling engine.
 */
export default function SmoothScroll() {
  /**
   * Fade the 3D scene out as the final CTA section enters the viewport. The
   * laptop's story ends at the FAQ (its last keyframe), so the closing block
   * should read as clean page content with no device behind it. Runs
   * regardless of reduced-motion — the fade is a visibility toggle, and the
   * CSS transition is disabled for reduced-motion users anyway.
   */
  useEffect(() => {
    const faq = document.getElementById("faq");
    if (!faq) return;
    // The canvas is a client-only dynamic import and mounts after hydration,
    // so wait for it (rAF-poll) before wiring the observer.
    let observer: IntersectionObserver | null = null;
    let raf = 0;
    const setup = () => {
      // Wait for the canvas (a client-only dynamic import) before wiring the
      // observer; the blob layer renders with the mount, so it's present too.
      const canvas = document.querySelector<HTMLElement>(".scene-canvas");
      if (!canvas || observer) {
        raf = requestAnimationFrame(setup);
        return;
      }
      // The scene spans two layers — the WebGL canvas and the ambient blobs —
      // and both fade out together on the final CTA.
      const layers = [...document.querySelectorAll<HTMLElement>(".scene-canvas, .scene-blobs")];
      observer = new IntersectionObserver((entries) => {
        // Fade the laptop out only once the FAQ has fully scrolled past the
        // top of the viewport — it stays visible for the whole FAQ (its final
        // section) and yields to the clean CTA block only after that. Using
        // the FAQ's geometry (not `isIntersecting`) keeps it visible while
        // the FAQ sits below the viewport, e.g. at the top of the page.
        const faded = !entries.some((e) => e.boundingClientRect.bottom > 0);
        for (const el of layers) el.classList.toggle("is-faded", faded);
      });
      observer.observe(faq);
    };
    setup();
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let lenis: import("lenis").default | null = null;
    let rafId = 0;
    let cancelled = false;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;

      lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
      });

      // Hand the instance to the timeline engine so it can read the animated
      // scroll value (the smoothed position, not raw wheel deltas).
      threeStore.lenis = lenis;

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (threeStore.lenis === lenis) threeStore.lenis = null;
      lenis?.destroy();
    };
  }, []);

  return null;
}
