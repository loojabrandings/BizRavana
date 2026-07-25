"use client";

import {
  createContext,
  useContext,
  useRef,
  createElement,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type SpringOptions,
} from "framer-motion";

import { cn } from "@/lib/utils";

interface DockContextType {
  mouseX: ReturnType<typeof useMotionValue<number>>;
  baseSize: number;
  magnification: number;
  distance: number;
}

const DockContext = createContext<DockContextType | null>(null);

interface DockProps {
  children: ReactNode;
  className?: string;
  baseSize?: number;
  magnification?: number;
  distance?: number;
  spring?: SpringOptions;
}

export function Dock({
  children,
  className,
  baseSize = 40,
  magnification = 64,
  distance = 140,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const reducedMotion = useReducedMotion();

  return (
    <DockContext.Provider
      value={{ mouseX, baseSize, magnification, distance }}
    >
      <motion.div
        onMouseMove={(e) => {
          if (!reducedMotion) mouseX.set(e.clientX);
        }}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(
          "mx-auto flex h-16 items-end gap-3 rounded-2xl border bg-card/70 px-4 pb-3 backdrop-blur-xl",
          className
        )}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
}

interface DockIconProps {
  children: ReactNode;
  label?: string;
  className?: string;
}

export function DockIcon({ children, label, className }: DockIconProps) {
  const context = useContext(DockContext);
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  if (!context) {
    return (
      <div className={cn("flex aspect-square items-center justify-center rounded-xl hover:bg-muted", className)}>
        {children}
        {label && <span className="sr-only">{label}</span>}
      </div>
    );
  }

  const { mouseX, baseSize, magnification, distance } = context;

  const sizeTarget = useTransform(
    mouseX,
    (val: number) => {
      if (reducedMotion || !ref.current) return baseSize;
      const rect = ref.current.getBoundingClientRect();
      const midpoint = rect.x + rect.width / 2;
      const dist = Math.abs(val - midpoint);
      if (dist > distance) return baseSize;
      return baseSize + (magnification - baseSize) * (1 - dist / distance);
    }
  );

  const size = useSpring(sizeTarget, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <motion.div
      ref={ref}
      className={cn(
        "flex aspect-square items-center justify-center rounded-xl transition-colors hover:bg-muted",
        className
      )}
      style={{ width: size, height: size }}
    >
      {children}
      {label && <span className="sr-only">{label}</span>}
    </motion.div>
  );
}
