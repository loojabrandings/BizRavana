'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, ArrowRight, Menu, X, Phone, MessageSquare, MapPin } from 'lucide-react';
import { useVisionaraStore } from './VisionaraStore';

export function VisionaraNavbar() {
  const { effectiveTheme, toggleTheme } = useVisionaraStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect scroll position for backdrop blur enhancement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'ABOUT US', href: '#about' },
    { label: 'SERVICES & PRICING', href: '#treatments' },
    { label: 'FRAMES COLLECTION', href: '#eyewear' },
    { label: 'OUR DOCTORS', href: '#visionara-body-content' },
    { label: 'PATIENT REVIEWS', href: '#visionara-body-content' },
    { label: 'COMMON FAQS', href: '#faq' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[100000] px-6 md:px-14 py-4 md:py-5 flex items-center justify-between font-['Plus_Jakarta_Sans',sans-serif] ${
          isScrolled || mobileMenuOpen
            ? effectiveTheme === 'light'
              ? 'bg-white/95 backdrop-blur-xl border-b border-black/10 shadow-sm py-3.5 md:py-4'
              : 'bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3.5 md:py-4'
            : 'bg-transparent'
        }`}
      >
        {/* ── LOGO BRAND ── */}
        <a
          href="#hero-section"
          onClick={handleLinkClick}
          className="flex items-center space-x-2 group cursor-pointer z-50"
        >
          <span
            className={`font-['Syne',sans-serif] font-black text-xl md:text-2xl tracking-wider uppercase ${
              effectiveTheme === 'light' ? 'text-zinc-950' : 'text-white'
            }`}
          >
            VISIONARA
          </span>
        </a>

        {/* ── DESKTOP CENTER NAVIGATION LINKS ── */}
        <nav className="hidden md:flex items-center space-x-8 lg:space-x-10 text-[11px] font-bold tracking-[0.22em] uppercase">
          {[
            { label: 'ABOUT', href: '#about' },
            { label: 'SERVICES', href: '#treatments' },
            { label: 'FRAMES', href: '#eyewear' },
            { label: 'SPECIALISTS', href: '#visionara-body-content' },
            { label: 'STORIES', href: '#visionara-body-content' },
            { label: 'FAQ', href: '#faq' },
          ].map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className={`cursor-pointer ${
                effectiveTheme === 'light'
                  ? 'text-zinc-600 hover:text-black font-semibold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── RIGHT ACTION AREA: THEME TOGGLE, CTA, & MOBILE HAMBURGER ── */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 md:space-x-4">
          {/* Lightning Fast Single-Icon Toggle Button */}
          <button
            onClick={toggleTheme}
            title={effectiveTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`w-9 h-9 flex items-center justify-center border cursor-pointer transition-colors ${
              effectiveTheme === 'light'
                ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-900 shadow-sm'
                : 'bg-zinc-900 hover:bg-zinc-800 border-white/20 text-white shadow-lg'
            }`}
          >
            {effectiveTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300 hover:text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-900" />
            )}
          </button>

          {/* Desktop Book Visit Quick CTA Button */}
          <a
            href="#booking"
            className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-['Syne',sans-serif] font-bold tracking-wider uppercase shadow-md cursor-pointer"
          >
            <span>BOOK VISIT</span>
            <ArrowRight className="w-3 h-3" />
          </a>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            className={`md:hidden w-9 h-9 flex items-center justify-center border cursor-pointer transition-colors ${
              effectiveTheme === 'light'
                ? 'bg-zinc-100 border-zinc-300 text-zinc-950'
                : 'bg-zinc-900 border-white/20 text-white'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── MOBILE FULL-SCREEN NAVIGATION DRAWER ── */}
      {mobileMenuOpen && (
        <div
          className={`fixed inset-0 top-[65px] z-[99999] md:hidden flex flex-col justify-between p-6 overflow-y-auto ${
            effectiveTheme === 'light'
              ? 'bg-white/95 backdrop-blur-2xl text-zinc-950 border-t border-black/10'
              : 'bg-black/95 backdrop-blur-2xl text-white border-t border-white/10'
          }`}
        >
          {/* Main Links */}
          <div className="space-y-6 pt-4">
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.25em] font-mono block ${
                effectiveTheme === 'light' ? 'text-zinc-400' : 'text-white/40'
              }`}
            >
              NAVIGATION MENU
            </span>

            <div className="flex flex-col space-y-4">
              {navLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`text-xl font-['Syne',sans-serif] font-extrabold uppercase tracking-tight py-2 border-b transition-colors flex items-center justify-between ${
                    effectiveTheme === 'light'
                      ? 'border-zinc-200 text-zinc-900 hover:text-blue-600'
                      : 'border-white/10 text-white hover:text-blue-400'
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Actions & Contact Footer */}
          <div className="space-y-4 pt-8 border-t border-white/10">
            <a
              href="#booking"
              onClick={handleLinkClick}
              className="w-full py-4 bg-blue-600 text-white font-['Syne',sans-serif] text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center space-x-2 shadow-xl cursor-pointer"
            >
              <span>BOOK APPOINTMENT (ZERO WAIT)</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="https://wa.me/94771234567"
              target="_blank"
              rel="noreferrer"
              onClick={handleLinkClick}
              className="w-full py-3 bg-emerald-600 text-white font-['Syne',sans-serif] text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CHAT ON WHATSAPP (+94 77 123 4567)</span>
            </a>

            <div
              className={`p-3 border text-xs space-y-1 text-center font-mono ${
                effectiveTheme === 'light'
                  ? 'bg-zinc-100 border-zinc-200 text-zinc-600'
                  : 'bg-zinc-950 border-white/10 text-white/60'
              }`}
            >
              <div className="flex items-center justify-center space-x-1 font-sans font-bold text-[11px] text-amber-500 uppercase">
                <MapPin className="w-3.5 h-3.5" />
                <span>COLOMBO • KANDY • GALLE</span>
              </div>
              <p>Hotline: 011 268 4500 / 081 223 9800</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
