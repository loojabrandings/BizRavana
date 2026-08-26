'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cpu, Sparkles, HeartPulse, ArrowUpRight } from 'lucide-react';

interface DentalServicesProps {
  onOpenBooking?: () => void;
}

interface ServiceItem {
  id: string;
  number: string;
  icon: React.ElementType;
  title: string;
  category: string;
  description: string;
  image: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: 'preventive-care',
    number: '01.',
    icon: ShieldCheck,
    title: 'Preventive Care',
    category: 'Routine Care & Cleaning',
    description: 'Keep your teeth healthy and bright with gentle checkups, professional deep cleaning, polishing, and protective cavity treatments.',
    image: '/demos/dental/service-1.jpg',
  },
  {
    id: 'restorative-dentistry',
    number: '02.',
    icon: Cpu,
    title: 'Restorative Dentistry',
    category: 'Repair & Protection',
    description: 'Repair broken or decayed teeth with natural tooth-colored fillings, pain-free root canals, and durable custom crowns.',
    image: '/demos/dental/service-2.jpg',
  },
  {
    id: 'orthodontics',
    number: '03.',
    icon: Sparkles,
    title: 'Orthodontics & Aligners',
    category: 'Teeth Straightening',
    description: 'Straighten crooked teeth, close gaps, and fix bite alignment comfortably with invisible aligners or modern braces.',
    image: '/demos/dental/service-3.jpg',
  },
  {
    id: 'cosmetic-surgery',
    number: '04.',
    icon: HeartPulse,
    title: 'Cosmetic & Oral Surgery',
    category: 'Smile Makeovers & Implants',
    description: 'Transform your smile with instant teeth whitening and veneers, replace missing teeth with permanent implants, and safe extractions.',
    image: '/demos/dental/service-4.jpg',
  },
];

