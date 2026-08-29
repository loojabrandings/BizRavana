'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function LifeCareHero() {
  return (
    <section className="flex-1 flex flex-col justify-center w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-4 sm:py-8 lg:py-10 relative z-10">
      {/* ── Main Headline ────────────────────────────────────────── */}
      <div className="max-w-[1300px]">
        <h1 className="font-dm-sans font-normal tracking-[-0.05em] text-[44px] leading-[48px] sm:text-[76px] sm:leading-[70px] md:text-[100px] md:leading-[90px] lg:text-[124px] lg:leading-[106px] xl:text-[146px] xl:leading-[120px]">
          {/* Line 1: "We" "Care" */}
          <div className="block">
            <span className="inline-block overflow-hidden mr-[0.25em] align-top animate-word-reveal delay-300">
              <span className="text-[#0D1527] font-medium">We</span>
            </span>
            <span className="inline-block overflow-hidden mr-[0.25em] align-top animate-word-reveal delay-400">
              <span className="text-[#0D1527] font-medium">Care</span>
            </span>
          </div>

          {/* Line 2: "About" */}
          <div className="block">
            <span className="inline-block overflow-hidden mr-[0.25em] align-top animate-word-reveal delay-600">
              <span className="text-[#334155] font-light">About</span>
            </span>
          </div>

          {/* Line 3: "You" */}
          <div className="flex items-center flex-wrap">
            <span className="inline-block overflow-hidden align-top animate-word-reveal delay-900">
              <span className="text-[#102BDC] font-semibold">You</span>
            </span>
          </div>
        </h1>
      </div>

      {/* ── CTA Section ──────────────────────────────────────────── */}
      <div className="mt-6 sm:mt-8 lg:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 lg:gap-[40px] animate-fade-up delay-600">
        {/* Book an Appointment Button */}
        <Link
          href="#appointments"
          className="bg-[#102BDC] text-white rounded-xl flex items-center justify-center gap-2 hover:bg-[#0C22B0] active:scale-[0.98] transition-all w-full sm:w-[220px] md:w-[260px] lg:w-[290px] h-12 sm:h-14 lg:h-[64px] font-inter font-medium text-base sm:text-lg md:text-xl lg:text-xl tracking-[-0.03em] shadow-lg shadow-[#102BDC]/25 group"
        >
          <span>Book an Appointment</span>
          <ArrowUpRight
            className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            strokeWidth={1.75}
          />
        </Link>

        {/* Paragraph Description */}
        <p className="text-[#334155] max-w-[320px] font-inter font-normal text-sm sm:text-base lg:text-lg leading-[1.4] tracking-[-0.03em]">
          From routine check‑ups to advanced treatments, our dedicated team ensures your health and well‑being every step of the way.
        </p>
      </div>
    </section>
  );
}
