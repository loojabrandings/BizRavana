'use client';

import React from 'react';
import Link from 'next/link';
import { useDemoToast } from '@/components/demos/DemoToastContext';

export const VillaFooter: React.FC = () => {
  const { showDemoToast } = useDemoToast();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContactAction = (type: string) => {
    showDemoToast('Contact Concierge', `Connecting to Misty Peaks ${type}...`);
  };

  return (
    <footer className="relative bg-[#062419] text-white pt-16 sm:pt-20 pb-10 overflow-hidden border-t border-emerald-900/40">
      {/* Ambient Radial Backlight Glow */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Main Footer Columns Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/10">
          {/* Column 1: Brand & Bio (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 p-[1px] shadow-lg shadow-emerald-900/30">
                <div className="w-full h-full bg-[#062419] rounded-[11px] flex items-center justify-center">
                  <span className="font-serif font-extrabold text-xl tracking-tighter text-emerald-300">
                    M
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-wider text-white">
                  MISTY <span className="text-emerald-400 font-light font-sans text-xs tracking-widest uppercase">Peaks</span>
                </span>
                <span className="text-[9px] font-mono tracking-widest text-emerald-300/80 uppercase font-semibold">
                  Luxury A-Frame Hideaway
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed max-w-sm">
              An exclusive luxury A-frame cabana nestled amidst endless emerald tea hills. Wake up above the morning
              mist and experience intimate mountain tranquility.
            </p>

            {/* Direct Contact Badges */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                onClick={() => handleContactAction('WhatsApp')}
                className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-emerald-600/30 border border-white/15 text-xs text-slate-200 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>WhatsApp: +94 77 123 4567</span>
              </button>

              <button
                onClick={() => handleContactAction('Email Concierge')}
                className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-emerald-600/30 border border-white/15 text-xs text-slate-200 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>reservations@mistypeaks.lk</span>
              </button>
            </div>
          </div>

          {/* Column 2: Quick Links Navigation (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-light">
              <li>
                <a href="#activities" className="hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span> Guided Treks &amp; Activities
                </a>
              </li>
              <li>
                <a href="#facilities" className="hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span> Amenities &amp; Facilities
                </a>
              </li>
              <li>
                <a href="#rates" className="hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span> Stay Packages &amp; Pricing
                </a>
              </li>
              <li>
                <a href="#booking" className="hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span> Check Availability &amp; Booking
                </a>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span> All Concept Client Demos
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Highlands Atmosphere & Location Info (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              Location &amp; Sanctuary Vibe
            </h4>
            <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-xs text-slate-200">
                  <span className="font-bold block text-white">Ella Highland Ridge</span>
                  <span className="text-slate-400">Badulla District, Central Highlands, Sri Lanka</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-400 block font-mono text-[9px] uppercase">Elevation</span>
                  <span className="font-bold text-white">1,250m Above Sea</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[9px] uppercase">Climate</span>
                  <span className="font-bold text-white">18°C Misty Mornings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Sub-Footer Bar ── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Misty Peaks Luxury A-Frame Hideaway. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/portfolio"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              ← Back to Portfolio
            </Link>

            {/* Back to Top Button */}
            <button
              onClick={scrollToTop}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-emerald-600/40 border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Back to top of page"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
