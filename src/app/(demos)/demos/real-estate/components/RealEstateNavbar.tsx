'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, Compass, Menu, X, ArrowUpRight } from 'lucide-react';

export function RealEstateNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 sm:py-6 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        
        {/* ── Brand Logo ────────────────────────────────────── */}
        <Link 
          href="/demos/real-estate" 
          className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E8E5DF] shadow-md hover:shadow-lg transition-all"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880] group-hover:scale-125 transition-transform" />
          <span className="text-sm sm:text-base font-semibold tracking-wider text-[#141416] uppercase">
            AURA <span className="re-font-serif italic font-normal text-[#A8895E] lowercase text-lg">estates</span>
          </span>
        </Link>

        {/* ── Desktop Navigation Links ─────────────────────── */}
        <nav className="hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E8E5DF] shadow-md">
          <a
            href="#signature-places"
            className="px-4 py-2 rounded-full text-xs font-medium text-[#6E7178] hover:text-[#141416] hover:bg-[#FAF9F6] transition-all"
          >
            Signature Places
          </a>
          <a
            href="#property-inventory"
            className="px-4 py-2 rounded-full text-xs font-medium text-[#6E7178] hover:text-[#141416] hover:bg-[#FAF9F6] transition-all"
          >
            Browse Properties
          </a>
          <a
            href="#locations"
            className="px-4 py-2 rounded-full text-xs font-medium text-[#6E7178] hover:text-[#141416] hover:bg-[#FAF9F6] transition-all"
          >
            Prime Hotspots
          </a>
          <a
            href="#why-us"
            className="px-4 py-2 rounded-full text-xs font-medium text-[#6E7178] hover:text-[#141416] hover:bg-[#FAF9F6] transition-all"
          >
            Legal Vetting
          </a>
          <a
            href="#list-property"
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#A8895E] hover:text-[#141416] hover:bg-[#FAF9F6] transition-all"
          >
            List Property
          </a>
        </nav>

        {/* ── WhatsApp Direct Concierge CTA ────────────────── */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://wa.me/94770000000?text=Hi%20Aura%20Estates,%20I%20am%20interested%20in%20inquiring%20about%20your%20luxury%20property%20listings."
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#141416] text-[#FAF9F6] text-xs font-semibold tracking-wider uppercase shadow-md hover:bg-[#2A2B30] hover:shadow-xl transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>WhatsApp Concierge</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* ── Mobile Hamburger Button ──────────────────────── */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          className="md:hidden w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-[#E8E5DF] flex items-center justify-center text-[#141416] shadow-md cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {/* ── Mobile Dropdown Menu ───────────────────────────── */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden mt-3 max-w-sm mx-auto p-5 rounded-3xl bg-white/95 backdrop-blur-xl border border-[#E8E5DF] shadow-2xl flex flex-col gap-3 pointer-events-auto"
        >
          <a
            href="#signature-places"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#141416] hover:bg-[#FAF9F6]"
          >
            Signature Places
          </a>
          <a
            href="#property-inventory"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#141416] hover:bg-[#FAF9F6]"
          >
            Browse Properties
          </a>
          <a
            href="#locations"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#141416] hover:bg-[#FAF9F6]"
          >
            Prime Hotspots
          </a>
          <a
            href="#why-us"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#141416] hover:bg-[#FAF9F6]"
          >
            Legal Vetting
          </a>
          <a
            href="#list-property"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#A8895E] hover:bg-[#FAF9F6]"
          >
            List Property With Us
          </a>
          <a
            href="https://wa.me/94770000000?text=Hi%20Aura%20Estates,%20I%20am%20interested%20in%20inquiring%20about%20your%20luxury%20property%20listings."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 w-full py-3 rounded-full bg-[#141416] text-[#FAF9F6] text-center text-xs font-semibold tracking-wider uppercase shadow-md flex items-center justify-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>WhatsApp Concierge</span>
          </a>
        </motion.div>
      )}
    </header>
  );
}
