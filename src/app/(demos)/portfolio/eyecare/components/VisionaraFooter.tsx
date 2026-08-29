'use client';

import React from 'react';
import { ArrowUp, Phone, Mail, MapPin, Clock } from 'lucide-react';

export function VisionaraFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full bg-transparent text-white pt-24 pb-12 px-6 md:px-14 lg:px-20 border-t border-white/10 font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* ── TOP SECTION: BIG LOGO & QUICK ACTION ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b border-white/10">
          <div>
            <span className="font-['Syne',sans-serif] text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight block text-white">
              VISIONARA
            </span>
            <p className="text-xs md:text-sm text-white/60 mt-2 max-w-md">
              Sri Lanka’s premier digital eye clinic and bespoke optics. Dedicated to crystal-clear vision and comfortable eyewear for every generation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#booking"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-['Syne',sans-serif] text-xs font-bold uppercase tracking-widest transition-colors shadow-xl cursor-pointer"
            >
              BOOK AN APPOINTMENT
            </a>
            <button
              onClick={scrollToTop}
              className="w-12 h-12 border border-white/20 flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-colors cursor-pointer"
              title="Back to top"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 3 CLINIC BRANCHES IN SRI LANKA ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Colombo Branch */}
          <div className="p-6 bg-white/[0.02] border border-white/10 space-y-3">
            <span className="text-[10px] font-bold tracking-[0.25em] text-cyan-400 uppercase block">
              COLOMBO 07 FLAGSHIP
            </span>
            <h4 className="font-['Syne',sans-serif] text-lg font-bold uppercase text-white">
              Horton Place Clinic & Lab
            </h4>
            <div className="space-y-1.5 text-xs text-white/60">
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
                <span>No. 42, Horton Place, Colombo 07</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <span>011 268 4500 / 077 123 4567</span>
              </div>
              <div className="flex items-center space-x-2 text-white/50">
                <Clock className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <span>Mon-Sat: 8:30 AM - 7:00 PM</span>
              </div>
            </div>
          </div>

          {/* Kandy Branch */}
          <div className="p-6 bg-white/[0.02] border border-white/10 space-y-3">
            <span className="text-[10px] font-bold tracking-[0.25em] text-amber-400 uppercase block">
              KANDY BRANCH
            </span>
            <h4 className="font-['Syne',sans-serif] text-lg font-bold uppercase text-white">
              Kandy City Center
            </h4>
            <div className="space-y-1.5 text-xs text-white/60">
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
                <span>Level 2, Kandy City Center, Kandy</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <span>081 223 9800</span>
              </div>
              <div className="flex items-center space-x-2 text-white/50">
                <Clock className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <span>Mon-Sun: 9:30 AM - 6:30 PM</span>
              </div>
            </div>
          </div>

          {/* Galle Branch */}
          <div className="p-6 bg-white/[0.02] border border-white/10 space-y-3">
            <span className="text-[10px] font-bold tracking-[0.25em] text-emerald-400 uppercase block">
              SOUTHERN PROVINCE
            </span>
            <h4 className="font-['Syne',sans-serif] text-lg font-bold uppercase text-white">
              Galle Fort Clinic
            </h4>
            <div className="space-y-1.5 text-xs text-white/60">
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
                <span>No. 18, Church Street, Galle Fort</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <span>091 224 5100</span>
              </div>
              <div className="flex items-center space-x-2 text-white/50">
                <Clock className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <span>Mon-Sat: 9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── GIANT BACKGROUND WATERMARK ── */}
        <div className="pt-6 select-none pointer-events-none opacity-10 text-center">
          <span className="font-['Syne',sans-serif] text-[12vw] font-black uppercase tracking-tighter leading-none block">
            VISIONARA
          </span>
        </div>

        {/* ── BOTTOM COPYRIGHT & LINKS ── */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <p>© {new Date().getFullYear()} Visionara Eyecare (Pvt) Ltd. All Rights Reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#treatments" className="hover:text-white transition-colors">
              Services
            </a>
            <a href="#eyewear" className="hover:text-white transition-colors">
              Frames
            </a>
            <a href="#booking" className="hover:text-white transition-colors">
              Book Visit
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
