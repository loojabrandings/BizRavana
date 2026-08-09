"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { OVERVIEW_IMAGE, type FeatureItem } from "./features-data";

const EASE = [0.22, 1, 0.36, 1] as const;

interface FeatureVisualProps {
  feature: FeatureItem | null;
}

export function FeatureVisual({ feature }: FeatureVisualProps) {
  // Track failed loads so the placeholder stays graceful until real images exist.
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const active = feature ?? null;
  const src = active ? active.image : OVERVIEW_IMAGE.image;
  const alt = active ? active.alt : OVERVIEW_IMAGE.alt;
  const Icon = active?.icon ?? LayoutDashboard;
  const title = active?.title ?? "BizRavana Platform";
  const isBroken = failed[src] === true;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={src}
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -28, scale: 0.97 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {isBroken ? (
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[24px] px-8 text-center"
              role="img"
              aria-label={alt}
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-7" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Image placeholder — screenshot coming soon
                </p>
              </div>
            </div>
          ) : (
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 1023px) 100vw, 64vw"
              quality={95}
              priority={!active}
              onError={() =>
                setFailed((prev) => ({ ...prev, [src]: true }))
              }
              className={cn(
                "object-cover object-right-bottom transition-transform duration-700 ease-out",
                active && "scale-[1.04]",
              )}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Soft bottom fade integrates the visual with the section surface */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-muted/50 to-transparent"
      />
    </div>
  );
}
