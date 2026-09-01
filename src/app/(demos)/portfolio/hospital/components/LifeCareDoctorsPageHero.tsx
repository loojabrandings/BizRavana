'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowDown, CalendarCheck } from 'lucide-react';
import { LifeCareEcgLine } from './LifeCareEcgLine';

const STATS: Array<[string, string]> = [
  ['06', 'Specialist doctors'],
  ['20+', 'Years of experience'],
  ['365', 'Days of care'],
];

export function LifeCareDoctorsPageHero() {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* ── Backdrop Layers ────────────────────────────────────── */}
      <div className="absolute inset-0 svc-grid-bg" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[820px] h-[420px] rounded-full bg-[#102BDC]/[0.07] blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-[#3B82F6]/[0.06] blur-[120px] pointer-events-none" />

      {/* Signature ECG heartbeat trace */}
      <div className="absolute inset-x-0 top-[58%] sm:top-[55%] h-[110px] sm:h-[150px] pointer-events-none opacity-70">
        <LifeCareEcgLine />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white pointer-events-none" />

      {/* ── Main Content ───────────────────────────────────────── */}
      <div className="relative max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-20 sm:pt-24 lg:pt-28 pb-20 sm:pb-24">
        {/* Status Chip */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#102BDC]/10 border border-[#102BDC]/20 text-[#102BDC] text-xs font-semibold font-inter mb-6 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-[#102BDC] animate-pulse" />
          <span>Our Medical Team — Channelling Daily</span>
        </div>

        {/* Headline */}
        <h1 className="font-dm-sans tracking-[-0.04em] text-[42px] leading-[1.05] sm:text-[64px] sm:leading-[1.03] lg:text-[86px] lg:leading-[1.02] max-w-[900px]">
          <span className="block overflow-hidden animate-word-reveal delay-300">
            <span className="block text-[#0D1527] font-medium">Meet our</span>
          </span>
          <span className="block overflow-hidden animate-word-reveal delay-500">
            <span className="block text-[#102BDC] font-semibold">
              specialists.
            </span>
          </span>
        </h1>

        {/* Sub-copy — simple English */}
        <p className="mt-6 max-w-xl font-inter text-sm sm:text-base text-[#475569] leading-relaxed animate-fade-up delay-700">
          Six experienced consultants, careful hands and kind words. See each
          doctor’s qualifications and specialties below, then book your visit
          in one call.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 animate-fade-up delay-800">
          <a
            href="#doctors"
            className="group inline-flex items-center justify-center gap-2.5 bg-[#102BDC] hover:bg-[#0C22B0] text-white px-7 h-14 rounded-xl font-inter font-medium text-sm sm:text-base shadow-lg shadow-[#102BDC]/25 transition-all active:scale-[0.98]"
          >
            <span>Meet the Doctors</span>
            <ArrowDown
              size={17}
              className="group-hover:translate-y-0.5 transition-transform"
            />
          </a>
          <Link
            href="/portfolio/hospital#appointments"
            className="inline-flex items-center justify-center gap-2.5 border border-slate-200 bg-white hover:border-[#102BDC]/40 hover:bg-[#102BDC]/5 text-[#0D1527] px-6 h-14 rounded-xl font-inter font-medium text-sm sm:text-base transition-all active:scale-[0.98]"
          >
            <CalendarCheck size={17} className="text-[#102BDC]" />
            <span>Book an Appointment</span>
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="mt-14 grid grid-cols-3 max-w-xl border-t border-slate-200 pt-7 gap-4 animate-fade-up delay-900">
          {STATS.map(([value, label]) => (
            <div key={label}>
              <div className="font-dm-sans font-bold text-2xl sm:text-3xl text-[#0D1527] tabular-nums">
                {value}
              </div>
              <div className="font-inter text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-[#64748B] mt-1.5">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}