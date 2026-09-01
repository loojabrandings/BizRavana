'use client';

import React from 'react';
import { ArrowDown } from 'lucide-react';
import { HOSPITAL_SERVICES } from '../services/data';
import { LifeCareEcgLine } from './LifeCareEcgLine';

const TICKER_ITEMS = HOSPITAL_SERVICES.map((service) => service.title);

const STATS: Array<[string, string]> = [
  ['27', 'Medical services'],
  ['03', 'Units open 24 HRS'],
  ['365', 'Days a year'],
];

export function LifeCareServicesPageHero() {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* ── Backdrop Layers ────────────────────────────────────── */}
      <div className="absolute inset-0 svc-grid-bg" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[820px] h-[420px] rounded-full bg-[#102BDC]/[0.07] blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-[#3B82F6]/[0.06] blur-[120px] pointer-events-none" />

      {/* Signature ECG heartbeat trace */}
      <div className="absolute inset-x-0 top-[56%] sm:top-[52%] h-[110px] sm:h-[150px] pointer-events-none opacity-80">
        <LifeCareEcgLine />
      </div>

      {/* Bottom fade into page base */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white pointer-events-none" />

      {/* ── Main Content ───────────────────────────────────────── */}
      <div className="relative max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-20 sm:pt-24 lg:pt-28 pb-20 sm:pb-24">
        {/* Status Chip (matches landing badge pills) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#102BDC]/10 border border-[#102BDC]/20 text-[#102BDC] text-xs font-semibold font-inter mb-6 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-[#102BDC] animate-pulse" />
          <span>Open 24/7 • All Poya Days & Public Holidays</span>
        </div>

        {/* Headline */}
        <h1 className="font-dm-sans tracking-[-0.04em] text-[42px] leading-[1.05] sm:text-[64px] sm:leading-[1.03] lg:text-[86px] lg:leading-[1.02] max-w-[900px]">
          <span className="block overflow-hidden animate-word-reveal delay-300">
            <span className="block text-[#0D1527] font-medium">Every care</span>
          </span>
          <span className="block overflow-hidden animate-word-reveal delay-500">
            <span className="block text-[#334155] font-normal">you need.</span>
          </span>
          <span className="block overflow-hidden animate-word-reveal delay-700">
            <span className="block text-[#102BDC] font-semibold">Under one roof.</span>
          </span>
        </h1>

        {/* Sub-copy — simple English */}
        <p className="mt-6 max-w-xl font-inter text-sm sm:text-base text-[#475569] leading-relaxed animate-fade-up delay-800">
          Scans, tests, surgery, check-ups and 24-hour emergency care — all
          written in simple words. Tap any service below to see what it does
          and how to get it.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 animate-fade-up delay-900">
          <a
            href="#directory"
            className="group inline-flex items-center justify-center gap-2.5 bg-[#102BDC] hover:bg-[#0C22B0] text-white px-7 h-14 rounded-xl font-inter font-medium text-sm sm:text-base shadow-lg shadow-[#102BDC]/25 transition-all active:scale-[0.98]"
          >
            <span>Browse All Services</span>
            <ArrowDown
              size={17}
              className="group-hover:translate-y-0.5 transition-transform"
            />
          </a>
          <a
            href="tel:+94452287800"
            className="inline-flex items-center justify-center gap-2.5 border border-slate-200 bg-white hover:border-[#F43F5E]/50 hover:bg-rose-50 text-[#0D1527] px-6 h-14 rounded-xl font-inter font-medium text-sm sm:text-base transition-all active:scale-[0.98]"
          >
            <span className="w-2 h-2 rounded-full bg-[#F43F5E] animate-pulse" />
            <span className="text-xs sm:text-sm tracking-wide">
              24 HRS: <span className="font-semibold">+94 45 228 7800</span>
            </span>
          </a>
        </div>

        {/* Stats Strip */}
        <div className="mt-14 grid grid-cols-3 max-w-xl border-t border-slate-200 pt-7 gap-4 animate-fade-up delay-1000">
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

      {/* ── Services Ticker Marquee ──────────────────────────────── */}
      <div className="relative border-y border-slate-200/80 bg-[#F8FAFC] py-4 overflow-hidden svc-ticker">
        <div className="svc-ticker-track flex items-center">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              className="flex items-center flex-shrink-0"
            >
              {TICKER_ITEMS.map((title) => (
                <span
                  key={`${copy}-${title}`}
                  className="flex items-center gap-8 pr-8"
                >
                  <span className="font-inter text-xs uppercase tracking-[0.18em] text-[#64748B] whitespace-nowrap">
                    {title}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#102BDC]/40 flex-shrink-0" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}