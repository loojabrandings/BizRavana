'use client';

import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, MapPin, Phone } from 'lucide-react';

interface DentalHeroProps {
  onOpenBooking?: () => void;
}

export function DentalHero({ onOpenBooking }: DentalHeroProps) {
  // Global smooth scroll tracking for visible, punchy parallax
  const { scrollY } = useScroll();
  const smoothY = useSpring(scrollY, { stiffness: 90, damping: 20, restDelta: 0.001 });

  // Hero Parallax Transforms (Clearly visible on scroll)
  const textY = useTransform(smoothY, [0, 600], [0, -180]);
  const textOpacity = useTransform(smoothY, [0, 450], [1, 0]);
  const badgeY = useTransform(smoothY, [0, 600], [0, -90]);
  const mobileToothParallaxY = useTransform(smoothY, [0, 600], [0, 160]);
  const mobileToothOpacity = useTransform(smoothY, [0, 500], [1, 0.15]);

  return (
    <section
      id="hero"
      className="relative w-full h-[100dvh] max-h-[100dvh] bg-white flex flex-col justify-end overflow-hidden select-none"
    >
      {/* ── Mobile-Only Visual: Large Screen-Filling Crystal Tooth (< lg) ── */}
      <motion.div
        style={{
          y: mobileToothParallaxY,
          opacity: mobileToothOpacity,
        }}
        className="lg:hidden absolute top-[10%] sm:top-[8%] -right-10 sm:-right-6 w-[360px] sm:w-[460px] aspect-[1024/1536] pointer-events-none z-10 flex items-center justify-center will-change-transform"
      >
        {/* Large Soft Emerald Glow Aura */}
        <div className="absolute w-[280px] sm:w-[380px] aspect-square rounded-full bg-gradient-to-tr from-emerald-200/50 via-teal-100/40 to-transparent blur-3xl opacity-80" />
        
        {/* High-Impact 3D Crystal Tooth Image for Mobile */}
        <div className="relative w-full h-full animate-subtle-float">
          <img
            src="/demos/dental/hero-1.png"
            alt="LUMIDENT 3D Crystal Tooth"
            className="w-full h-full object-contain drop-shadow-[0_25px_50px_rgba(5,201,137,0.24)] scale-110 sm:scale-100"
          />
        </div>
      </motion.div>

      {/* ── Main Hero Content with Prominent Parallax & Stagger Animation ── */}
      <motion.div
        style={{
          y: textY,
          opacity: textOpacity,
        }}
        className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pb-8 sm:pb-12 lg:pb-16 z-20 shrink-0 will-change-transform"
      >
        <div className="flex flex-col items-start gap-3 sm:gap-4 lg:gap-6 max-w-[680px]">
          
          {/* Location Badge with Parallax Offset */}
          <motion.div
            style={{ y: badgeY }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-50/90 backdrop-blur-md border border-emerald-200/80 text-[11px] sm:text-xs font-bold text-[#05c989] tracking-wide shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-[#05c989]" />
            <span>COLOMBO, SRI LANKA</span>
          </motion.div>

          {/* Primary Headline */}
          <h1 className="font-bold tracking-[-0.035em] text-[#111827] text-[34px] leading-[1.04] sm:text-[50px] sm:leading-[1.02] md:text-[68px] md:leading-[0.98] lg:text-[88px] lg:leading-[0.96] xl:text-[98px] xl:leading-[0.94]">
            <motion.span
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="block text-[#111827]"
            >
              Gentle, Modern
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="block mt-0.5"
            >
              <span className="text-[#05c989]">Dental</span>{' '}
              <span className="text-[#111827]">Care</span>
            </motion.span>
          </h1>

          {/* Subtitle Description in Simple English */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="text-slate-600 text-xs sm:text-sm lg:text-[15px] leading-relaxed font-normal max-w-[440px]"
          >
            Welcome to LUMIDENT. Our expert dental team in Colombo uses modern technology to give you gentle, pain-free treatments in a relaxing environment.
          </motion.p>

          {/* Action Row: Primary Booking + Quick Mobile Call */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-row items-center gap-3 w-full sm:w-auto pt-1 sm:pt-0"
          >
            <button
              onClick={onOpenBooking}
              className="flex-1 sm:flex-initial px-6 sm:px-8 py-3 sm:py-3.5 rounded-full border border-slate-200 bg-white/95 backdrop-blur-md hover:border-[#05c989] hover:bg-slate-50 text-[#111827] hover:text-[#05c989] font-bold text-xs sm:text-sm lg:text-[14px] transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Book Your Visit</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="tel:+94112689100"
              className="sm:hidden p-3 rounded-full border border-slate-200 bg-white/95 backdrop-blur-md text-[#05c989] flex items-center justify-center shadow-sm active:scale-95"
              aria-label="Call Colombo Clinic"
            >
              <Phone className="w-4 h-4" />
            </a>
          </motion.div>

        </div>
      </motion.div>

    </section>
  );
}
