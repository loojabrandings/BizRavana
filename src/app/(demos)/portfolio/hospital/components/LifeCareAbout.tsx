'use client';

import React from 'react';
import {
  Clock,
  UserCheck,
  Building2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const KEY_FEATURES = [
  {
    icon: Clock,
    title: '24-Hour Service',
    description: 'Round-the-clock emergency & OPD care',
  },
  {
    icon: UserCheck,
    title: 'Professional Staff',
    description: 'Experienced doctors & nursing team',
  },
  {
    icon: Building2,
    title: 'Modern Facilities',
    description: 'Equipped laboratory, scan & surgery units',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Care',
    description: 'Compassionate, safe & ethical treatment',
  },
];

export function LifeCareAbout() {
  const ref = useScrollReveal();

  return (
    <section
      id="about"
      ref={ref}
      className="w-full py-16 sm:py-24 bg-white relative overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* ── Main 2-Column Layout ── */}
        <div className="w-full relative">
          
          {/* Subtle Background Decorative Cross & Ring SVGs */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none select-none opacity-25 z-0">
            {/* Medical Cross Graphic */}
            <svg
              className="absolute right-6 top-1/2 -translate-y-1/2 w-64 h-64 text-blue-100"
              viewBox="0 0 200 200"
              fill="currentColor"
            >
              <rect x="75" y="10" width="50" height="180" rx="16" />
              <rect x="10" y="75" width="180" height="50" rx="16" />
            </svg>
            {/* Concentric Rings */}
            <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full border border-blue-200/50" />
            <div className="absolute -right-8 -bottom-8 w-60 h-60 rounded-full border border-blue-200/40" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center relative z-10">
            
            {/* ── Left Column: About Section Image ── */}
            <div className="lg:col-span-6 w-full reveal-slide-left">
              <div className="w-full min-h-[360px] sm:min-h-[440px] lg:min-h-[480px] rounded-3xl bg-slate-100/90 border border-slate-200/80 overflow-hidden relative shadow-md group">
                <img
                  src="/demos/hospital/about.jpeg"
                  alt="LifeCare Hospital Balangoda Building"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full min-h-[360px] sm:min-h-[440px] lg:min-h-[480px] object-cover object-center group-hover:scale-102 transition-transform duration-500"
                />
              </div>
            </div>

            {/* ── Right Column: About Content + 4 Feature Icons ── */}
            <div className="lg:col-span-6 w-full flex flex-col justify-center reveal-fade-up">
              
              {/* Category Pill Badge */}
              <div className="inline-flex items-center gap-1.5 bg-[#102BDC]/10 border border-[#102BDC]/20 px-3.5 py-1 rounded-full text-xs font-inter font-semibold text-[#102BDC] w-fit mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Our History & About Us</span>
              </div>

              {/* Main Headline */}
              <h2 className="font-dm-sans font-bold text-2xl sm:text-3xl lg:text-[38px] text-[#0D1527] leading-[1.2] tracking-[-0.03em] mb-4">
                LifeCare Hospital <span className="text-[#102BDC]">For a Healthier Tomorrow</span>
              </h2>

              {/* Narrative Description */}
              <p className="font-inter font-normal text-sm sm:text-base text-[#475569] leading-[1.65] mb-8">
                LifeCare Hospital commenced operation in Balangoda on Saturday, January 19, 2019. It was created as a solution to the long-standing need for a well-equipped private hospital in Balangoda and born as a visionary concept of{' '}
                <strong className="text-[#0D1527] font-semibold">Dr. H.M.M.S Bandaranayaka</strong>{' '}
                to bring modern clinical technologies, experienced medical professionals, and compassionate care to our community.
              </p>

              {/* Bottom 4 Feature Icons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 pt-4 border-t border-slate-200/80">
                {KEY_FEATURES.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-start gap-2.5 group reveal-fade-up"
                    >
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#102BDC]/10 text-[#102BDC] flex items-center justify-center transition-colors group-hover:bg-[#102BDC] group-hover:text-white shadow-sm">
                        <Icon className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <div>
                        <h3 className="font-dm-sans font-bold text-xs sm:text-sm text-[#0D1527] leading-snug">
                          {feature.title}
                        </h3>
                        <p className="font-inter text-[11px] sm:text-xs text-[#64748B] leading-tight mt-0.5">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
