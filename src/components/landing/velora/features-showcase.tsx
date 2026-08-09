"use client";

import { MotionConfig } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-media-query";
import { FeatureAccordion } from "./feature-accordion";
import { FeatureVisual } from "./feature-visual";
import { FEATURES, OVERVIEW_IMAGE } from "./features-data";

export function FeaturesShowcase() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const accordionRef = useRef<HTMLDivElement>(null);

  // Preload every image (overview + features) so transitions never flicker.
  useEffect(() => {
    const images = [OVERVIEW_IMAGE.image, ...FEATURES.map((f) => f.image)];
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const toggleFeature = useCallback((index: number) => {
    setActiveIndex((current) => (current === index ? null : index));
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null || current === 0) return FEATURES.length - 1;
      return current - 1;
    });
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null || current === FEATURES.length - 1) return 0;
      return current + 1;
    });
  }, []);

  const hasPrev = activeIndex !== null && activeIndex > 0;
  const hasNext = activeIndex !== null && activeIndex < FEATURES.length - 1;

  // On mobile, scroll the expanded panel into view when a feature opens.
  useEffect(() => {
    if (!isMobile || activeIndex === null) return;
    const timer = window.setTimeout(() => {
      const panel = document.getElementById(
        `feature-panel-${FEATURES[activeIndex].id}`,
      );
      panel?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [isMobile, activeIndex]);

  const activeFeature = activeIndex !== null ? FEATURES[activeIndex] : null;

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative overflow-hidden rounded-[32px] border border-border/50 p-6 shadow-[0_24px_80px_-24px_var(--shadow-color)] sm:p-8 lg:min-h-[700px] lg:p-12 dark:text-gray-900 dark:[--foreground:oklch(0.145_0_0)] dark:[--muted-foreground:oklch(0.556_0_0)] dark:[--primary:oklch(0.546_0.245_262.881)] dark:[--primary-foreground:oklch(0.985_0_0)] dark:[--border:oklch(0.88_0_0)] dark:[--background:oklch(1_0_0)] dark:[--card:oklch(1_0_0)] dark:[--muted:oklch(0.965_0.001_286.375)]"
        role="region"
        aria-label="BizRavana features showcase"
      >
        {/* Ambient highlight for depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-10%] size-96 rounded-full bg-primary/8 blur-3xl"
        />

        <div className="relative flex flex-col gap-8 lg:grid lg:min-h-[604px] lg:grid-cols-[36fr_64fr] lg:gap-12">
          {/* Accordion column */}
          <div
            ref={accordionRef}
            className="order-2 w-full lg:order-1 lg:min-w-0"
          >
            <FeatureAccordion
              features={FEATURES}
              activeIndex={activeIndex}
              onSelect={toggleFeature}
              onPrev={goPrev}
              onNext={goNext}
              hasPrev={hasPrev}
              hasNext={hasNext}
            />
          </div>

          {/* Dynamic visual column */}            <div className="order-1 h-[320px] w-full overflow-hidden sm:h-[420px] lg:order-2 lg:h-auto lg:min-h-[604px]">
            <FeatureVisual feature={activeFeature} />
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
