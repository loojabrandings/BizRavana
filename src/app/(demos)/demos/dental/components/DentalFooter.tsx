'use client';

import React from 'react';
import { ArrowUp, Heart } from 'lucide-react';

interface DentalFooterProps {
  onOpenBooking?: () => void;
}

export function DentalFooter({ onOpenBooking }: DentalFooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'About Clinic', href: '#about' },
    { label: 'Core Services', href: '#services' },
    { label: 'Treatments Directory', href: '#procedures' },
    { label: 'Smile Results', href: '#results' },
    { label: 'Contact & Hours', href: '#contact' },
  ];

  return (
    <footer id="footer" className="w-full bg-[#111827] text-slate-400 select-none border-t border-slate-800 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20 flex flex-col gap-12">
        
        {/* Top Row: Brand Info + Navigation + CTA */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Col */}
          <div className="flex flex-col items-start gap-4 max-w-[380px]">
            <a href="#" className="flex items-center gap-2 group">
              <span className="w-2.5 h-2.5 rounded-full bg-[#05c989] group-hover:scale-125 transition-transform" />
              <span className="font-bold tracking-[-0.04em] text-xl text-white">
                LUMI<span className="text-[#05c989]">DENT</span>
              </span>
            </a>

            <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
              Colombo&apos;s premier dental center for gentle, modern, and pain-free dental care for the entire family.
            </p>

            <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50">
              SLDA Certified • Ministry of Health Registered
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              Navigation
            </span>
            <div className="flex flex-wrap lg:flex-col gap-x-6 gap-y-2.5 text-xs sm:text-sm">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="hover:text-[#05c989] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Direct */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              Colombo Clinic
            </span>
            <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-slate-400">
              <p className="text-white font-medium">No. 42, Ward Place, Colombo 07</p>
              <p>Hotline: <span className="text-white">+94 11 268 9100</span></p>
              <p>Email: <span className="text-white">care@lumident.lk</span></p>
              <p className="text-emerald-400 text-xs mt-1">Mon–Sat: 08:30 AM – 07:00 PM</p>
            </div>
          </div>

          {/* Reservation Action */}
          <div className="flex flex-col items-start gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              Online Booking
            </span>
            <p className="text-xs text-slate-400 max-w-[220px]">
              Same-week slots available for cleanings, consultations, and 3D digital scans.
            </p>
            <button
              onClick={onOpenBooking}
              className="px-6 py-2.5 rounded-full bg-[#05c989] hover:bg-[#04b37a] text-white text-xs font-medium transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Book Appointment
            </button>
          </div>

        </div>

        {/* Bottom Row: Copyright + Back to top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© 2026 LUMIDENT Dental Clinic (Pvt) Ltd. Colombo, Sri Lanka.</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#05c989] group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
