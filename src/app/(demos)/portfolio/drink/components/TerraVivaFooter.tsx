'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export function TerraVivaFooter() {
  return (
    <footer
      id="footer"
      className="w-full bg-black text-white pt-14 pb-10 px-4 sm:px-8 lg:px-12 border-t border-white/10 select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Main Minimal Grid with Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-10 border-b border-white/10"
        >
          {/* 1. Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span
                className="text-2xl font-normal uppercase tracking-widest text-white"
                style={{ fontFamily: "'Anton', sans-serif" }}
              >
                TERRAVIVA
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs text-white/50 leading-relaxed max-w-xs">
              100% Raw hydraulic cold-pressed organic juice. Zero added sugars, pure botanical craft in eco-aluminum.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="#"
                aria-label="Instagram"
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="#"
                aria-label="Twitter / X"
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* 2. Harvests */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/80 mb-1">
              The Harvests
            </span>
            <a href="#lineup" className="text-xs text-white/50 hover:text-white transition-colors">
              Alphonso Mango
            </a>
            <a href="#lineup" className="text-xs text-white/50 hover:text-white transition-colors">
              Pink Guava
            </a>
            <a href="#lineup" className="text-xs text-white/50 hover:text-white transition-colors">
              Ruby Delum
            </a>
            <a href="#lineup" className="text-xs text-white/50 hover:text-white transition-colors">
              Wild Passion
            </a>
            <a href="#lineup" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              Starter Variety Pack ($34)
            </a>
          </div>

          {/* 3. Navigation */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/80 mb-1">
              Quick Links
            </span>
            <a href="#features" className="text-xs text-white/50 hover:text-white transition-colors">
              Key Features
            </a>
            <a href="#comparison" className="text-xs text-white/50 hover:text-white transition-colors">
              Comparison Table
            </a>
            <a href="#process" className="text-xs text-white/50 hover:text-white transition-colors">
              Farm-to-Can Process
            </a>
            <a href="#reviews" className="text-xs text-white/50 hover:text-white transition-colors">
              Customer Reviews
            </a>
            <a href="#faq" className="text-xs text-white/50 hover:text-white transition-colors">
              FAQ & Shipping
            </a>
          </div>

          {/* 4. Direct Contact Details */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/80 mb-1">
              Contact Details
            </span>

            {/* Email */}
            <div className="flex items-start gap-2.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-white/40 block">Email Us</span>
                <a
                  href="mailto:hello@terraviva.com"
                  className="text-xs text-white/80 hover:text-emerald-400 transition-colors font-medium"
                >
                  hello@terraviva.com
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-2.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-white/40 block">Phone Support</span>
                <a
                  href="tel:+18005828482"
                  className="text-xs text-white/80 hover:text-emerald-400 transition-colors font-medium"
                >
                  +1 (800) 582-8482
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-white/40 block">Orchard & HQ</span>
                <span className="text-xs text-white/60">
                  742 Evergreen Grove, Napa Valley, CA
                </span>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-2.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-white/40 block">Hours</span>
                <span className="text-xs text-white/60">Mon–Fri: 8am – 6pm EST</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Minimal Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/40">
          <p>© 2026 TerraViva Botanical Beverages. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white/70 transition-colors">
              Privacy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-white/70 transition-colors">
              Terms
            </a>
            <span>•</span>
            <a href="#" className="hover:text-white/70 transition-colors">
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default TerraVivaFooter;
