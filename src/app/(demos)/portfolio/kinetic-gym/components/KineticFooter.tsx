'use client';

import React from 'react';
import { Dumbbell } from 'lucide-react';

export function KineticFooter() {
  return (
    <footer className="relative bg-[#000000] text-white pt-12 sm:pt-16 pb-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 1. Curved Top Capsule / Bowl Container with Vibrant Red Border */}
        <div className="relative rounded-t-[44px] sm:rounded-t-[60px] md:rounded-t-[72px] bg-[#0a0a0a] border-t-2 border-x-2 border-[#E10600] pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 px-6 sm:px-12 lg:px-16 shadow-[0_-20px_50px_rgba(225,6,0,0.18)]">
          
          {/* Subtle Ambient Red Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#E10600]/10 rounded-full blur-[140px] pointer-events-none" />

          {/* 3-Column Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12 relative z-10">
            
            {/* Column 1: Quick Links */}
            <div className="flex flex-col">
              <span className="font-poppins text-xs font-mono text-[#9A9A9A] uppercase tracking-wider mb-3">
                [Quick Links]
              </span>
              <div className="w-full h-px bg-white/10 mb-4" />
              <div className="flex flex-col gap-3">
                {['HOME', 'ABOUT US', 'PRICING'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '')}`}
                    className="font-bebas text-2xl sm:text-3xl tracking-wider text-white hover:text-[#E10600] transition-colors py-1"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Programs */}
            <div className="flex flex-col">
              <span className="font-poppins text-xs font-mono text-[#9A9A9A] uppercase tracking-wider mb-3">
                [Programs]
              </span>
              <div className="w-full h-px bg-white/10 mb-4" />
              <div className="flex flex-col gap-3">
                {['STRENGTH TRAINING', 'FAT LOSS PROGRAM', 'HIIT WORKOUTS'].map((item) => (
                  <a
                    key={item}
                    href="#programs"
                    className="font-bebas text-2xl sm:text-3xl tracking-wider text-white hover:text-[#E10600] transition-colors py-1"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Column 3: Support */}
            <div className="flex flex-col">
              <span className="font-poppins text-xs font-mono text-[#9A9A9A] uppercase tracking-wider mb-3">
                [Support]
              </span>
              <div className="w-full h-px bg-white/10 mb-4" />
              <div className="flex flex-col gap-3">
                {['HELP CENTER', 'MEMBERSHIP GUIDE', 'FAQS'].map((item) => (
                  <a
                    key={item}
                    href="#pricing"
                    className="font-bebas text-2xl sm:text-3xl tracking-wider text-white hover:text-[#E10600] transition-colors py-1"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

          </div>


        </div>

        {/* 2. Privacy & Copyright Strip */}
        <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-poppins text-xs text-[#9A9A9A]">
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms & Condition</a>
            <span className="hidden md:inline text-neutral-600">|</span>
            <span className="hidden md:inline text-neutral-400">Colombo 07 & Colombo 03, Sri Lanka</span>
          </div>
          <div>
            <span>© 2026 Kinetic Gym Sri Lanka. All Rights Reserved.</span>
          </div>
        </div>

        {/* 3. Giant Brand Title Typography Spanning Full Width */}
        <div className="w-full text-center my-4 select-none pointer-events-none overflow-hidden">
          <h2 className="font-bebas text-[16vw] leading-[0.82] tracking-tighter text-white uppercase block drop-shadow-2xl">
            KINETIC GYM
          </h2>
        </div>

        {/* 4. Bottom Brand Logo & Credit Strip */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between font-poppins text-xs text-[#9A9A9A]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#E10600] flex items-center justify-center text-white">
              <Dumbbell className="w-3.5 h-3.5 -rotate-45" />
            </div>
            <span className="font-bebas text-lg tracking-wider text-white">
              KINETIC GYM // LK
            </span>
          </div>

          <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            CRAFTED FOR <span className="text-white font-semibold">COLOMBO ATHLETES</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
