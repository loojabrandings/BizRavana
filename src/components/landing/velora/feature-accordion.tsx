"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { FeatureAccordionItem } from "./feature-accordion-item";
import type { FeatureItem } from "./features-data";

interface FeatureAccordionProps {
  features: FeatureItem[];
  activeIndex: number | null;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function FeatureAccordion({
  features,
  activeIndex,
  onSelect,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: FeatureAccordionProps) {
  return (
    <div className="flex h-full w-full gap-3">
      {/* Vertical Prev / Next navigation — hidden on mobile */}
      <div className="hidden shrink-0 flex-col items-center justify-center gap-3 md:flex">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Show previous feature"
          className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-all duration-200 hover:border-border hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronUp className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Show next feature"
          className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-all duration-200 hover:border-border hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronDown className="size-4" aria-hidden />
        </button>
      </div>

      <ul className="flex flex-1 flex-col justify-center gap-2.5">
        {features.map((feature, index) => (
          <FeatureAccordionItem
            key={feature.id}
            feature={feature}
            index={index}
            isExpanded={activeIndex === index}
            onToggle={onSelect}
          />
        ))}
      </ul>
    </div>
  );
}
