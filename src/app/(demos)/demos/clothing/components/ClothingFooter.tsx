'use client';

import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles, MapPin, Mail, Phone } from 'lucide-react';

export function ClothingFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
      }, 2500);
    }
  };

  return (
    <footer className="relative w-full bg-[#FAFAFC] border-t border-neutral-200/80 pt-16 sm:pt-20 pb-12 select-none font-lexend text-[#120F1D] overflow-hidden">
      
      {/* ── Outer Wrapper ────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── 1. VIP Club Newsletter Row ─────────────────────── */}
        <div className="rounded-3xl sm:rounded-[2.5rem] bg-white border border-neutral-200/90 p-8 sm:p-12 mb-16 shadow-[0_15px_40px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8362F4]/10 text-[#8362F4] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 fill-[#8362F4]" />
              <span>Private Atelier Access</span>
            </div>
            <h3 className="font-righteous text-2xl sm:text-3xl lg:text-4xl text-[#120F1D] uppercase tracking-tight leading-tight mb-2">
              Join The Nexora Circle
            </h3>
            <p className="font-lexend text-xs sm:text-sm text-neutral-500 max-w-md">
              Receive private drop notifications, exclusive archival invites, and complimentary islandwide shipping on your first order.
            </p>
          </div>

          <div className="lg:col-span-6">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 px-6 py-4 rounded-full bg-neutral-50 border border-neutral-200 text-xs sm:text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:border-[#8362F4] focus:bg-white transition-all shadow-inner"
              />
              <button
                type="submit"
                className={`px-8 py-4 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer ${
                  subscribed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#120F1D] hover:bg-[#8362F4] text-white active:scale-95'
                }`}
              >
                {subscribed ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Subscribed ✓</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            <span className="text-[11px] text-neutral-400 mt-2 block text-left sm:pl-2">
              Zero spam. Unsubscribe with one click anytime.
            </span>
          </div>

        </div>

        {/* ── 2. Navigation Columns ──────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-10 pb-14 text-left">
          
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 pr-0 lg:pr-8 flex flex-col justify-between gap-6">
            <div>
              <span className="font-righteous text-3xl sm:text-4xl text-[#120F1D] tracking-tight block mb-3">
                NEXORA
              </span>
              <p className="font-lexend text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-sm">
                Architectural silhouettes tailored in Colombo, Sri Lanka. Built with sustainable raw organic fibers and uncompromising modern aesthetics.
              </p>
            </div>

            <div className="space-y-2 text-xs text-neutral-600">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#8362F4] shrink-0" />
                <span>Atelier: Colombo 07, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#8362F4] shrink-0" />
                <span>concierge@nexoraclothing.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#8362F4] shrink-0" />
                <span>+94 (11) 234-5678</span>
              </div>
            </div>

            {/* Social SVGs */}
            <div className="flex items-center gap-3 pt-1">
              {/* Instagram */}
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white border border-neutral-200 text-neutral-700 hover:text-white hover:bg-[#8362F4] hover:border-[#8362F4] flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105"
              >
                <svg className="w-4 h-4 fill-none stroke-currentColor stroke-2" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white border border-neutral-200 text-neutral-700 hover:text-white hover:bg-[#8362F4] hover:border-[#8362F4] flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105"
              >
                <svg className="w-4 h-4 fill-none stroke-currentColor stroke-2" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="#twitter"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-full bg-white border border-neutral-200 text-neutral-700 hover:text-white hover:bg-[#8362F4] hover:border-[#8362F4] flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 1: Collections */}
          <div className="flex flex-col gap-3">
            <span className="font-righteous text-sm text-[#120F1D] uppercase tracking-wider block mb-1">
              Collections
            </span>
            {[
              'Outerwear & Jackets',
              'Silhouettes & Dresses',
              'Statement Crops',
              'Selvedge Denim',
              'Linen Utility',
              'Runway Editions',
            ].map((link, idx) => (
              <a
                key={idx}
                href="#shop"
                className="text-xs text-neutral-500 hover:text-[#8362F4] transition-colors py-0.5"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Col 2: Concierge */}
          <div className="flex flex-col gap-3">
            <span className="font-righteous text-sm text-[#120F1D] uppercase tracking-wider block mb-1">
              Client Care
            </span>
            {[
              'Order Tracking',
              'Islandwide Shipping',
              '7-Day Size Exchange',
              'Bespoke Tailoring',
              'Garment Care Guide',
              'Help Center & FAQ',
            ].map((link, idx) => (
              <a
                key={idx}
                href="#shop"
                className="text-xs text-neutral-500 hover:text-[#8362F4] transition-colors py-0.5"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Col 3: Brand & Atelier */}
          <div className="flex flex-col gap-3">
            <span className="font-righteous text-sm text-[#120F1D] uppercase tracking-wider block mb-1">
              The Atelier
            </span>
            {[
              'Our Manifesto',
              'Sustainable Sourcing',
              'Artisans of Colombo',
              'Press & Editorial',
              'Wholesale & Stockists',
              'Careers',
            ].map((link, idx) => (
              <a
                key={idx}
                href="#manifesto"
                className="text-xs text-neutral-500 hover:text-[#8362F4] transition-colors py-0.5"
              >
                {link}
              </a>
            ))}
          </div>

        </div>

        {/* ── 3. Giant Architectural Brand Wordmark ──────────── */}
        <div className="w-full border-t border-neutral-200/80 pt-8 sm:pt-10 overflow-hidden text-center">
          <span className="font-righteous text-[14vw] leading-none tracking-tighter text-neutral-900/5 select-none block uppercase">
            NEXORA
          </span>
        </div>

        {/* ── 4. Bottom Legal & Copyright Bar ────────────────── */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 border-t border-neutral-100">
          <div>
            © {new Date().getFullYear()} NEXORA Clothing Atelier. All rights reserved.
          </div>

          <div className="flex items-center gap-6 text-[11.5px]">
            <a href="#privacy" className="hover:text-neutral-700 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-neutral-700 transition-colors">Terms of Service</a>
            <a href="#cookies" className="hover:text-neutral-700 transition-colors">Cookie Settings</a>
          </div>

          <div className="text-[11px] font-medium text-neutral-400">
            Engineered by <span className="text-[#8362F4] font-semibold">BizRavana</span>
          </div>
        </div>

      </div>

    </footer>
  );
}
