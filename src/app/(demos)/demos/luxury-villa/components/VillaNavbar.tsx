'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

export const VillaNavbar: React.FC = () => {
  const { showDemoToast } = useDemoToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Activities', href: '#activities' },
    { name: 'Facilities', href: '#facilities' },
    { name: 'Rates', href: '#rates' },
  ];

  const handleBookingClick = () => {
    setMobileMenuOpen(false);
    showDemoToast('Booking Request', 'Navigating to direct villa reservation & date picker...');
    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'py-3.5 villa-glass-active border-b border-emerald-600/15 shadow-md'
            : 'py-5 bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo / Brand */}
          <Link href="#top" className="flex items-center gap-3 group">
            <div
              className={`w-10 h-10 rounded-xl p-[1px] transition-all duration-300 ${
                isScrolled
                  ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 shadow-md shadow-emerald-800/20'
                  : 'bg-white/30 backdrop-blur-md border border-white/40 shadow-lg'
              }`}
            >
              <div
                className={`w-full h-full rounded-[11px] flex items-center justify-center transition-colors ${
                  isScrolled ? 'bg-white' : 'bg-black/30 backdrop-blur-md'
                }`}
              >
                <span
                  className={`font-serif font-extrabold text-xl tracking-tighter ${
                    isScrolled
                      ? 'text-transparent bg-clip-text bg-gradient-to-br from-emerald-700 to-teal-800'
                      : 'text-white'
                  }`}
                >
                  M
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span
                className={`font-serif text-lg sm:text-xl font-bold tracking-wider transition-colors ${
                  isScrolled
                    ? 'text-slate-900 group-hover:text-emerald-700'
                    : 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] group-hover:text-emerald-300'
                }`}
              >
                MISTY <span className={isScrolled ? 'text-emerald-600 font-light font-sans text-xs tracking-widest uppercase' : 'text-emerald-300 font-light font-sans text-xs tracking-widest uppercase'}>Peaks</span>
              </span>
              <span
                className={`text-[9px] font-mono tracking-widest uppercase font-semibold ${
                  isScrolled
                    ? 'text-emerald-800/80'
                    : 'text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]'
                }`}
              >
                Luxury A-Frame Hideaway
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`villa-nav-link text-sm font-semibold transition-colors tracking-wide ${
                  isScrolled
                    ? 'text-slate-800 hover:text-emerald-700'
                    : 'text-white hover:text-emerald-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]'
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Right Actions: Booking CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handleBookingClick}
              className="villa-btn-primary px-6 py-2.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 group cursor-pointer shadow-lg"
            >
              <span>Booking</span>
              <svg
                className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={handleBookingClick}
              className="villa-btn-primary px-4 py-2 rounded-full text-[11px] uppercase tracking-wider font-bold"
            >
              Booking
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2.5 rounded-xl border transition-all ${
                isScrolled
                  ? 'bg-slate-900/5 border-slate-900/10 text-slate-800 hover:text-emerald-700'
                  : 'bg-black/30 backdrop-blur-md border-white/30 text-white'
              }`}
              aria-label="Toggle navigation menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-[68px] z-40 p-4 md:hidden"
          >
            <div className="villa-glass-active rounded-2xl p-6 border border-emerald-600/20 shadow-2xl space-y-4">
              <nav className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl bg-slate-900/[0.03] hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 font-semibold text-sm transition-all flex items-center justify-between border border-slate-900/5"
                  >
                    <span>{link.name}</span>
                    <span className="text-emerald-600">→</span>
                  </a>
                ))}
              </nav>

              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={handleBookingClick}
                  className="villa-btn-primary w-full py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25"
                >
                  <span>Book Your Stay</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
