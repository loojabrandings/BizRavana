'use client';

import React, { useState, useEffect } from 'react';
import { Dumbbell, Menu, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KineticNavbarProps {
  onOpenModal: (plan?: string) => void;
}

export function KineticNavbar({ onOpenModal }: KineticNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'HOME', href: '#home' },
    { label: 'ABOUT US', href: '#story' },
    { label: 'PROGRAMS', href: '#programs' },
    { label: 'TRAINERS', href: '#trainers' },
    { label: 'PRICING', href: '#pricing' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'py-3.5 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/10 shadow-2xl'
            : 'py-5 md:py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-[#E10600] flex items-center justify-center text-white shadow-lg shadow-[#E10600]/30 group-hover:scale-105 transition-transform">
              <Dumbbell className="w-5 h-5 -rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="font-bebas text-2xl md:text-3xl tracking-wider text-white leading-none">
                KINETIC <span className="text-[#E10600]">GYM</span>
              </span>
              <span className="font-poppins text-[9px] uppercase tracking-[0.25em] text-[#9A9A9A] leading-none mt-0.5">
                COLOMBO • LK
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-poppins text-xs lg:text-sm uppercase tracking-widest text-[#9A9A9A] hover:text-white transition-colors relative py-1 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#E10600] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => onOpenModal('General Inquiry')}
              className="relative px-6 py-2.5 rounded-full bg-[#E10600] text-white font-poppins text-xs font-semibold uppercase tracking-wider overflow-hidden group shadow-lg shadow-[#E10600]/30 hover:shadow-[#E10600]/60 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                CONTACT US
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 transition-transform duration-300" />
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => onOpenModal('General Inquiry')}
              className="px-3.5 py-1.5 rounded-full bg-[#E10600] text-white font-poppins text-[11px] font-semibold tracking-wider uppercase"
            >
              JOIN
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-[#0D0D0D]/98 backdrop-blur-2xl pt-24 px-6 flex flex-col justify-between pb-10 md:hidden"
          >
            <div className="flex flex-col gap-5">
              <span className="text-[11px] font-poppins uppercase tracking-widest text-[#E10600] font-semibold">
                Navigation
              </span>
              {navLinks.map((link, idx) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="font-bebas text-3xl tracking-wider text-white hover:text-[#E10600] flex items-center justify-between py-2 border-b border-white/5"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-5 h-5 text-[#9A9A9A]" />
                </motion.a>
              ))}
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenModal('General Inquiry');
                }}
                className="w-full py-3.5 rounded-full bg-[#E10600] text-white font-poppins text-sm font-semibold tracking-wider uppercase text-center shadow-lg shadow-[#E10600]/40"
              >
                CONTACT US NOW
              </button>
              <p className="text-center text-xs text-[#9A9A9A] font-poppins">
                Colombo 07 & 03 • 24/7 Access • Certified SLBF Coaches
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
