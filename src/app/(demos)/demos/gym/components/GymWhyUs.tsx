'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Pillar {
  number: string;
  category: string;
  headline: string;
  description: string;
}

const PILLARS: Pillar[] = [
  {
    number: '01',
    category: 'Expert Guidance',
    headline: 'Train With Purpose.',
    description:
      'Get the right guidance and training approach to help you exercise with confidence and work toward your goals.',
  },
  {
    number: '02',
    category: 'Results-Focused Training',
    headline: 'Your Goals. Your Progress.',
    description:
      'Whether your goal is building muscle, losing fat or improving fitness, every workout has a purpose.',
  },
  {
    number: '03',
    category: 'Complete Fitness Experience',
    headline: 'Everything You Need to Train Better.',
    description:
      'From quality equipment and dedicated training areas to the space you need to stay focused, everything is designed around your workout.',
  },
  {
    number: '04',
    category: 'Supportive Community',
    headline: 'Stronger Together.',
    description:
      'Train alongside people who motivate you, challenge you and keep you accountable throughout your fitness journey.',
  },
  {
    number: '05',
    category: 'Flexible For Your Lifestyle',
    headline: 'Fitness That Fits Your Life.',
    description:
      'Convenient training options and a welcoming environment make it easier to stay consistent and keep showing up.',
  },
];

export const GymWhyUs: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(0);

  return (
    <section id="why-us" className="relative bg-[#080808] text-[#FEF9F5] py-24 sm:py-32 lg:py-40 overflow-hidden border-t border-white/10">
      
      {/* ── Ambient Radial Glows ────────────────────────────── */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#CCFF00]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#7B7457]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        
        {/* ── Section Header ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pb-16 sm:pb-20 border-b border-white/10 items-end">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white/5 border border-[#CCFF00]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#CCFF00]">
                WHY CHOOSE US
              </span>
            </div>
            
            <h2 className="font-impact italic text-4xl sm:text-5xl lg:text-6xl xl:text-7xl uppercase leading-[0.95] text-[#FEF9F5]">
              MORE THAN A GYM.<br />
              <span className="text-[#CCFF00]">A PLACE TO BECOME STRONGER.</span>
            </h2>
          </div>

          <div className="lg:col-span-5 lg:pb-2">
            <p className="text-sm sm:text-base text-[#FEF9F5]/70 leading-relaxed font-normal">
              Whether you&apos;re starting your fitness journey or pushing toward your next goal, we give you the environment, guidance and support to keep moving forward.
            </p>
          </div>
        </div>

        {/* ── Editorial Index Rows (No Cards) ────────────────── */}
        <div className="divide-y divide-white/10">
          {PILLARS.map((pillar, idx) => {
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={pillar.number}
                onMouseEnter={() => setHoveredIdx(idx)}
                className={`group py-8 sm:py-12 transition-all duration-400 cursor-pointer ${
                  isHovered ? 'bg-white/[0.02]' : 'bg-transparent'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start md:items-center">
                  
                  {/* Number & Category Name (4 cols) */}
                  <div className="md:col-span-4 flex items-center gap-4 sm:gap-6">
                    <span
                      className={`font-impact italic text-3xl sm:text-4xl lg:text-5xl transition-colors duration-300 ${
                        isHovered ? 'text-[#CCFF00]' : 'text-[#FEF9F5]/20'
                      }`}
                    >
                      {pillar.number}
                    </span>
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#FEF9F5]/40 block mb-0.5">
                        PILLAR {pillar.number}
                      </span>
                      <h3
                        className={`text-lg sm:text-xl font-bold uppercase tracking-wide transition-colors duration-300 ${
                          isHovered ? 'text-[#CCFF00]' : 'text-[#FEF9F5]'
                        }`}
                      >
                        {pillar.category}
                      </h3>
                    </div>
                  </div>

                  {/* Headline & Description (7 cols) */}
                  <div className="md:col-span-7 space-y-2">
                    <h4 className="font-impact italic text-xl sm:text-2xl lg:text-3xl uppercase tracking-tight text-[#FEF9F5]">
                      {pillar.headline}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#FEF9F5]/60 leading-relaxed font-normal max-w-2xl">
                      {pillar.description}
                    </p>
                  </div>

                  {/* Animated Arrow Accent (1 col) */}
                  <div className="hidden md:flex md:col-span-1 justify-end">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        isHovered
                          ? 'bg-[#CCFF00] text-black border-[#CCFF00] scale-110 translate-x-1'
                          : 'border-white/10 text-white/40 bg-transparent'
                      }`}
                    >
                      <span className="text-sm font-bold">→</span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
