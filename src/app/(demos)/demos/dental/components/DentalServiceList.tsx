'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface DentalServiceListProps {
  onOpenBooking?: () => void;
}

const DETAILED_SERVICES_COL1 = [
  { name: 'Regular Checkups & Digital X-Rays', category: 'Preventive Care' },
  { name: 'Teeth Cleaning & Stain Removal', category: 'Hygiene & Clean' },
  { name: 'Tooth-Colored Cavity Fillings', category: 'Tooth Repair' },
  { name: 'Gentle & Pain-Free Root Canals', category: 'Root Care' },
  { name: 'Custom Dental Crowns & Bridges', category: 'Tooth Protection' },
];

const DETAILED_SERVICES_COL2 = [
  { name: 'Permanent Dental Implants', category: 'Tooth Replacement' },
  { name: 'Clear Aligners & Braces', category: 'Teeth Straightening' },
  { name: 'Professional Teeth Whitening', category: 'Brighten Smile' },
  { name: 'Porcelain Veneers & Makeovers', category: 'Cosmetic Dentistry' },
  { name: 'Gentle Wisdom Tooth Extractions', category: 'Oral Surgery' },
];

export function DentalServiceList({ onOpenBooking }: DentalServiceListProps) {
  return (
    <section
      id="procedures"
      className="relative w-full py-16 sm:py-24 lg:py-32 flex flex-col justify-center overflow-hidden border-t border-slate-100/60 select-none bg-[#FAFCFE]/60 backdrop-blur-md z-30"
    >
      {/* Background Soft Accent Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 z-20">
        
        {/* ── Section Header ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-10 sm:pb-14 lg:pb-16 border-b border-slate-200/80">
          
          <div className="flex flex-col items-start gap-3 sm:gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60 text-xs font-semibold text-[#05c989] tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TREATMENTS DIRECTORY</span>
            </div>

            <h2 className="font-bold tracking-[-0.035em] text-[#111827] text-[30px] leading-[1.08] sm:text-[42px] sm:leading-[1.02] lg:text-[54px] lg:leading-[1.0]">
              All Clinical<br />
              <span className="text-[#05c989]">Procedures.</span>
            </h2>
          </div>

          <div className="max-w-[360px] text-left sm:text-right flex flex-col items-start sm:items-end gap-2">
            <span className="text-xs sm:text-sm font-semibold text-[#05c989] bg-emerald-50/80 px-3 py-1 rounded-full border border-emerald-200/50 backdrop-blur-sm">
              10 Complete Treatments
            </span>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
              Gentle, high-quality dental care done with modern equipment and personalized attention.
            </p>
          </div>

        </div>

        {/* ── 3-Column Grid: Left (5 items) | Center (Desktop Landing Zone) | Right (5 items) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-12 items-center pt-8 sm:pt-12">
          
          {/* Column 1: Left 5 Services (lg:col-span-5) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-2.5">
            {DETAILED_SERVICES_COL1.map((item) => (
              <div
                key={item.name}
                className="p-4 sm:p-5 rounded-2xl bg-white/55 backdrop-blur-xl border border-white/80 shadow-xs flex items-center justify-start select-none transition-all duration-300 hover:scale-[1.02] hover:bg-white/85 hover:shadow-md hover:border-emerald-300/60 origin-left group text-left"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="font-bold text-[15px] sm:text-[18px] lg:text-[19px] text-[#111827] group-hover:text-[#05c989] transition-colors leading-snug tracking-tight">
                    {item.name}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Column 2: Center Landing Zone (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-2 items-center justify-center lg:min-h-[500px] relative">
            {/* Glowing pedestal backdrop */}
            <div className="relative w-full max-w-[260px] aspect-square rounded-full bg-gradient-to-tr from-emerald-100/50 via-teal-50/40 to-transparent border border-emerald-200/30 blur-sm flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-3/4 rounded-full bg-white/60 backdrop-blur-md shadow-xs border border-white" />
            </div>
          </div>

          {/* Column 3: Right 5 Services (lg:col-span-5) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-2.5">
            {DETAILED_SERVICES_COL2.map((item) => (
              <div
                key={item.name}
                className="p-4 sm:p-5 rounded-2xl bg-white/55 backdrop-blur-xl border border-white/80 shadow-xs flex items-center justify-start lg:justify-end select-none transition-all duration-300 hover:scale-[1.02] hover:bg-white/85 hover:shadow-md hover:border-emerald-300/60 origin-left lg:origin-right group text-left lg:text-right"
              >
                <div className="flex flex-col items-start lg:items-end text-left lg:text-right w-full">
                  <span className="font-bold text-[15px] sm:text-[18px] lg:text-[19px] text-[#111827] group-hover:text-[#05c989] transition-colors leading-snug tracking-tight">
                    {item.name}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
