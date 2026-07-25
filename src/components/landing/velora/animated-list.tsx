"use client";

import { useEffect, useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";

import { cn } from "@/lib/utils";

interface AnimatedListProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedList({
  children,
  delay = 1500,
  className,
}: AnimatedListProps) {
  const reducedMotion = useReducedMotion();
  const items = Array.isArray(children) ? children : [children];
  const [visibleCount, setVisibleCount] = useState(3);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= items.length) return 3;
        return prev + 1;
      });
    }, delay);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [items.length, delay]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <AnimatePresence mode="popLayout">
        {items.slice(0, visibleCount).map((child, i) => (
          <motion.div
            key={i}
            layout={!reducedMotion}
            initial={reducedMotion ? undefined : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
