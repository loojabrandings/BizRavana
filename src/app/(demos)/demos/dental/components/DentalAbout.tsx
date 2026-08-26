'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Cpu } from 'lucide-react';

interface DentalAboutProps {
  onOpenBooking?: () => void;
}

const PILLARS = [
  {
    icon: Cpu,
    title: 'Modern 3D Digital Scans',
  },
  {
    icon: Sparkles,
    title: 'Gentle & Pain-Free Treatments',
  },
  {
    icon: ShieldCheck,
    title: 'Highest Quality Materials & Care',
  },
];

const METRICS = [
  { value: '15+', label: 'Years in Colombo' },
  { value: '99.4%', label: 'Happy Patients' },
  { value: '25k+', label: 'Smiles Brightened' },
];

export function DentalAbout({ onOpenBooking }: DentalAboutProps) {
  return (
    <section
      id="about"
      className="relative w-full min-h-screen bg-[#FAFCFE] py-16 sm:py-24 lg:py-32 flex flex-col justify-center overflow-hidden border-t border-slate-100 select-none"
    >
      {/* Background Soft Accent Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-emerald-50/60 rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-10 right-20 w-[400px] h-[400px] bg-blue-50/40 rounded-full blur-2xl opacity-60" />
      </div>

      <div className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 z-20">
        {/* Main Grid: Left (Desktop Reserved Space for Traveling 3D Tooth) | Right (Text & Narrative) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-16">
          
          {/* Left Column: Reserved Space for Traveling Tooth (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-6 items-center justify-center lg:min-h-[560px] relative">
            {/* Visual Backdrop Aura */}
            <div className="relative w-full max-w-[440px] aspect-square rounded-full bg-gradient-to-tr from-emerald-100/40 via-blue-50/30 to-transparent border border-emerald-200/40 blur-xs flex items-center justify-center pointer-events-none">
              <div className="w-[80%] h-[80%] rounded-full bg-white/70 backdrop-blur-md shadow-xs border border-white" />
            </div>
          </div>

          {/* Right Column: Narrative, Pillars & CTAs (Full Width on Mobile, 6 Cols on Desktop) */}
          <div className="col-span-1 lg:col-span-6 flex flex-col items-start gap-6 sm:gap-8">
            
            {/* Section Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-semibold text-[#05c989] tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#05c989]" />
              <span>ABOUT LUMIDENT SRI LANKA</span>
            </div>

            {/* Headline */}
            <h2 className="font-bold tracking-[-0.03em] text-[#111827] text-[30px] leading-[1.12] sm:text-[42px] sm:leading-[1.08] lg:text-[54px] lg:leading-[1.05]">
              World-Class Dentistry,<br />
              <span className="text-[#05c989]">Right Here in Colombo.</span>
            </h2>

            {/* Narrative Body in Simple English */}
            <p className="text-slate-600 text-xs sm:text-base lg:text-[16px] leading-relaxed font-normal">
              At LUMIDENT, we make dental visits comfortable and stress-free. Whether you need a regular checkup, gentle teeth cleaning, or a complete smile makeover, our caring Sri Lankan dental specialists use the latest equipment to give you the best results.
            </p>

            {/* Stacked Pillars: Frosted Glass Hover Rows */}
            <div className="flex flex-col gap-3 sm:gap-3.5 w-full pt-1">
              {PILLARS.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="flex items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/80 shadow-xs hover:bg-white/80 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-[#05c989] flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-[#05c989] group-hover:text-white transition-colors duration-300">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-bold text-sm sm:text-base lg:text-[17px] text-[#111827] tracking-tight leading-snug">
                      {pillar.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Key Metrics Counter Strip (Frosted Glass Container) */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 lg:gap-10 p-5 sm:p-7 lg:p-8 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-lg w-full">
              {METRICS.map((metric) => (
                <div key={metric.label} className="flex flex-col">
                  <span className="font-extrabold text-xl sm:text-3xl lg:text-4xl text-[#111827] tracking-tight">
                    {metric.value}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-snug">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
