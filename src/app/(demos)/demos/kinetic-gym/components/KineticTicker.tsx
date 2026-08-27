'use client';

import React from 'react';
import { Dumbbell } from 'lucide-react';

export function KineticTicker() {
  const tickerItems = [
    '24/7 COLOMBO ACCESS',
    'NATIONAL LEVEL COACHES',
    '3,500+ LK MEMBERS',
    'OLYMPIC ELEIKO STEEL',
    '1-DAY VIP TRIAL PASS',
    'COLOMBO 07 & 03 HUBS',
    'PERSONALIZED DIET & NUTRITION',
  ];

  return (
    <div className="w-full bg-white text-black py-3.5 sm:py-4.5 overflow-hidden relative z-20 border-y border-white shadow-[0_0_30px_rgba(255,255,255,0.15)] select-none">
      <div className="flex animate-marquee items-center gap-8 sm:gap-12 text-black">
        {/* First set of items */}
        {tickerItems.map((item, idx) => (
          <div key={`item-1-${idx}`} className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-black -rotate-45" />
            <span className="font-bebas text-lg sm:text-2xl lg:text-3xl tracking-wider font-bold uppercase text-black">
              {item}
            </span>
          </div>
        ))}

        {/* Duplicate set for infinite seamless loop */}
        {tickerItems.map((item, idx) => (
          <div key={`item-2-${idx}`} className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-black -rotate-45" />
            <span className="font-bebas text-lg sm:text-2xl lg:text-3xl tracking-wider font-bold uppercase text-black">
              {item}
            </span>
          </div>
        ))}

        {/* 3rd set to guarantee no gaps on ultra-wide screens */}
        {tickerItems.map((item, idx) => (
          <div key={`item-3-${idx}`} className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-black -rotate-45" />
            <span className="font-bebas text-lg sm:text-2xl lg:text-3xl tracking-wider font-bold uppercase text-black">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
