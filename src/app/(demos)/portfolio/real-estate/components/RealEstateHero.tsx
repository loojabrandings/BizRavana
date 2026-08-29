'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function RealEstateHero() {
  // Motion value for curtain opening progress (0 = fully closed, 1 = fully open)
  const rawProgress = useMotionValue(0);
  
  // Smooth spring physics for organic, ultra-luxurious motion
  const smoothProgress = useSpring(rawProgress, {
    stiffness: 110,
    damping: 22,
    mass: 0.75,
  });

  // ── 1. Base Curtain & Background Transforms ────────────────
  // Curtain slides out to the right (0% -> 100%)
  const curtainX = useTransform(smoothProgress, [0, 1], ['0%', '100%']);
  
  // Background subtle architectural zoom scale (1 -> 1.06)
  const bgScale = useTransform(smoothProgress, [0, 1], [1, 1.06]);

  // ── 2. Multi-Plane Parallax, Scaling & Fade Transforms (Curtain Content) ──
  // Title Layer: Smooth rightward drift, subtle scale-down, elegant fade
  const titleX = useTransform(smoothProgress, [0, 1], [0, 140]);
  const titleScale = useTransform(smoothProgress, [0, 0.95], [1, 0.92]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.7, 0.95], [1, 0.75, 0]);

  // Description Layer: Faster drift rate, noticeable scale compression & early fade
  const descX = useTransform(smoothProgress, [0, 1], [0, 220]);
  const descScale = useTransform(smoothProgress, [0, 0.88], [1, 0.88]);
  const descOpacity = useTransform(smoothProgress, [0, 0.55, 0.85], [1, 0.5, 0]);

  // CTA Buttons Layer: Highest velocity drift, compacting scale & quickest fade out
  const buttonsX = useTransform(smoothProgress, [0, 1], [0, 300]);
  const buttonsScale = useTransform(smoothProgress, [0, 0.8], [1, 0.85]);
  const buttonsOpacity = useTransform(smoothProgress, [0, 0.45, 0.78], [1, 0.35, 0]);

  // ── 3. Revealed Left-Side Content Transforms (Phase 2 Reveal) ──────────────
  // Glides smoothly from left (-70px -> 0px) and fades in as curtain opens (0.45 -> 1.0)
  const revealedX = useTransform(smoothProgress, [0.45, 1], [-70, 0]);
  const revealedScale = useTransform(smoothProgress, [0.45, 1], [0.94, 1]);
  const revealedOpacity = useTransform(smoothProgress, [0.45, 0.85, 1], [0, 0.85, 1]);

  // Gradient overlay on background image: 0% opacity when curtain is closed/in initial 2/3 (0 to 0.66), fades in only for the final 1/3 (0.66 to 1.0)
  const bgOverlayOpacity = useTransform(smoothProgress, [0, 0.66, 1], [0, 0, 1]);

  // Touch tracking for mobile swipe
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const current = rawProgress.get();

      // If user is at top and scrolls down while curtain is not yet fully open
      if (window.scrollY <= 10 && e.deltaY > 0 && current < 1) {
        e.preventDefault();
        const next = Math.min(1, current + e.deltaY * 0.0018);
        rawProgress.set(next);
      } 
      // If user scrolls up and is at top of page, curtain closes back
      else if (e.deltaY < 0 && window.scrollY <= 10 && current > 0) {
        e.preventDefault();
        const next = Math.max(0, current + e.deltaY * 0.0018);
        rawProgress.set(next);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY.current - currentY;
      const current = rawProgress.get();

      if (deltaY > 0 && current < 1) {
        if (e.cancelable) e.preventDefault();
        const next = Math.min(1, current + deltaY * 0.005);
        rawProgress.set(next);
        touchStartY.current = currentY;
      } else if (deltaY < 0 && window.scrollY <= 10 && current > 0) {
        if (e.cancelable) e.preventDefault();
        const next = Math.max(0, current + deltaY * 0.005);
        rawProgress.set(next);
        touchStartY.current = currentY;
      }
    };

    const handleTouchEnd = () => {
      touchStartY.current = null;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [rawProgress]);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#FAF9F6] select-none">
      {/* ── Layer 1: Background Image ────────────────── */}
      <motion.div 
        style={{ scale: bgScale }}
        className="absolute inset-0 z-0 origin-center will-change-transform"
      >
        <Image
          src="/demos/realestate/hero-bg2.jpeg"
          alt="Luxury Real Estate Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Soft subtle gradient overlay: 0% opacity until 2/3 opened, then fades in */}
        <motion.div 
          style={{ opacity: bgOverlayOpacity }}
          className="absolute inset-0 bg-gradient-to-r from-[#FAF9F6]/85 via-[#FAF9F6]/40 to-transparent pointer-events-none" 
        />
      </motion.div>

      {/* ── Layer 1.5: Revealed About Us & 3 Services (Phase 2) ────────── */}
      <motion.div
        style={{ x: revealedX, scale: revealedScale, opacity: revealedOpacity }}
        className="absolute inset-0 z-5 flex flex-col justify-center items-start origin-left pointer-events-none"
      >
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex flex-col justify-center items-start text-left select-none">
          
          {/* Eyebrow Luxury Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141416]/5 border border-[#141416]/10 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#141416]">
              About Our Atelier
            </span>
          </div>

          {/* About Large Editorial Title */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#141416] leading-[1.02] tracking-tight max-w-2xl">
            <span className="re-font-sans font-light uppercase text-xl sm:text-3xl md:text-4xl tracking-widest text-[#141416]/75 block mb-1">
              Curating
            </span>
            <span className="re-font-serif font-normal text-4xl sm:text-6xl md:text-7xl lg:text-[4.8rem] tracking-tight block text-[#141416]">
              Exceptional Living
            </span>
          </h2>

          {/* About Secondary Description */}
          <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base md:text-lg text-[#2C2E33]/90 font-normal leading-relaxed">
            We bridge visionary architectural mastery with bespoke real estate advisory, representing the world&apos;s most discerning clientele.
          </p>

          {/* ── 3 Core Signature Services ─────────────────────── */}
          <div className="mt-7 pt-6 border-t border-[#141416]/15 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl">
            {/* Service 01 */}
            <div className="flex flex-col">
              <span className="text-xs font-mono font-semibold tracking-wider text-[#A8895E] mb-1">
                01 / ACQUISITIONS
              </span>
              <h3 className="re-font-serif text-lg sm:text-xl font-medium text-[#141416] mb-1">
                Private Advisory
              </h3>
              <p className="text-xs sm:text-sm text-[#6E7178] leading-relaxed">
                Confidential access to off-market estates and prime global residences.
              </p>
            </div>

            {/* Service 02 */}
            <div className="flex flex-col">
              <span className="text-xs font-mono font-semibold tracking-wider text-[#A8895E] mb-1">
                02 / ARCHITECTURE
              </span>
              <h3 className="re-font-serif text-lg sm:text-xl font-medium text-[#141416] mb-1">
                Custom Development
              </h3>
              <p className="text-xs sm:text-sm text-[#6E7178] leading-relaxed">
                Bespoke architectural consultation, spatial planning, and interior mastery.
              </p>
            </div>

            {/* Service 03 */}
            <div className="flex flex-col">
              <span className="text-xs font-mono font-semibold tracking-wider text-[#A8895E] mb-1">
                03 / MANAGEMENT
              </span>
              <h3 className="re-font-serif text-lg sm:text-xl font-medium text-[#141416] mb-1">
                Estate Concierge
              </h3>
              <p className="text-xs sm:text-sm text-[#6E7178] leading-relaxed">
                Full-spectrum portfolio management, VIP lifestyle, and global advisory.
              </p>
            </div>
          </div>

        </div>
      </motion.div>

      {/* ── Layer 2: Curtain Overlay Only (Decoupled) ──────────────── */}
      <motion.div
        style={{ x: curtainX }}
        className="absolute inset-0 z-10 will-change-transform opacity-95 pointer-events-none"
      >
        <Image
          src="/demos/realestate/hero-curtain.webp"
          alt="Hero Curtain Layer"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* ── Layer 3: Completely Independent Floating UI (True 3D Parallax) ── */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center items-end pointer-events-none">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex flex-col justify-center items-end text-right select-none">
          
          {/* 1. Floating Title (Decoupled Parallax + Scale + Fade) */}
          <motion.div
            style={{ x: titleX, scale: titleScale, opacity: titleOpacity }}
            className="origin-right will-change-transform"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[#141416] leading-[0.94] tracking-tight drop-shadow-[0_10px_30px_rgba(255,255,255,0.4)]"
            >
              <span className="re-font-sans font-light uppercase text-3xl sm:text-5xl md:text-6xl tracking-widest text-[#141416]/75 block mb-1">
                Discover
              </span>
              <span className="re-font-serif font-normal text-6xl sm:text-8xl md:text-9xl lg:text-[9.5rem] tracking-tight block my-0.5 text-[#141416]">
                The Perfect
              </span>
              <span className="re-font-sans font-semibold text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tighter text-[#141416] block">
                HOME
              </span>
            </motion.h1>
          </motion.div>

          {/* 2. Floating Secondary Description */}
          <motion.div
            style={{ x: descX, scale: descScale, opacity: descOpacity }}
            className="origin-right will-change-transform"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 sm:mt-8 max-w-xl text-base sm:text-lg md:text-xl text-[#222428] font-normal leading-relaxed tracking-wide"
            >
              Curated architectural sanctuaries, bespoke penthouses, and premier estates designed for refined living and generational legacy.
            </motion.p>
          </motion.div>

          {/* 3. Floating CTA Action Button Group */}
          <motion.div
            style={{ x: buttonsX, scale: buttonsScale, opacity: buttonsOpacity }}
            className="origin-right will-change-transform pointer-events-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 sm:mt-10 flex items-center gap-4 flex-wrap justify-end"
            >
              <a
                href="#featured-properties"
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#141416] text-[#FAF9F6] text-sm sm:text-base font-medium tracking-wide shadow-[0_15px_30px_rgba(20,20,22,0.25)] hover:bg-[#2A2B30] hover:shadow-[0_20px_40px_rgba(20,20,22,0.35)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore Collection</span>
                <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </span>
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white/90 backdrop-blur-md border border-[#141416]/15 text-[#141416] text-sm sm:text-base font-medium tracking-wide hover:bg-white hover:border-[#141416]/40 transition-all duration-300 shadow-lg"
              >
                <span>Book Private Tour</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}



