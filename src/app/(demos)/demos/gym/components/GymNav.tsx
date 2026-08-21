'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Membership', href: '#membership' },
  { label: 'Programs', href: '#programs' },
  { label: 'Trainers', href: '#trainers' },
  { label: 'Tour', href: '#tour' },
  { label: 'Offers', href: '#offers' },
  { label: 'Contact', href: '#contact' },
];

export const GymNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id.replace('#', ''));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#080808]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-xl shadow-black/50'
          : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex items-center justify-between">
        
        {/* ── Brand Logo ─────────────────────────────────────── */}
        <Link href="/demos/gym" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#CCFF00] flex items-center justify-center text-black shadow-lg shadow-[#CCFF00]/25 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-black fill-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-impact text-2xl tracking-wider text-[#FEF9F5] leading-none font-bold uppercase group-hover:text-[#CCFF00] transition-colors">
              PULSE<span className="text-[#CCFF00]">FIT</span>
            </span>
            <span className="text-[9px] font-bold tracking-[0.25em] text-[#FEF9F5]/40 uppercase">
              CLUB & TRAINING
            </span>
          </div>
        </Link>

        {/* ── Desktop Navigation Links ────────────────────────── */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleScrollTo(link.href);
              }}
              className="text-xs lg:text-sm font-semibold tracking-wide text-[#FEF9F5]/70 hover:text-[#CCFF00] transition-colors duration-200 uppercase"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── Desktop CTA Button ──────────────────────────────── */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => handleScrollTo('#membership')}
            className="group relative overflow-hidden bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs tracking-wider uppercase px-6 py-2.5 rounded-full transition-all duration-300 shadow-lg shadow-[#CCFF00]/20 hover:shadow-[#CCFF00]/40 hover:scale-105 flex items-center gap-2"
          >
            <span>JOIN US</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>

        {/* ── Mobile Hamburger ────────────────────────────────── */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => handleScrollTo('#membership')}
            className="bg-[#CCFF00] text-black font-bold text-xs uppercase px-4 py-1.5 rounded-full"
          >
            JOIN US
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col gap-1.5 items-end">
              <span
                className={`h-0.5 bg-white transition-all duration-300 ${
                  mobileMenuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'
                }`}
              />
              <span
                className={`h-0.5 bg-[#CCFF00] transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-0' : 'w-4'
                }`}
              />
              <span
                className={`h-0.5 bg-white transition-all duration-300 ${
                  mobileMenuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu Dropdown ────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#0a0a0a]/98 border-b border-white/10 px-6 py-6 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo(link.href);
                  }}
                  className="text-base font-semibold uppercase text-white/80 hover:text-[#CCFF00] transition-colors py-1"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-white/10">
                <button
                  onClick={() => handleScrollTo('#membership')}
                  className="w-full bg-[#CCFF00] text-black font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl shadow-lg shadow-[#CCFF00]/20"
                >
                  JOIN US NOW →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