export function DentalServices({ onOpenBooking }: DentalServicesProps) {
  // Active expanded card index
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const handleCardClick = (idx: number) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setHoveredIdx((prev) => (prev === idx ? null : idx));
    }
  };

  const handleMouseEnter = (idx: number) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setHoveredIdx(idx);
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setHoveredIdx(null);
    }
  };

  return (
    <section id="services" className="relative w-full py-16 sm:py-24 lg:py-28 flex flex-col justify-center overflow-hidden border-t border-slate-100/60 select-none bg-white/40 backdrop-blur-md z-40">
      
      <div className="relative w-full max-w-[1440px] mx-auto z-10 flex flex-col gap-10 sm:gap-12 lg:gap-16">
        
        {/* ── Section Header ───────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 pb-10 sm:pb-12 lg:pb-16 border-b border-slate-200/80 px-6 sm:px-10 lg:px-16">
          
          {/* Left: Eyebrow + Headline */}
          <div className="flex flex-col items-start gap-3 sm:gap-4 max-w-[580px]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60 text-xs font-semibold text-[#05c989] tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SERVICES</span>
            </div>

            <h2 className="font-bold tracking-[-0.035em] text-[#111827] text-[30px] leading-[1.08] sm:text-[42px] sm:leading-[1.02] lg:text-[54px] lg:leading-[1.0]">
              Expert Dental Care,<br />
              <span className="text-[#05c989]">Simple &amp; Gentle.</span>
            </h2>
          </div>

          {/* Right: Narrative + Explore Button */}
          <div className="max-w-[420px] flex flex-col items-start lg:items-end text-left lg:text-right gap-3.5 sm:gap-4">
            <p className="text-slate-500 text-xs sm:text-sm lg:text-[13.5px] leading-relaxed font-normal">
              From routine cleanings to complete smile transformations, our experienced team provides gentle, modern dental treatments for the whole family.
            </p>

            <button
              onClick={onOpenBooking}
              className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#111827] hover:bg-[#1f2937] text-white text-xs sm:text-sm font-medium tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer group"
            >
              <span>Explore More</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

        </div>

        {/* ── Interactive Cards Section (Click-to-Expand on Mobile, Hover on Desktop) ── */}
        <div 
          onMouseLeave={handleMouseLeave}
          className="w-full px-5 sm:px-8 lg:px-12"
        >
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 lg:gap-6 items-stretch w-full lg:h-[460px]">
            {SERVICES.map((service, idx) => {
              const isExpanded = hoveredIdx === idx;
              const IconComp = service.icon;

              return (
                <motion.div
                  key={service.id}
                  layout
                  onClick={() => handleCardClick(idx)}
                  onMouseEnter={() => handleMouseEnter(idx)}
                  transition={{
                    layout: { type: 'spring', stiffness: 260, damping: 28 },
                    opacity: { duration: 0.2 },
                  }}
                  className={`cursor-pointer rounded-3xl relative overflow-hidden transition-all duration-300 ${
                    isExpanded
                      ? 'h-[350px] sm:h-[380px] lg:h-full lg:flex-[2.6] bg-white/90 backdrop-blur-2xl border border-white shadow-2xl shadow-slate-200/80 ring-1 ring-[#05c989]/30'
                      : 'h-[200px] sm:h-[230px] lg:h-full lg:flex-1 bg-white/55 backdrop-blur-xl hover:bg-white/75 border border-white/80 shadow-lg hover:shadow-xl'
                  } flex flex-col justify-between`}
                >
                  <AnimatePresence mode="wait">
                    {isExpanded ? (
                      /* ── EXPANDED STATE: FULL CARD BACKGROUND IMAGE WITH FROSTED GLASS OVERLAY ── */
                      <motion.div
                        key="expanded-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="relative flex flex-col justify-between h-full w-full overflow-hidden p-5 sm:p-6"
                      >
                        {/* Full Card Background Image (Aligned Bottom Center) */}
                        <img
                          src={service.image}
                          alt={service.title}
                          className="absolute inset-0 w-full h-full object-cover object-bottom scale-105 transition-transform duration-700 select-none"
                        />

                        {/* Top Gradient Vignette */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/60 pointer-events-none" />

                        {/* Top Header Row */}
                        <div className="relative flex items-center justify-between z-10">
                          {/* Top Left Category Pill */}
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 shadow-md text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#05c989] shadow-[0_0_6px_#05c989]" />
                            <span>{service.category}</span>
                          </div>

                          {/* Top Right Icon Badge */}
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/85 backdrop-blur-md border border-white/90 text-[#05c989] flex items-center justify-center shadow-md">
                            <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        </div>

                        {/* Bottom Text Area with Frosted Glass Fade */}
                        <div className="absolute inset-x-0 bottom-0 pt-6 sm:pt-8 pb-4 sm:pb-5 px-5 sm:px-6 bg-gradient-to-t from-white/95 via-white/85 via-40% to-transparent backdrop-blur-[8px] flex flex-col gap-1.5 z-10">
                          <h3 className="font-bold text-lg sm:text-xl text-[#111827] leading-tight tracking-tight">
                            {service.title}
                          </h3>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-slate-300/60">
                            <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed font-normal max-w-[85%] sm:max-w-[75%]">
                              {service.description}
                            </p>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenBooking) onOpenBooking();
                              }}
                              className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#05c989] hover:bg-[#04b37a] text-white text-xs font-bold transition-all shadow-md hover:shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-1.5 group/btn shrink-0 cursor-pointer"
                            >
                              <span>Reserve</span>
                              <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            </button>
                          </div>
                        </div>

                      </motion.div>
                    ) : (
                      /* ── CONTRACTED STATE (FULL CARD IMAGE + FROSTED GLASS OVERLAY) ── */
                      <motion.div
                        key="contracted-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="relative p-5 sm:p-6 flex flex-col justify-between h-full w-full overflow-hidden group/card"
                      >
                        {/* Full Card Background Image (Aligned Bottom Center) */}
                        <img
                          src={service.image}
                          alt={service.title}
                          className="absolute inset-0 w-full h-full object-cover object-bottom group-hover/card:scale-110 transition-transform duration-700 select-none"
                        />

                        {/* Frosted Glass Gradient Overlay (90% > 75% > 10%) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/75 to-white/10 backdrop-blur-[6px] transition-all duration-300 group-hover/card:backdrop-blur-[2px] pointer-events-none" />

                        {/* Top: Pale Number + Category Badge */}
                        <div className="relative flex items-center justify-between z-10">
                          <div className="font-extrabold text-[32px] sm:text-[44px] lg:text-[54px] leading-none text-[#111827]/30 group-hover/card:text-[#05c989]/70 tracking-tight select-none transition-colors">
                            {service.number}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md border border-white/90 text-slate-700 group-hover/card:text-[#05c989] group-hover/card:border-emerald-200 flex items-center justify-center transition-colors shadow-xs">
                            <IconComp className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Bottom: Frosted Pill Title Box */}
                        <div className="relative flex flex-col items-start gap-1 z-10">
                          <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-white/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/80">
                            {service.category}
                          </span>
                          <h4 className="font-bold text-base sm:text-[19px] lg:text-[22px] text-[#111827] group-hover/card:text-[#05c989] leading-snug tracking-tight transition-colors">
                            {service.title}
                          </h4>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
