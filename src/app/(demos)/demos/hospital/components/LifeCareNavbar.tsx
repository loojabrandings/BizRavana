'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User } from 'lucide-react';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Doctors', href: '#doctors' },
  { label: 'Services', href: '#services' },
  { label: 'Appointments', href: '#appointments' },
  { label: 'Contact', href: '#contact' },
];

export function LifeCareNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3 lg:py-3.5'
            : 'bg-white/80 backdrop-blur-sm border-b border-transparent py-4 lg:py-5'
        }`}
      >
        <nav className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between">
          {/* Left: Brand Name */}
          <div className="flex items-center gap-2">
            <Link
              href="#"
              className="text-[#0D1527] font-dm-sans font-medium text-[24px] sm:text-[28px] tracking-[-0.05em] leading-none select-none hover:opacity-90 transition-opacity"
            >
              <span className="text-[#102BDC]">LifeCare</span>{' '}
              <span className="font-normal text-[#475569]">Hospitals</span>
            </Link>
          </div>

          {/* Center: Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[#475569] hover:text-[#102BDC] font-dm-sans font-medium text-[15px] lg:text-[17px] tracking-normal transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: User Avatar + Mobile Hamburger */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* User Icon Badge */}
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-[#102BDC]/10 border border-[#102BDC]/20 flex items-center justify-center text-[#102BDC] flex-shrink-0 shadow-sm">
              <User size={18} strokeWidth={1.75} />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              className="md:hidden text-[#0D1527] p-2 rounded-md hover:bg-slate-100 transition-colors ml-1 z-50"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Overlay Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white/98 z-50 flex flex-col items-center justify-center gap-8 md:hidden animate-fade-in shadow-2xl">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 text-[#0D1527] p-2"
            aria-label="Close Navigation"
          >
            <X size={28} />
          </button>
          <div className="text-[#0D1527] font-dm-sans font-medium text-2xl mb-4 tracking-tight">
            <span className="text-[#102BDC]">LifeCare</span> Hospitals
          </div>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#475569] hover:text-[#102BDC] font-dm-sans text-2xl font-medium tracking-tight transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
