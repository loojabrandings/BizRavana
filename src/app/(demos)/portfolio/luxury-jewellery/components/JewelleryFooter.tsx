'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function JewelleryFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer id="contact" className="relative w-full pt-16 pb-12 px-4 sm:px-6 lg:px-8 bg-white text-[#0D2D25] border-t border-[#0D2D25]/10 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
        
        {/* ── Top 2-Card Row: Newsletter & Get in Touch ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Card 1: Join Our Newsletter */}
          <div className="lg:col-span-6 p-8 sm:p-10 rounded-3xl bg-[#FAF6F0] border border-[#0D2D25]/10 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-2">
              <h3 className="font-italiana text-2xl sm:text-3xl text-[#0D2D25] tracking-wide uppercase font-normal">
                Join Our Newsletter
              </h3>
              <p className="text-xs sm:text-sm text-[#0D2D25]/75 font-light font-sans">
                Subscribe & get 10% off your first bespoke order plus VIP previews.
              </p>
            </div>

            {subscribed ? (
              <div className="p-4 rounded-xl bg-[#0D2D25] text-[#F6EFE7] text-xs font-semibold tracking-wide text-center">
                ✦ Thank you for subscribing to Câlin! Check your inbox for your 10% code.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                  className="flex-1 px-5 py-3.5 rounded-xl bg-white border border-[#0D2D25]/15 text-xs sm:text-sm text-[#0D2D25] placeholder-[#0D2D25]/40 focus:outline-none focus:border-[#C6A05F] transition-colors"
                />
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-xl bg-[#C6A05F] hover:bg-[#b08b49] text-[#071713] font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

          {/* Card 2: Get In Touch */}
          <div className="lg:col-span-6 p-8 sm:p-10 rounded-3xl bg-[#FAF6F0] border border-[#0D2D25]/10 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-2">
              <h3 className="font-italiana text-2xl sm:text-3xl text-[#0D2D25] tracking-wide uppercase font-normal">
                Get In Touch
              </h3>
              <p className="text-xs sm:text-sm text-[#0D2D25]/75 font-light font-sans">
                Visit our private salon or book a virtual one-on-one consultation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C6A05F] block font-bold">
                  Direct Line
                </span>
                <p className="font-medium text-[#0D2D25]">+1 (555) 456-7890</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C6A05F] block font-bold">
                  Atelier Email
                </span>
                <p className="font-medium text-[#0D2D25]">concierge@calin.com</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C6A05F] block font-bold">
                  Maison Address
                </span>
                <p className="font-medium text-[#0D2D25]">125 Luxury Lane, New York</p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom Bar: Brand Logo & Links ───────────────────────── */}
        <div className="pt-8 border-t border-[#0D2D25]/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          
          <Link href="/portfolio/luxury-jewellery" className="flex items-center">
            <span className="font-custom-brand text-3xl text-[#0D2D25] tracking-tight lowercase">
              câlin
            </span>
          </Link>

          <p className="text-xs text-[#0D2D25]/60 font-light font-sans">
            © {new Date().getFullYear()} Câlin Haute Joaillerie. All rights reserved. Handcrafted with ethical diamonds & 18K solid gold.
          </p>

          <div className="flex items-center gap-6 text-xs text-[#0D2D25]/70 font-medium">
            <a href="#privacy" className="hover:text-[#C6A05F] transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-[#C6A05F] transition-colors">Terms</a>
            <a href="#shipping" className="hover:text-[#C6A05F] transition-colors">Shipping</a>
          </div>

        </div>

      </div>
    </footer>
  );
}
