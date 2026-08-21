'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ArrowUp } from 'lucide-react';

// Custom Social SVG Icons
const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.27 6.27 0 0 0 1.95-4.49V8.48a8.27 8.27 0 0 0 4.82 1.63v-3.42a4.83 4.83 0 0 1-1-.002z" />
  </svg>
);

export const GymFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050505] text-[#FEF9F5] font-body border-t border-white/10 pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* ── Top Row: Logo & Navigation Links ────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-white/10">
          
          {/* Logo & Tagline */}
          <Link href="/demos/gym" className="flex items-center gap-3 group">
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

          {/* Quick Nav Links */}
          <nav className="flex flex-wrap items-center gap-6 sm:gap-8">
            {[
              { label: 'Why Us', href: '#why-us' },
              { label: 'Programs', href: '#programs' },
              { label: 'The Gym', href: '#tour' },
              { label: 'Membership', href: '#membership' },
              { label: 'Contact', href: '#contact' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollTo(link.href);
                }}
                className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#FEF9F5]/60 hover:text-[#CCFF00] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social Icon Buttons */}
          <div className="flex items-center gap-2.5">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-[#CCFF00] hover:bg-[#CCFF00] text-white hover:text-black flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-[#CCFF00] hover:bg-[#CCFF00] text-white hover:text-black flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>

            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-[#CCFF00] hover:bg-[#CCFF00] text-white hover:text-black flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <TikTokIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* ── Bottom Row: Copyright & Back to Top ─────────────── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FEF9F5]/40">
          <p>© {new Date().getFullYear()} PULSEFIT CLUB. ALL RIGHTS RESERVED.</p>
          
          <div className="flex items-center gap-6">
            <span>Mattegoda, Kottawa, Sri Lanka</span>
            <span>·</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="hover:text-[#CCFF00] transition-colors flex items-center gap-1.5 uppercase font-bold tracking-wider text-[10px]"
            >
              <span>BACK TO TOP</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
