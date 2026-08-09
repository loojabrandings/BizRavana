"use client";

import { useRef, type Ref } from "react";
import Image from "next/image";
import {
  BarChart3,
  Boxes,
  FileText,
  Home,
  Package,
  ShoppingCart,
} from "lucide-react";

import { AnimatedBeam } from "./animated-beam";
import { cn } from "@/lib/utils";

function Node({
  ref,
  className,
  children,
}: {
  ref?: Ref<HTMLDivElement>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-13 items-center justify-center rounded-full border bg-card shadow-lg [&_svg]:size-5",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Six service nodes beaming into a central hub — the classic
 * integrations diagram, built from <AnimatedBeam />.
 * Icons match the BizRavana dashboard sidebar navigation.
 */
export function IntegrationsBeam({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const left1 = useRef<HTMLDivElement>(null);
  const left2 = useRef<HTMLDivElement>(null);
  const left3 = useRef<HTMLDivElement>(null);
  const right1 = useRef<HTMLDivElement>(null);
  const right2 = useRef<HTMLDivElement>(null);
  const right3 = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-96 w-full items-center justify-between px-2 sm:px-8",
        className
      )}
    >
      <div className="flex h-full flex-col justify-between py-6">
        <Node ref={left1}>
          <Home className="text-muted-foreground" />
        </Node>
        <Node ref={left2}>
          <ShoppingCart className="text-muted-foreground" />
        </Node>
        <Node ref={left3}>
          <Boxes className="text-muted-foreground" />
        </Node>
      </div>

      {/* Center: BizRavana logo */}
      <div
        ref={centerRef}
        className="z-10 flex size-24 items-center justify-center rounded-full border-2 border-primary/30 bg-card/90 p-6 shadow-lg shadow-primary/20"
      >
        <Image
          src="/lightmode-logo.png"
          alt="BizRavana"
          width={96}
          height={96}
          style={{ height: "auto" }}
          className="block h-auto w-full object-contain dark:hidden"
        />
        <Image
          src="/darkmode-logo.png"
          alt="BizRavana"
          width={96}
          height={96}
          style={{ height: "auto" }}
          className="hidden h-auto w-full object-contain dark:block"
        />
      </div>

      <div className="flex h-full flex-col justify-between py-6">
        <Node ref={right1}>
          <Package className="text-muted-foreground" />
        </Node>
        <Node ref={right2}>
          <BarChart3 className="text-muted-foreground" />
        </Node>
        <Node ref={right3}>
          <FileText className="text-muted-foreground" />
        </Node>
      </div>

      {/* Animated beam connections from each node to the center */}
      <AnimatedBeam containerRef={containerRef} fromRef={left1} toRef={centerRef} curvature={-60} />
      <AnimatedBeam containerRef={containerRef} fromRef={left2} toRef={centerRef} delay={1} />
      <AnimatedBeam containerRef={containerRef} fromRef={left3} toRef={centerRef} curvature={60} delay={2} />
      <AnimatedBeam containerRef={containerRef} fromRef={right1} toRef={centerRef} curvature={-60} reverse delay={0.5} />
      <AnimatedBeam containerRef={containerRef} fromRef={right2} toRef={centerRef} reverse delay={1.5} />
      <AnimatedBeam containerRef={containerRef} fromRef={right3} toRef={centerRef} curvature={60} reverse delay={2.5} />
    </div>
  );
}
