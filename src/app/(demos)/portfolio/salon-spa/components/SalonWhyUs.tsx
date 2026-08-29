'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

interface WhyPillar {
  number: string;
  tag: string;
  headline: string;
  subheading: string;
  description: string;
}

export const SalonWhyUs: React.FC = () => {
  const { showDemoToast } = useDemoToast();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const pillars: WhyPillar[] = [
    {
      number: '01',
      tag: 'Personal Attention',
      headline: 'Experienced Care',
      subheading: 'Expert Hands. Personal Attention.',
      description:
        'Our team takes the time to understand your style, your needs, and the look you want before every service with a dedicated 1-on-1 consultation.',
    },
    {
      number: '02',
      tag: 'All-in-One Space',
      headline: 'Complete Beauty Care',
      subheading: 'Everything You Need, Under One Roof.',
      description:
        'Hair, beauty, grooming and Ayurvedic relaxation — enjoy a complete, seamless self-care experience in one private, comfortable destination.',
    },
    {
      number: '03',
      tag: 'Global Formulations',
      headline: 'Quality Treatments',
      subheading: 'Professional Care That Makes a Difference.',
      description:
        'From Keratin and Hair Botox to beauty and wellness treatments, every service is executed with meticulous care and clinical attention to detail.',
    },
    {
      number: '04',
      tag: '3 Prime Branches',
      headline: 'Convenient Locations',
      subheading: 'Closer to You. Easier to Visit.',
      description:
        'With modern branches across Maharagama, Nugegoda and Kottawa, indulging in your favourite salon ritual fits effortlessly into your schedule.',
    },
  ];

  return (
    <section
      id="why-us"
      className="relative py-24 sm:py-36 bg-[#181818] text-[#F5F5F2] font-sans-clean overflow-hidden border-t border-white/5"
    >
      {/* Subtle Architectural Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#ECA53D]/10 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-[#C46A3B]/10 blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left Column: Sticky Editorial Statement */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#ECA53D]/30 backdrop-blur-md mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ECA53D] animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#ECA53D]">
                WHY SALON BOSS
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury text-[#F5F5F2] leading-[1.12] mb-6"
            >
              More Than a Salon.{' '}
              <span className="block font-serif-luxury italic font-medium bg-gradient-to-r from-[#F5F5F2] via-[#F5D59A] to-[#ECA53D] bg-clip-text text-transparent">
                Your Personal Style Destination.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-sm sm:text-base text-[#F5F5F2]/75 leading-relaxed mb-8 max-w-lg"
            >
              From expert hair care to relaxing beauty and wellness treatments,
              we focus on giving you a comfortable experience and results you’ll
              love.
            </motion.p>

            {/* Quick Trust Anchor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="p-5 rounded-2xl bg-white/[0.02] border border-[#ECA53D]/25 backdrop-blur-md max-w-md space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ECA53D]/20 border border-[#ECA53D]/40 flex items-center justify-center text-[#ECA53D] text-xs font-bold shrink-0">
                  ✓
                </div>
                <div className="text-xs font-bold text-[#F5F5F2] tracking-wider uppercase">
                  100% Unisex Standard
                </div>
              </div>
              <p className="text-xs text-[#F5F5F2]/60 leading-relaxed">
                Equal attention and customized care for both men and women
                seeking high-end grooming and relaxation.
              </p>
            </motion.div>
          </div>

          {/* Right Column: High-Fashion Architectural List */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {pillars.map((pillar, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <motion.div
                  key={pillar.number}
                  initial={{ opacity: 0, x: 25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.12 }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`relative p-6 sm:p-8 rounded-3xl transition-all duration-500 border overflow-hidden ${
                    isHovered
                      ? 'bg-gradient-to-r from-white/[0.07] to-white/[0.02] border-[#ECA53D]/50 shadow-2xl shadow-black/60 translate-x-1.5'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                  }`}
                >
                  {/* Subtle Top Indicator Line */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-500 ${
                      isHovered
                        ? 'bg-gradient-to-r from-[#ECA53D] via-[#F5D59A] to-transparent'
                        : 'bg-transparent'
                    }`}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-start gap-6 justify-between">
                    <div className="space-y-3 flex-1">
                      {/* Eyebrow Number & Tag */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold tracking-widest text-[#ECA53D]">
                          {pillar.number}
                        </span>
                        <span className="h-[1px] w-6 bg-white/20" />
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#E2C391]">
                          {pillar.headline}
                        </span>
                      </div>

                      {/* Main Subheading */}
                      <h3 className="text-xl sm:text-2xl font-serif-luxury text-[#F5F5F2] font-normal leading-snug">
                        {pillar.subheading}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-[#F5F5F2]/75 leading-relaxed">
                        {pillar.description}
                      </p>

                    
                    </div>

                    {/* Minimalist Watermark Numeral */}
                    <div className="hidden sm:block text-5xl lg:text-6xl font-serif-luxury font-bold text-white/[0.04] select-none shrink-0 transition-colors group-hover:text-[#ECA53D]/15">
                      {pillar.number}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
