'use client';

import React from 'react';
import Link from 'next/link';
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  ArrowUp,
  Globe,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export function LifeCareFooter() {
  const ref = useScrollReveal();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="contact"
      ref={ref}
      className="w-full bg-[#F8FAFC] border-t border-slate-200/80 pt-16 pb-12 relative overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* ── Top 4-Column Grid with Scroll Reveal ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-slate-200">
          
          {/* Column 1: Brand & Identity (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between reveal-fade-up">
            <div>
              <Link
                href="#"
                className="text-[#0D1527] font-dm-sans font-medium text-[26px] sm:text-[30px] tracking-[-0.05em] leading-none select-none inline-block mb-4"
              >
                <span className="text-[#102BDC]">LifeCare</span>{' '}
                <span className="font-normal text-[#475569]">Hospitals</span>
              </Link>

              <p className="font-inter text-sm text-[#64748B] leading-relaxed mb-6 max-w-sm">
                Committed to delivering compassionate, accessible, and world-class healthcare in Balangoda since January 19, 2019. Born as a visionary concept of Dr. H.M.M.S Bandaranayaka.
              </p>

              {/* 24/7 Emergency Badge */}
              <div className="bg-[#102BDC]/10 border border-[#102BDC]/20 rounded-2xl p-4 flex items-center gap-3.5 max-w-sm">
                <div className="w-10 h-10 rounded-xl bg-[#102BDC] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-[#102BDC]/20">
                  <PhoneCall size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#102BDC] uppercase tracking-wider font-inter">
                    24/7 Emergency Hotline
                  </div>
                  <a
                    href="tel:+94452287800"
                    className="font-dm-sans font-bold text-base sm:text-lg text-[#0D1527] hover:text-[#102BDC] transition-colors"
                  >
                    +94 45 228 7800
                  </a>
                </div>
              </div>
            </div>

            {/* Social Channels */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Globe, label: 'Website' },
                { icon: MessageCircle, label: 'WhatsApp' },
                { icon: Share2, label: 'Social' },
              ].map((social, idx) => {
                const Icon = social.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-[#475569] hover:text-[#102BDC] hover:border-[#102BDC]/40 hover:bg-[#102BDC]/5 flex items-center justify-center transition-all shadow-sm"
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: Quick Links (2 Cols) */}
          <div className="lg:col-span-2 reveal-fade-up">
            <h4 className="font-dm-sans font-bold text-sm sm:text-base text-[#0D1527] uppercase tracking-wider mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3 font-inter text-sm text-[#64748B]">
              <li>
                <Link href="#about" className="hover:text-[#102BDC] transition-colors">
                  About Us & History
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-[#102BDC] transition-colors">
                  Services & Facilities
                </Link>
              </li>
              <li>
                <Link href="#doctors" className="hover:text-[#102BDC] transition-colors">
                  Meet Our Doctors
                </Link>
              </li>
              <li>
                <Link href="#why-choose-us" className="hover:text-[#102BDC] transition-colors">
                  Why Choose Us
                </Link>
              </li>
              <li>
                <Link href="#appointments" className="hover:text-[#102BDC] transition-colors">
                  Channel a Specialist
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Clinical Services (3 Cols) */}
          <div className="lg:col-span-3 reveal-fade-up">
            <h4 className="font-dm-sans font-bold text-sm sm:text-base text-[#0D1527] uppercase tracking-wider mb-5">
              Medical Services
            </h4>
            <ul className="space-y-3 font-inter text-sm text-[#64748B]">
              <li>
                <span className="hover:text-[#102BDC] transition-colors cursor-pointer">
                  24/7 OPD & Emergency (ETU)
                </span>
              </li>
              <li>
                <span className="hover:text-[#102BDC] transition-colors cursor-pointer">
                  Inpatient Suites (Luxury & A/C)
                </span>
              </li>
              <li>
                <span className="hover:text-[#102BDC] transition-colors cursor-pointer">
                  Digital X-Ray & Ultrasound Scan
                </span>
              </li>
              <li>
                <span className="hover:text-[#102BDC] transition-colors cursor-pointer">
                  24/7 Automated Diagnostic Lab
                </span>
              </li>
              <li>
                <span className="hover:text-[#102BDC] transition-colors cursor-pointer">
                  Vision Care & Cataract Surgery
                </span>
              </li>
              <li>
                <span className="hover:text-[#102BDC] transition-colors cursor-pointer">
                  24/7 Indoor Pharmacy
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Hours (3 Cols) */}
          <div className="lg:col-span-3 reveal-fade-up">
            <h4 className="font-dm-sans font-bold text-sm sm:text-base text-[#0D1527] uppercase tracking-wider mb-5">
              Hospital Location
            </h4>
            <div className="space-y-4 font-inter text-sm text-[#64748B]">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#102BDC] flex-shrink-0 mt-0.5" />
                <span>LifeCare Hospital, Main Road, Balangoda, Sri Lanka</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#102BDC] flex-shrink-0" />
                <a href="mailto:info@lifecarehospital.lk" className="hover:text-[#102BDC] transition-colors">
                  info@lifecarehospital.lk
                </a>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={18} className="text-[#102BDC] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#0D1527] font-semibold block">Open 24/7 • 365 Days</span>
                  <span className="text-xs text-[#64748B]">
                    Active on all Poya days & public holidays
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom Sub-Footer Strip ────────────────────────────── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-inter text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} LifeCare Hospitals Balangoda. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-[#102BDC] transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-[#102BDC] transition-colors">
              Patient Rights
            </Link>
            <Link href="#" className="hover:text-[#102BDC] transition-colors">
              Terms of Service
            </Link>

            {/* Back to top button */}
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to Top"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-[#102BDC] hover:text-white hover:border-[#102BDC] flex items-center justify-center transition-all ml-2"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
