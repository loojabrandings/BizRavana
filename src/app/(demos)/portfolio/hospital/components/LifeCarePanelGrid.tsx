'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Bed,
  Sparkles,
} from 'lucide-react';

const CAROUSEL_ITEMS = [
  {
    number: '25+',
    title: 'Specialist Doctors',
    tag: 'Consultant Roster',
    icon: Stethoscope,
  },
  {
    number: '14,000+',
    title: 'Patients Cared For',
    tag: 'Community Trust',
    icon: HeartPulse,
  },
  {
    number: '50+',
    title: 'Care Rooms & Units',
    tag: 'Modern Capacity',
    icon: Bed,
  },
  {
    number: '99%',
    title: 'Patient Satisfaction',
    tag: 'Quality of Care',
    icon: Sparkles,
  },
];

export function LifeCarePanelGrid() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full relative z-10">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pb-0 lg:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1.2fr_2fr] overflow-hidden rounded-t-2xl lg:rounded-2xl border border-slate-200/90 shadow-xl bg-white">
          {/* ── Panel 1 (bg-[#F8FAFC]) ─────────────────────────────── */}
          <div className="bg-[#F8FAFC] p-4 sm:p-5 lg:p-6 relative overflow-hidden flex flex-col justify-between min-h-[150px] sm:min-h-[175px] animate-fade-up delay-900 border-b md:border-b-0 md:border-r border-slate-200 group">
            {/* Background Image: Align Right Center */}
            <img
              src="/demos/hospital/panel 1.jpeg"
              alt="Personalized Care Journey"
              className="absolute inset-0 w-full h-full object-cover object-right z-0 select-none pointer-events-none"
            />

            {/* Gradient Overlay: Left to Right (White 90% -> 0%) */}
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.88) 45%, rgba(255, 255, 255, 0) 100%)',
              }}
            />

            <div className="relative z-10">
              <h2 className="font-dm-sans font-normal text-lg sm:text-[21px] lg:text-[24px] leading-[1.15] tracking-[-0.04em] max-w-[300px] text-[#0D1527]">
                Start your personalized care journey
              </h2>
            </div>

            {/* Redesigned Premium Action Badge Link */}
            <div className="relative z-10 mt-3">
              <Link
                href="#appointments"
                className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-[#102BDC]/25 text-[#102BDC] hover:bg-[#102BDC] hover:text-white px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-inter font-semibold shadow-sm hover:shadow-md transition-all duration-200 group/link active:scale-[0.98]"
              >
                <span>Personal Assessment</span>
                <ArrowRight size={13} className="group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ── Panel 2 (bg-white) Redesigned Rotating Stats Carousel ── */}
          <div className="bg-gradient-to-br from-white via-white to-blue-50/20 p-4 sm:p-5 lg:p-6 relative flex flex-col justify-between min-h-[150px] sm:min-h-[175px] animate-fade-up delay-1000 border-b md:border-b-0 md:border-r border-slate-200">
            {/* Top Row: Rotating Tag & Clinical Icon */}
            <div className="flex items-center justify-between relative z-10">
              <span className="inline-flex items-center gap-1 bg-[#102BDC]/10 border border-[#102BDC]/15 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-inter font-semibold text-[#102BDC]">
                {CAROUSEL_ITEMS[activeIndex].tag}
              </span>

              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100/90 border border-slate-200/60 flex items-center justify-center text-[#102BDC] shadow-sm">
                {React.createElement(CAROUSEL_ITEMS[activeIndex].icon, {
                  size: 15,
                  strokeWidth: 2,
                })}
              </div>
            </div>

            {/* Center: Metric Counter and Title */}
            <div className="relative flex-1 flex flex-col justify-center my-1.5">
              {CAROUSEL_ITEMS.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={idx}
                    className={`transition-all duration-500 flex flex-col items-start ${
                      isActive
                        ? 'opacity-100 translate-y-0 relative z-10'
                        : 'opacity-0 translate-y-2 absolute inset-0 pointer-events-none'
                    }`}
                  >
                    <span className="font-dm-sans font-bold text-2xl sm:text-[28px] lg:text-[32px] text-[#102BDC] tracking-tight leading-none">
                      {item.number}
                    </span>
                    <p className="font-dm-sans font-medium text-xs sm:text-sm lg:text-[15px] text-[#0D1527] leading-tight tracking-[-0.02em] mt-1 line-clamp-1">
                      {item.title}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bottom Row: Micro Segment Progress Indicators */}
            <div className="flex items-center gap-1.5 pt-1 relative z-10">
              {CAROUSEL_ITEMS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Metric ${idx + 1}`}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? 'w-6 bg-[#102BDC]'
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ── Panel 3 (bg-[#0D1527]) Redesigned Clinical Milestone Card ── */}
          <div className="bg-[#0D1527] text-white p-4 sm:p-5 lg:p-6 relative overflow-hidden flex flex-col justify-between min-h-[150px] sm:min-h-[175px] animate-fade-up delay-1100 group">
            {/* Ambient Corner Glow Accent */}
            <div
              className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-40 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #102BDC 0%, #3B82F6 100%)' }}
            />

            {/* Top Row: Live Indicator Badge + Activity Icon */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-inter font-medium text-[#93C5FD]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>24/7 Clinical Care</span>
              </div>

              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-[#60A5FA] shadow-inner group-hover:scale-105 group-hover:bg-[#102BDC] group-hover:text-white transition-all duration-300">
                <Activity size={16} strokeWidth={2} />
              </div>
            </div>

            {/* Bottom Row: Large Metric + Description */}
            <div className="relative z-10 mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-dm-sans font-bold text-xl sm:text-2xl lg:text-[26px] text-white tracking-tight leading-none">
                  +14,000
                </span>
                <span className="text-[11px] sm:text-xs font-inter font-medium text-[#60A5FA]">
                  Patients Cared For
                </span>
              </div>
              <p className="text-white/70 font-inter font-normal text-[10px] sm:text-[11px] lg:text-xs leading-relaxed mt-1 line-clamp-1 max-w-[260px]">
                Trusted healthcare excellence & compassionate recovery in Balangoda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
