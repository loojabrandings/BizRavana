'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { DentalHero } from './DentalHero';
import { DentalAbout } from './DentalAbout';
import { DentalServices } from './DentalServices';
import { DentalServiceList } from './DentalServiceList';
import { DentalBeforeAfter } from './DentalBeforeAfter';
import { DentalCTA } from './DentalCTA';
import { DentalContact } from './DentalContact';
import { DentalFooter } from './DentalFooter';

interface DentalMainFlowProps {
  onOpenBooking?: () => void;
}

export function DentalMainFlow({ onOpenBooking }: DentalMainFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const toothContainerRef = useRef<HTMLDivElement>(null);

  // Mouse hover tracking for internal anatomy reveal spotlight
  const targetPos = useRef({ x: 50, y: 50, active: false });
  const currentPos = useRef({ x: 50, y: 50, radius: 0 });
  const animFrameId = useRef<number | null>(null);

  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({
    opacity: 0,
    WebkitMaskImage: 'radial-gradient(circle 0px at 50% 50%, black 0%, transparent 100%)',
    maskImage: 'radial-gradient(circle 0px at 50% 50%, black 0%, transparent 100%)',
  });

  // Global Page Scroll Tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 75,
    damping: 24,
    restDelta: 0.001,
  });

  // ── Exact Custom-Tuned Scroll Keyframes ─────────────────────────
  const progressBreakpoints = [0, 0.145, 0.299, 0.457, 0.616, 0.76, 0.895, 1.0];

  const toothX = useTransform(
    smoothProgress,
    progressBreakpoints,
    ['16.5vw', '-19.5vw', '7vw', '0vw', '0vw', '-29.5vw', '7.5vw', '0vw']
  );

  const toothY = useTransform(
    smoothProgress,
    progressBreakpoints,
    ['80vh', '170vh', '280vh', '386vh', '480vh', '622vh', '710vh', '842vh']
  );

  const toothRotate = useTransform(
    smoothProgress,
    progressBreakpoints,
    [15, -13, 14, 0, 0, 13, -13, 0]
  );

  const toothScale = useTransform(
    smoothProgress,
    progressBreakpoints,
    [1.58, 1.3, 1.42, 1.18, 0.54, 1.14, 1.28, 1.39]
  );

  const toothZIndex = useTransform(
    smoothProgress,
    progressBreakpoints,
    [50, 35, 20, 35, 20, 20, 20, 35]
  );

  // Spotlight Animation Loop
  const updateAnimation = useCallback(() => {
    const ease = 0.18;
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

    const targetRadius = targetPos.current.active ? 180 : 0;
    currentPos.current.radius += (targetRadius - currentPos.current.radius) * 0.14;

    const rad = currentPos.current.radius;
    const x = currentPos.current.x.toFixed(2);
    const y = currentPos.current.y.toFixed(2);

    if (rad > 0.5) {
      const gradient = `radial-gradient(circle ${rad.toFixed(1)}px at ${x}% ${y}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.3) 75%, transparent 100%)`;
      setMaskStyle({
        opacity: Math.min(1, rad / 30),
        WebkitMaskImage: gradient,
        maskImage: gradient,
        transition: 'opacity 0.2s ease',
      });
    } else {
      setMaskStyle({
        opacity: 0,
        WebkitMaskImage: 'none',
        maskImage: 'none',
      });
    }

    animFrameId.current = requestAnimationFrame(updateAnimation);
  }, []);

  useEffect(() => {
    animFrameId.current = requestAnimationFrame(updateAnimation);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [updateAnimation]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!toothContainerRef.current) return;
    const rect = toothContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (
      clientX >= rect.left - 40 &&
      clientX <= rect.right + 40 &&
      clientY >= rect.top - 40 &&
      clientY <= rect.bottom + 40
    ) {
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      targetPos.current = {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
        active: true,
      };
    } else {
      targetPos.current.active = false;
    }
  };

  const handleMouseEnter = () => {
    targetPos.current.active = true;
  };

  const handleMouseLeave = () => {
    targetPos.current.active = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full flex flex-col overflow-hidden select-none"
    >
      {/* ── Single Continuous 3D Crystal Tooth (Desktop Only) ─────── */}
      <motion.div
        style={{ zIndex: toothZIndex }}
        className="hidden lg:block absolute inset-0 pointer-events-none overflow-visible"
      >
        <motion.div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            x: toothX,
            y: toothY,
            rotate: toothRotate,
            scale: toothScale,
            translateX: '-50%',
            translateY: '-50%',
          }}
          className="pointer-events-auto"
        >
          <div
            ref={toothContainerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative flex-shrink-0 w-[460px] xl:w-[520px] aspect-[1024/1536] cursor-crosshair group transition-transform duration-500 ease-out hover:scale-105"
          >
            {/* Base Layer: hero-1.png (Clear Crystal Tooth) */}
            <img
              src="/demos/dental/hero-1.png"
              alt="LUMIDENT 3D Crystal Tooth"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none animate-subtle-float"
            />

            {/* Reveal Layer: hero-2.png (Glowing Inner Anatomy) */}
            <div
              style={maskStyle}
              className="absolute inset-0 w-full h-full pointer-events-none select-none animate-subtle-float z-10"
            >
              <img
                src="/demos/dental/hero-2.png"
                alt="LUMIDENT 3D Illuminated Internal Structure"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Interactive Spotlight Glow around cursor */}
            {targetPos.current.active && (
              <div
                className="absolute pointer-events-none rounded-full blur-xl transition-opacity duration-300 opacity-60 z-20"
                style={{
                  left: `${currentPos.current.x}%`,
                  top: `${currentPos.current.y}%`,
                  width: '200px',
                  height: '200px',
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle, rgba(5, 201, 137, 0.35) 0%, rgba(4, 179, 122, 0.15) 50%, transparent 80%)',
                }}
              />
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* ── SECTION 1: HERO (100vh) ──────────────────────────────── */}
      <DentalHero onOpenBooking={onOpenBooking} />

      {/* ── SECTION 2: ABOUT US ──────────────────────────────────── */}
      <DentalAbout onOpenBooking={onOpenBooking} />

      {/* ── SECTION 3: CORE SERVICES (4 EXPANSION CARDS) ─────────── */}
      <DentalServices onOpenBooking={onOpenBooking} />

      {/* ── SECTION 4: CLINICAL PROCEDURES DIRECTORY (3 COLUMNS) ─── */}
      <DentalServiceList onOpenBooking={onOpenBooking} />

      {/* ── SECTION 5: CLINICAL TRANSFORMATIONS (BEFORE / AFTER) ──── */}
      <DentalBeforeAfter onOpenBooking={onOpenBooking} />

      {/* ── SECTION 6: HIGH-CONVERTING CTA BANNER ─────────────────── */}
      <DentalCTA onOpenBooking={onOpenBooking} />

      {/* ── SECTION 7: CONTACT US & CHECK AVAILABILITY ──────────── */}
      <DentalContact onOpenBooking={onOpenBooking} />

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <DentalFooter onOpenBooking={onOpenBooking} />

    </div>
  );
}
