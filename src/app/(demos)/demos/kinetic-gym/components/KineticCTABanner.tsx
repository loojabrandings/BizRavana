'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, ArrowUpRight, ShieldCheck, Zap, Flame, Award } from 'lucide-react';
import Image from 'next/image';

interface KineticCTABannerProps {
  onOpenModal: (plan?: string) => void;
}

export function KineticCTABanner({ onOpenModal }: KineticCTABannerProps) {
  const perks = [
    { icon: Zap, label: '24/7 Instant Access' },
    { icon: Flame, label: 'Free InBody Composition' },
    { icon: Award, label: 'Master Coach Guidance' },
    { icon: ShieldCheck, label: 'No Lock-in Contracts' },
  ];

  return (
    <section className="relative py-20 sm:py-28 lg:py-36 bg-[#0D0D0D] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-[#E10600]/15 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main CTA Vault Card */}
        <div className="relative rounded-[36px] sm:rounded-[48px] bg-black border border-white/15 overflow-hidden p-8 sm:p-14 lg:p-20 shadow-2xl flex flex-col items-center justify-center text-center group">
          
          {/* Subtle Silhouette Background Overlays */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/60 to-black pointer-events-none" />
          
          {/* Left & Right Muscular Athlete Mood Textures (Low opacity, atmospheric) */}
          <div className="absolute left-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden lg:block">
            <Image
              src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop"
              alt="Athlete Silhouette Left"
              fill
              className="object-cover object-left filter grayscale contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black" />
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden lg:block">
            <Image
              src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600&auto=format&fit=crop"
              alt="Athlete Silhouette Right"
              fill
              className="object-cover object-right filter grayscale contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black" />
          </div>

          {/* Top Eyebrow Tag */}
          <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#E10600] animate-pulse" />
            <span className="font-poppins text-xs uppercase tracking-[0.25em] text-white font-semibold">
              JOIN COLOMBO'S ELITE STRENGTH SQUAD
            </span>
          </div>

          {/* Tagline Headline */}
          <div className="relative z-10 flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#E10600]/20 border border-[#E10600]/40 flex items-center justify-center text-[#E10600]">
              <Dumbbell className="w-5 h-5 -rotate-45" />
            </div>
            <h3 className="font-bebas text-2xl sm:text-3xl md:text-4xl text-white tracking-wider">
              START YOUR FITNESS JOURNEY
            </h3>
          </div>

          {/* Giant Kinetic Typography Architecture: TODAY / NOW / TOMORROW */}
          <div className="relative z-10 flex flex-col items-center justify-center select-none my-4">
            <span className="font-bebas text-2xl sm:text-3xl md:text-4xl tracking-[0.3em] text-[#9A9A9A] uppercase leading-none opacity-80">
              TODAY
            </span>
            <span className="font-bebas text-8xl sm:text-[140px] md:text-[180px] lg:text-[210px] leading-[0.8] text-[#E10600] tracking-tight glow-red-text my-2 scale-100 group-hover:scale-105 transition-transform duration-700">
              NOW
            </span>
            <span className="font-bebas text-2xl sm:text-3xl md:text-4xl tracking-[0.3em] text-[#9A9A9A] uppercase leading-none opacity-80">
              TOMORROW
            </span>
          </div>

          {/* Interactive Dual Action Buttons */}
          <div className="relative z-10 mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto">
            <button
              onClick={() => onOpenModal('CTA Banner - Join The Gym Now')}
              className="w-full sm:w-auto px-10 sm:px-12 py-4 rounded-full bg-[#E10600] text-white font-poppins text-xs sm:text-sm font-bold uppercase tracking-widest shadow-xl shadow-[#E10600]/40 hover:shadow-[#E10600]/70 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>JOIN THE GYM NOW</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenModal('1-Day VIP Guest Pass')}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 rounded-full bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white transition-all duration-300 font-poppins text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CLAIM 1-DAY VIP PASS</span>
              <ArrowUpRight className="w-4 h-4 text-[#9A9A9A]" />
            </button>
          </div>

          {/* Bottom Perks Strip */}
          <div className="relative z-10 mt-10 sm:mt-14 pt-8 border-t border-white/10 w-full grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {perks.map((perk, pIdx) => {
              const Icon = perk.icon;
              return (
                <div key={pIdx} className="flex items-center justify-center gap-2.5 text-center">
                  <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#E10600] shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-poppins text-[11px] sm:text-xs text-neutral-300 font-light whitespace-nowrap">
                    {perk.label}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
