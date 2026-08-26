'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, Calendar, ArrowRight, Sparkles } from 'lucide-react';

interface DentalNavbarProps {
  onOpenBooking: () => void;
}

const NAV_LINKS = [
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Services', href: '#services', id: 'services' },
  { label: 'Treatments', href: '#procedures', id: 'procedures' },
  { label: 'Results', href: '#results', id: 'results' },
  { label: 'Contact', href: '#contact', id: 'contact' },
];

export function DentalNavbar({ onOpenBooking }: DentalNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // Scroll detection & Scrollspy active link tracking
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Detect current active section in viewport
      const sections = ['about', 'services', 'procedures', 'results', 'contact'];
      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          return;
        }
      }
      setActiveSection('');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-[100] w-full transition-all duration-300 ${isScrolled
            ? 'bg-white/80 backdrop-blur-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] border-b border-white/80 py-3 lg:py-3.5'
            : 'bg-white/40 backdrop-blur-xl border-b border-white/50 py-4 sm:py-5 lg:py-6'
          }`}
      >
        <nav className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between">

          {/* ── Brand Logo ────────────────────────────────────────── */}
          <Link
            href="/demos/dental"
            className="flex items-center gap-1.5 select-none group cursor-pointer"
          >
            <div className="flex items-center">
              <span className="text-[#071A2E] font-black text-xl sm:text-2xl tracking-[-0.03em] leading-none group-hover:text-black transition-colors">
                LUMI
              </span>
              <span className="text-slate-400 font-black text-xl sm:text-2xl tracking-[-0.03em] leading-none group-hover:text-slate-500 transition-colors">
                DENT
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#05c989] shadow-[0_0_10px_rgba(5,201,137,0.8)] animate-pulse" />
          </Link>

          {/* ── Desktop Center Nav Links Capsule ──────────────────── */}
          <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xs">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-full text-[13.5px] font-medium tracking-normal transition-all duration-200 ${isActive
                      ? 'text-[#05c989] font-semibold bg-emerald-50/80 shadow-xs'
                      : 'text-slate-600 hover:text-[#111827] hover:bg-slate-100/60'
                    }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* ── Desktop Right CTA Buttons ─────────────────────────── */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Hotline */}
            <a
              href="tel:+94112689100"
              className="hidden xl:flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:text-[#111827] bg-white/50 hover:bg-white/80 border border-white/80 transition-all shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-[#05c989]" />
              <span>+94 11 268 9100</span>
            </a>

            {/* Direct Booking CTA */}
            <button
              onClick={onOpenBooking}
              className="px-5 sm:px-6 py-2.5 sm:py-2.5 rounded-full bg-[#111827] hover:bg-[#05c989] text-white text-xs sm:text-[13px] font-semibold tracking-wide transition-all shadow-md hover:shadow-emerald-500/25 active:scale-95 flex items-center gap-2 cursor-pointer group"
            >
              <Calendar className="w-3.5 h-3.5 text-[#05c989] group-hover:text-white transition-colors" />
              <span>Book Appointment</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* ── Mobile Menu Toggle ────────────────────────────────── */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenBooking}
              className="sm:hidden px-3.5 py-1.5 rounded-full bg-[#111827] text-white text-xs font-semibold"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 bg-white/60 hover:bg-white border border-white/80 backdrop-blur-md transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#071A2E]" />}
            </button>
          </div>

        </nav>
      </header>

      {/* ── Mobile Menu Dropdown (Frosted Glass Sheet) ─────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[65px] z-[99] bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 shadow-2xl px-6 py-6 lg:hidden flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-1.5">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-between ${isActive
                      ? 'bg-emerald-50 text-[#05c989]'
                      : 'text-slate-800 hover:bg-slate-50'
                    }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#05c989]" />}
                </a>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <a
              href="tel:+94112689100"
              className="w-full py-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-700 font-semibold text-xs text-center flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#05c989]" />
              <span>Call Clinic (+94 11 268 9100)</span>
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3.5 bg-[#05c989] hover:bg-[#04b37a] text-white rounded-2xl font-bold text-xs text-center shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment Now</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
