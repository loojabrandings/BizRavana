'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export const GymHero: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-[#050505] text-[#FEF9F5] flex items-center overflow-hidden">
      
      {/* ── Full-Width Hero Background Image ────────────────── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/demos/gym/hero.jpg"
          alt="PulseFit Gym Training"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center md:object-[75%_center] lg:object-right"
        />

        {/* ── Mobile Subtle Dark Tint for Text Legibility ───── */}
        <div className="absolute inset-0 bg-[#050505]/50 md:bg-transparent" />

        {/* ── Top & Bottom Soft Fade Gradients ──────────────── */}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#050505] via-[#050505]/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
      </div>

      {/* ── Foreground Hero Content ─────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full relative z-10 pt-28 pb-16 sm:pt-36 sm:pb-24 flex items-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl lg:max-w-2xl space-y-6 sm:space-y-8"
        >
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/60 border border-[#CCFF00]/40 backdrop-blur-md w-fit">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#CCFF00]">
              #1 FITNESS & TRAINING CLUB
            </span>
          </div>

          {/* Massive Impact Display Heading (4 Rows, 35% Larger, +3% Line Height) */}
          <h1 className="font-impact italic text-7xl sm:text-8xl md:text-9xl lg:text-[6.5rem] xl:text-[7.75rem] tracking-tight uppercase leading-[0.87] text-[#FEF9F5]">
            TRAIN<br />
            HARD.<br />
            <span className="text-[#CCFF00] drop-shadow-[0_0_45px_rgba(204,255,0,0.4)]">
              STAY<br />
              STRONG.
            </span>
          </h1>

          {/* Subtitle / Primary Text */}
          <p className="text-base sm:text-lg text-[#FEF9F5]/80 max-w-lg leading-relaxed font-normal">
            Your all-in-one fitness companion. Workout, track, and transform your body and mind with world-class trainers and elite equipment.
          </p>

          {/* Single High-Impact CTA Button */}
          <div className="pt-1 sm:pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('membership');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group inline-flex items-center justify-center gap-2.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs sm:text-sm tracking-[0.12em] uppercase px-6 sm:px-7 py-3 sm:py-3.5 rounded-full transition-all duration-300 shadow-lg shadow-[#CCFF00]/20 hover:shadow-[#CCFF00]/40 hover:scale-105"
            >
              <span>JOIN US NOW</span>
              <span className="w-5 h-5 rounded-full bg-black/15 flex items-center justify-center text-black text-xs transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </button>
          </div>
        </motion.div>
      </div>

    </section>
  );
};
