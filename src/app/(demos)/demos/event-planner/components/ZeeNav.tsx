'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

export const ZeeNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { showDemoToast } = useDemoToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleEnquire = () => {
    const el = document.getElementById('contact') || document.getElementById('services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMenuOpen(false);
    } else {
      showDemoToast(
        'Plan Your Event',
        'In the live site, this connects directly to the Zee Events booking and enquiry form.'
      );
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-body ${
        scrolled
          ? 'bg-[#F7F5F2]/95 backdrop-blur-xl border-b border-[#152A22]/10 py-3.5 shadow-md shadow-[#040301]/5'
          : 'bg-gradient-to-b from-[#F7F5F2]/90 via-[#F7F5F2]/40 to-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Split Nav (Left Links - Center Wordmark - Right Links) */}
        <div className="flex items-center justify-between">
          {/* Left Navigation Links */}
          <nav className="hidden lg:flex items-center gap-9 flex-1 font-body">
            <a
              href="#about"
              className="text-[0.74rem] font-medium tracking-[0.2em] uppercase text-[#545855] hover:text-[#152A22] transition-colors duration-300"
            >
              ABOUT STUDIO
            </a>
            <a
              href="#services"
              className="text-[0.74rem] font-medium tracking-[0.2em] uppercase text-[#545855] hover:text-[#152A22] transition-colors duration-300"
            >
              SERVICES
            </a>
            <a
              href="#portfolio"
              className="text-[0.74rem] font-medium tracking-[0.2em] uppercase text-[#545855] hover:text-[#152A22] transition-colors duration-300"
            >
              EXPERIENCES
            </a>
          </nav>

          {/* Center Editorial Logo Wordmark */}
          <Link
            href="/demos/event-planner"
            className="group flex flex-col items-center text-center justify-center px-4"
          >
            {/* Celestial Star Ornament */}
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-5 h-[1px] bg-gradient-to-r from-transparent to-[#152A22]/60" />
              <span className="text-[#152A22] text-xs">✦</span>
              <span className="w-5 h-[1px] bg-gradient-to-l from-transparent to-[#152A22]/60" />
            </div>

            <span className="font-heading text-2xl sm:text-3xl text-[#040301] tracking-[0.14em] font-normal group-hover:text-[#152A22] transition-colors leading-none">
              ZEE EVENTS
            </span>

            <span className="text-[0.54rem] font-bold tracking-[0.38em] uppercase text-[#B58E55] mt-1 font-body">
              WEDDINGS • CONCERTS • PRODUCTIONS
            </span>
          </Link>

          {/* Right Navigation Links & Action */}
          <div className="hidden lg:flex items-center justify-end gap-9 flex-1 font-body">
            <a
              href="#journal"
              className="text-[0.74rem] font-medium tracking-[0.2em] uppercase text-[#545855] hover:text-[#152A22] transition-colors duration-300"
            >
              THE JOURNAL
            </a>
            <button
              onClick={handleEnquire}
              className="text-[0.72rem] font-bold tracking-[0.2em] uppercase px-6 py-2.5 bg-[#152A22] hover:bg-[#0d1e18] text-white rounded-full transition-all duration-300 shadow-md shadow-[#152A22]/25 transform hover:-translate-y-0.5"
            >
              PLAN YOUR EVENT
            </button>
          </div>

          {/* Mobile Action & Menu Toggle */}
          <div className="flex lg:hidden items-center gap-3 font-body">
            <button
              onClick={handleEnquire}
              className="text-[0.64rem] font-bold tracking-[0.18em] uppercase px-3.5 py-1.5 bg-[#152A22] text-white rounded-full"
            >
              PLAN EVENT
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-[#040301] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              <div className="w-6 flex flex-col gap-1.5 items-end">
                <span
                  className={`h-[1.5px] bg-[#040301] transition-all duration-300 ${
                    menuOpen ? 'w-6 rotate-45 translate-y-[7.5px]' : 'w-6'
                  }`}
                />
                <span
                  className={`h-[1.5px] bg-[#152A22] transition-all duration-300 ${
                    menuOpen ? 'opacity-0' : 'w-4'
                  }`}
                />
                <span
                  className={`h-[1.5px] bg-[#040301] transition-all duration-300 ${
                    menuOpen ? 'w-6 -rotate-45 -translate-y-[7.5px]' : 'w-5'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden bg-[#F7F5F2]/98 border-t border-[#040301]/8 px-6 py-8 backdrop-blur-2xl shadow-xl font-body"
          >
            <div className="flex flex-col gap-5 text-center">
              {[
                { label: 'About Studio', href: '#about' },
                { label: 'Services', href: '#services' },
                { label: 'Experiences & Work', href: '#portfolio' },
                { label: 'The Journal', href: '#journal' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-heading text-2xl text-[#040301] hover:text-[#152A22] transition-colors py-1"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 border-t border-[#040301]/10">
                <button
                  onClick={handleEnquire}
                  className="w-full py-3 bg-[#152A22] text-white font-bold text-xs uppercase tracking-widest rounded-full"
                >
                  Plan Your Event Now →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
