'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const REASONS = [
  'Certified Clinical Standards & Ethics',
  '24/7 Fully Equipped Emergency & OPD Unit',
  'Affordable & Transparent Healthcare Pricing',
  'Experienced Specialists & Compassionate Nursing Staff',
  'Advanced Ultrasound, Lab & Modern Surgical Facilities',
];

export function LifeCareWhyChooseUs() {
  const ref = useScrollReveal();

  return (
    <section
      id="why-choose-us"
      ref={ref}
      className="w-full py-16 sm:py-24 bg-white relative overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* ── 3-Column Layout (100% Match to Reference Image) ───────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* ── Column 1: Main Facility Image Frame ─────────────────── */}
          <div className="lg:col-span-4 w-full relative flex flex-col reveal-slide-left">
            <div className="w-full h-[360px] sm:h-[420px] lg:h-full min-h-[360px] rounded-3xl bg-slate-100/90 border border-slate-200/80 overflow-hidden relative shadow-md group">
              <img
                src="/demos/hospital/whyus.jpeg"
                alt="LifeCare Hospital Clinical Facility"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
              />
            </div>
          </div>

          {/* ── Column 2: Center Editorial Text & Checklist ─────────── */}
          <div className="lg:col-span-4 w-full flex flex-col justify-center py-4 lg:py-2 lg:pl-2 reveal-fade-up">
            <h2 className="font-dm-sans font-bold text-2xl sm:text-3xl lg:text-[34px] text-[#0D1527] leading-[1.2] tracking-[-0.03em] mb-3">
              Why Choose <span className="text-[#102BDC]">LifeCare Hospital?</span>
            </h2>

            <p className="font-inter text-sm sm:text-base text-[#475569] leading-relaxed mb-6">
              We combine clinical expertise, advanced technology, and dedicated care to deliver the finest healthcare experience in Balangoda.
            </p>

            {/* Feature Checklist */}
            <div className="space-y-3.5 mb-8">
              {REASONS.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 reveal-fade-up"
                >
                  <div className="text-[#00A887] flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={18} strokeWidth={2.2} />
                  </div>
                  <span className="font-inter font-medium text-xs sm:text-sm text-[#334155] leading-snug">
                    {reason}
                  </span>
                </div>
              ))}
            </div>

            {/* Outlined "Learn More About Us" Button */}
            <Link
              href="#about"
              className="inline-flex items-center gap-2 border border-[#102BDC] text-[#102BDC] hover:bg-[#102BDC] hover:text-white px-6 py-3.5 rounded-xl font-inter font-semibold text-sm transition-all w-fit shadow-sm group"
            >
              <span>Learn More About Us</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* ── Column 3: Emergency Help Card ───────────────────────── */}
          <div className="lg:col-span-4 w-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-blue-900/15 min-h-[380px] sm:min-h-[440px] bg-[#0D1527] reveal-slide-right">
            {/* Full Card Background Image */}
            <img
              src="/demos/hospital/emergency.jpeg"
              alt="LifeCare Emergency Service"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-bottom z-0 select-none pointer-events-none"
            />

            {/* Gradient Overlay: 75% -> 0% from top to bottom */}
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, rgba(16, 43, 220, 0.95) 0%, rgba(16, 43, 220, 0.75) 45%, rgba(16, 43, 220, 0) 85%)',
              }}
            />

            {/* Content Group (Badge + Title + Paragraph + Direct Hotline Pill Button) */}
            <div className="relative z-10 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold font-inter mb-3 border border-white/25">
                <ShieldCheck size={14} />
                <span>24/7 Immediate Response</span>
              </div>

              <h3 className="font-dm-sans font-bold text-2xl sm:text-3xl text-white leading-tight mb-2 drop-shadow-sm">
                Need Emergency Help?
              </h3>

              <p className="font-inter text-xs sm:text-sm text-white/90 leading-relaxed drop-shadow-sm mb-5">
                We are available 24/7 for all emergency situations. Your health and rapid recovery is our primary priority.
              </p>

              {/* Tightly Grouped Hotline Button (Exact Pill Style from Reference) */}
              <a
                href="tel:+94452287800"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-[#102BDC] hover:bg-slate-50 py-3 px-6 rounded-full font-dm-sans font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <div className="w-7 h-7 rounded-full bg-[#102BDC]/10 flex items-center justify-center text-[#102BDC] flex-shrink-0">
                  <PhoneCall size={15} strokeWidth={2.5} />
                </div>
                <span>+94 45 228 7800</span>
              </a>
            </div>

            {/* Bottom Spacer allowing the ambulance photo to be visible */}
            <div className="h-24 sm:h-28 relative z-0 pointer-events-none" />
          </div>

        </div>

      </div>
    </section>
  );
}
