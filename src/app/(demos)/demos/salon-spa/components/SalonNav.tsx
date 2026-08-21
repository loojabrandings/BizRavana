'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

interface SalonNavProps {
  onBookClick?: () => void;
}

export const SalonNav: React.FC<SalonNavProps> = ({ onBookClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showDemoToast } = useDemoToast();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBooking = () => {
    if (onBookClick) {
      onBookClick();
    } else {
      const el = document.getElementById('booking') || document.getElementById('locations');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        showDemoToast(
          'Appointment Booking',
          'In the live site, this opens the direct WhatsApp or 1-click branch booking system.'
        );
      }
    }
  };

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'Signature', href: '#signature' },
    { label: 'Before & After', href: '#transformations' },
    { label: 'Our Work', href: '#gallery' },
    { label: 'Offers', href: '#offers' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 font-sans-clean ${
        scrolled
          ? 'bg-[#1C1C1C]/92 backdrop-blur-xl border-b border-[#ECA53D]/20 py-3 shadow-2xl shadow-black/60'
          : 'bg-gradient-to-b from-[#1C1C1C]/85 via-[#1C1C1C]/35 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/demos/salon-spa" className="flex items-center gap-3 group">
          <div className="relative w-28 sm:w-36 h-10 sm:h-12 flex items-center">
            <Image
              src="/demos/salon-boss/logo.png"
              alt="Salon Boss Unisex Logo"
              width={160}
              height={50}
              priority
              className="object-contain w-auto h-full brightness-110 drop-shadow-md transition-transform group-hover:scale-105"
            />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#F5F5F2]/80 hover:text-[#ECA53D] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#ECA53D] hover:after:w-full after:transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action Area */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Primary CTA: Book Appointment (#ECA53D Brand Gold) */}
          <button
            onClick={handleBooking}
            className="px-6 py-2.5 rounded-full bg-[#ECA53D] hover:bg-[#F5B453] text-[#1C1C1C] font-extrabold text-xs uppercase tracking-widest border border-[#F5F5F2]/30 shadow-lg shadow-[#ECA53D]/25 hover:shadow-[#ECA53D]/45 transition-all transform hover:-translate-y-0.5"
          >
            Book Appointment
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={handleBooking}
            className="px-4 py-2 rounded-full bg-[#ECA53D] text-[#1C1C1C] font-bold text-[11px] uppercase tracking-wider shadow-md"
          >
            Book
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-[#F5F5F2] hover:text-[#ECA53D] transition-colors"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? (
              <span className="text-xl leading-none">✕</span>
            ) : (
              <span className="text-xl leading-none">☰</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#1C1C1C]/98 border-b border-[#ECA53D]/20 px-6 py-6 overflow-hidden backdrop-blur-2xl"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F2]/90 hover:text-[#ECA53D] transition-colors py-1"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleBooking();
                  }}
                  className="w-full py-3 rounded-xl bg-[#ECA53D] text-[#1C1C1C] font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#ECA53D]/30 text-center"
                >
                  Book An Appointment →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
