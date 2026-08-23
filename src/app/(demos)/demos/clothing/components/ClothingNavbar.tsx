'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Shop', href: '#shop' },
  { name: 'New In', href: '#new-in' },
  { name: 'Collections', href: '#collections' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

export function ClothingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full pt-4 sm:pt-6 pb-2 font-lexend">
      <nav className="relative z-40 w-full max-w-[1400px] mx-auto flex items-center justify-between px-4 sm:px-12 lg:px-16">
        
        {/* ── Mobile Hamburger Button (Left on mobile) ─────────── */}
        <div className="flex lg:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-full text-[#181528] hover:bg-neutral-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" strokeWidth={2.2} />
          </button>
        </div>

        {/* ── Desktop: Navigation Links (Hidden on mobile) ─────── */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-[#181528] font-lexend">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-[#7958F3] transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* ── Center: Brand Logo ──────────────────────────────── */}
        <div className="text-center">
          <Link href="/demos/clothing" className="inline-block">
            <span className="font-righteous text-2xl sm:text-3xl tracking-[0.2em] text-[#120F1D] uppercase">
              NEXORA
            </span>
          </Link>
        </div>

        {/* ── Right: Search, Avatar & Cart Pill ────────────────── */}
        <div className="flex items-center gap-2.5 sm:gap-4 font-lexend">
          {/* Search Icon */}
          <button 
            type="button"
            className="text-[#181528] hover:text-[#7958F3] p-1.5 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" strokeWidth={2.2} />
          </button>

          {/* User Avatar Circle (Hidden on extra small screens) */}
          <div className="hidden sm:flex w-8 h-8 rounded-full overflow-hidden border border-[#D5CAFA] bg-[#EFEAFC] items-center justify-center font-lexend">
            <div className="w-full h-full bg-gradient-to-tr from-[#7958F3] to-[#A388FC] flex items-center justify-center text-white text-[11px] font-bold">
              NX
            </div>
          </div>

          {/* Cart Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-[#9D80FC] text-xs font-semibold text-[#181528] bg-white/50 font-lexend">
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7958F3]" strokeWidth={2} />
            <span className="hidden xs:inline">1 item</span>
            <span className="xs:hidden inline">1</span>
          </div>
        </div>
      </nav>

      {/* ── Mobile Slide-out Drawer Menu ─────────────────────── */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden flex justify-start"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-4/5 max-w-xs h-full bg-white p-6 flex flex-col justify-between shadow-2xl font-lexend"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-neutral-100">
                <span className="font-righteous text-2xl tracking-[0.2em] text-[#120F1D] uppercase">
                  NEXORA
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-[#120F1D] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-5 mt-8 font-lexend">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-bold text-[#120F1D] hover:text-[#7958F3] transition-colors py-1"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* User Info Footer */}
            <div className="pt-6 border-t border-neutral-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7958F3] to-[#A388FC] flex items-center justify-center text-white font-bold text-sm">
                NX
              </div>
              <div>
                <p className="text-sm font-bold text-[#120F1D]">VIP Member</p>
                <p className="text-xs text-[#7958F3] font-medium">Sophia Adams</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
