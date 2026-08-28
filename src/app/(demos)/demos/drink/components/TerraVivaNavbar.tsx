'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, ArrowRight, Package } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'The Harvests', href: '#lineup' },
  { label: 'Why Us', href: '#comparison' },
  { label: 'Process', href: '#process' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#footer' },
];

export function TerraVivaNavbar() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Handle scroll detection for background glass effect & active section
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // Section spy
      const sectionIds = ['hero', 'features', 'lineup', 'comparison', 'process', 'reviews', 'faq', 'footer'];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none ${
          isScrolled
            ? 'py-3.5 bg-black/80 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/80'
            : 'py-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent'
        }`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          {/* 1. Brand Logo */}
          <a
            href="#hero"
            onClick={(e) => handleScrollTo(e, '#hero')}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <span
              className="text-2xl sm:text-3xl font-normal uppercase tracking-widest text-white group-hover:text-emerald-400 transition-colors"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              TERRAVIVA
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
          </a>

          {/* 2. Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl">
            {NAV_LINKS.map((link) => {
              const targetId = link.href.replace('#', '');
              const isActive = activeSection === targetId;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white/15 text-white font-semibold shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* 3. CTA & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <a
              href="#lineup"
              onClick={(e) => handleScrollTo(e, '#lineup')}
              className="hidden sm:inline-flex items-center gap-2 py-2 px-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:scale-105 shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Order Pack</span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 4. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl pt-24 px-6 pb-10 flex flex-col justify-between lg:hidden animate-fadeIn select-none"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2 px-3">
              NAVIGATION
            </span>
            {NAV_LINKS.map((link) => {
              const targetId = link.href.replace('#', '');
              const isActive = activeSection === targetId;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className={`py-3 px-4 rounded-2xl text-lg font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
            <a
              href="#lineup"
              onClick={(e) => handleScrollTo(e, '#lineup')}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-center text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Package className="w-4 h-4" />
              <span>Order Starter Discovery Pack • $34</span>
            </a>
            <p className="text-center text-[11px] text-white/40">
              100% Organic • Raw Hydraulic Cold-Pressed • Free Cold Shipping
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default TerraVivaNavbar;
