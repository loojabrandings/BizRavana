'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDemoToast } from '@/components/demos/DemoToastContext';

export const SalonFooter: React.FC = () => {
  const { showDemoToast } = useDemoToast();

  const handleSocialClick = (platform: string) => {
    showDemoToast(
      `${platform} Link`,
      `Connecting to Salon Boss official ${platform} channel (@salonbossunisex).`
    );
  };

  return (
    <footer className="relative bg-[#121212] text-[#F5F5F2] font-sans-clean border-t border-[#ECA53D]/20 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-[#ECA53D] to-transparent shadow-[0_0_15px_#ECA53D]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/demos/salon-spa" className="inline-block">
              <div className="relative w-36 h-12 flex items-center">
                <Image
                  src="/demos/salon-boss/logo.png"
                  alt="Salon Boss Unisex Logo"
                  width={160}
                  height={50}
                  className="object-contain w-auto h-full brightness-110"
                />
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[#F5F5F2]/75 leading-relaxed max-w-sm">
              Redefining unisex grooming, precision hair transformations, and
              soothing Ayurvedic wellness across Maharagama, Nugegoda, and Kottawa.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { name: 'Instagram', label: 'IG' },
                { name: 'TikTok', label: 'TT' },
                { name: 'WhatsApp', label: 'WA' },
                { name: 'Facebook', label: 'FB' },
              ].map((s) => (
                <button
                  key={s.name}
                  onClick={() => handleSocialClick(s.name)}
                  className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-[#ECA53D] border border-white/10 hover:border-[#ECA53D] text-[#F5F5F2] hover:text-[#1C1C1C] text-xs font-bold transition-all flex items-center justify-center"
                  title={s.name}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Branches Column */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-[0.2em] text-[#ECA53D]">
              Our Branches
            </h4>
            <ul className="space-y-3 text-xs text-[#F5F5F2]/80">
              <li className="space-y-0.5">
                <span className="font-bold text-[#F5F5F2] block">
                  Maharagama (Head Branch)
                </span>
                <span className="text-[#F5F5F2]/60">
                  No, 2/A, Old Road, Maharagama
                </span>
              </li>
              <li className="space-y-0.5">
                <span className="font-bold text-[#F5F5F2] block">
                  Nugegoda Branch
                </span>
                <span className="text-[#F5F5F2]/60">High Level Road, Nugegoda</span>
              </li>
              <li className="space-y-0.5">
                <span className="font-bold text-[#F5F5F2] block">
                  Kottawa Branch
                </span>
                <span className="text-[#F5F5F2]/60">
                  Pannipitiya Road, Kottawa
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Navigation & Hours */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-[0.2em] text-[#ECA53D]">
              Opening Hours & Contact
            </h4>
            <div className="space-y-2 text-xs text-[#F5F5F2]/80">
              <p>
                <span className="text-white/50 block">Operating Hours:</span>
                <span className="font-semibold text-[#F5F5F2]">
                  Open Daily: 9:00 AM – 8:00 PM
                </span>
              </p>
              <p>
                <span className="text-white/50 block">Hotline:</span>
                <span className="font-bold text-[#ECA53D]">+94 71 581 6925</span>
              </p>
              <p>
                <span className="text-white/50 block">Email:</span>
                <span className="text-[#F5F5F2]">
                  salonbossmaharagama@gmail.com
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & BizRavana Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F5F5F2]/50">
          <p>© {new Date().getFullYear()} SALON BOSS UNISEX. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Concept Demo Designed & Engineered by</span>
            <Link
              href="/"
              className="text-[#ECA53D] hover:underline font-semibold"
            >
              BizRavana
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};
