'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const GymFinalCTA: React.FC = () => {
  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-[#050505] text-[#FEF9F5] py-28 sm:py-36 lg:py-44 overflow-hidden border-t border-white/10">
      
      {/* ── Massive Ambient Radial Green Glow Behind Text ───── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] sm:w-[1000px] h-[500px] bg-[#CCFF00]/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#CCFF00_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10 text-center flex flex-col items-center">
        
        {/* ── Top Pill Badge ─────────────────────────────────── */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-[#CCFF00]/40 backdrop-blur-md mb-8">
          <Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#CCFF00]">
            TAKE THE FIRST STEP
          </span>
        </div>

        {/* ── Massive Display Statement (No Cards) ───────────── */}
        <h2 className="font-impact italic text-5xl sm:text-7xl md:text-8xl lg:text-9xl uppercase tracking-tight leading-[0.88] text-[#FEF9F5] max-w-5xl mb-8">
          START TODAY.<br />
          <span className="text-[#CCFF00] drop-shadow-[0_0_60px_rgba(204,255,0,0.4)]">
            TRANSFORM FOREVER.
          </span>
        </h2>

        {/* ── Subtitle Description ───────────────────────────── */}
        <p className="text-base sm:text-xl text-[#FEF9F5]/75 font-normal leading-relaxed max-w-2xl mb-12">
          Join our community, train with expert guidance, and give yourself the space, energy and focus to reach your true potential.
        </p>

        {/* ── Action Buttons ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto mb-14">
          <button
            type="button"
            onClick={() => handleScrollTo('membership')}
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-3 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-sm sm:text-base tracking-[0.12em] uppercase px-9 sm:px-11 py-4 sm:py-5 rounded-full transition-all duration-300 shadow-2xl shadow-[#CCFF00]/30 hover:shadow-[#CCFF00]/50 hover:scale-105"
          >
            <span>CLAIM YOUR PASS</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            type="button"
            onClick={() => handleScrollTo('contact')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/15 hover:border-white/30 font-bold text-sm sm:text-base tracking-[0.12em] uppercase px-8 sm:px-10 py-4 sm:py-5 rounded-full transition-all duration-300 backdrop-blur-md"
          >
            <span>BOOK A FREE TOUR</span>
          </button>
        </div>

        {/* ── Trust Metadata Strip ───────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-8 border-t border-white/10 text-xs sm:text-sm text-[#FEF9F5]/60">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />
            <span>No Long-Term Lock-in</span>
          </div>
          <span className="hidden sm:inline text-white/20">·</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />
            <span>Free 1-on-1 Consultation</span>
          </div>
          <span className="hidden sm:inline text-white/20">·</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />
            <span>All Standard Equipment Access</span>
          </div>
        </div>

      </div>
    </section>
  );
};
