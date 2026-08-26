'use client';

import React from 'react';
import { Sparkles, ArrowRight, Phone } from 'lucide-react';

interface DentalCTAProps {
  onOpenBooking?: () => void;
}

export function DentalCTA({ onOpenBooking }: DentalCTAProps) {
  return (
    <section id="cta" className="relative w-full py-20 sm:py-28 bg-[#111827] overflow-visible select-none">
      
      {/* Ambient background lighting glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl opacity-70" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative">
        
        {/* ── Frosted Glassmorphism Card (z-40 to sit above traveling tooth) ── */}
        <div className="relative z-40 w-full rounded-3xl sm:rounded-[36px] bg-white/[0.04] backdrop-blur-2xl text-white overflow-hidden border border-white/10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)] p-8 sm:p-14 lg:p-16 flex flex-col items-center text-center">
          
          {/* Top Edge Refraction Highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

          {/* Inner ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-[220px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/30 text-xs font-semibold text-[#05c989] tracking-wider uppercase mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RESERVATIONS</span>
          </div>

          {/* Short Impactful Headline */}
          <h2 className="font-bold tracking-[-0.035em] text-white text-[32px] leading-[1.08] sm:text-[46px] sm:leading-[1.04] lg:text-[54px] lg:leading-[1.02] max-w-[720px]">
            Transform Your Smile.<br />
            <span className="text-[#05c989]">Book Your 3D Scan Today.</span>
          </h2>

          {/* Minimal 1-Line Subtitle */}
          <p className="text-slate-300/80 text-xs sm:text-sm lg:text-base mt-4 max-w-[460px] font-normal leading-relaxed">
            Gentle care • Modern technology • Same-week appointments in Colombo.
          </p>

          {/* Clean Action Row */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onOpenBooking}
              className="w-full sm:w-auto px-8 sm:px-9 py-3.5 rounded-full bg-[#05c989] hover:bg-[#04b37a] text-white font-semibold text-xs sm:text-sm transition-all shadow-lg hover:shadow-emerald-500/30 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="tel:+94112689100"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/15 hover:border-white/30 bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <Phone className="w-3.5 h-3.5 text-[#05c989]" />
              <span>+94 11 268 9100</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
