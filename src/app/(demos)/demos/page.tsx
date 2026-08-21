'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { DEMO_SITES } from '@/data/demo-sites';
import '@/app/(site)/services/web-design/web-design.css';

export default function DemosHubPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredDemos =
    activeCategory === 'all'
      ? DEMO_SITES
      : DEMO_SITES.filter((d) => d.category === activeCategory);

  return (
    <main className="relative min-h-screen bg-[#060608] text-white overflow-x-hidden font-sans selection:bg-[#fd3a25] selection:text-white">
      {/* Background Atmosphere Grid & Glows from Web Design System */}
      <div className="wd-bg-grid" />
      <div className="wd-radial-glow wd-radial-glow-hero" />
      <div className="wd-radial-glow wd-radial-glow-center" />

      {/* Floating HUD Navigation */}
      <header className="wd-hud-nav" aria-label="BizRavana Demos Navigation">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-sm sm:text-base font-extrabold tracking-wider text-white">
            Biz<span className="text-[#fd3a25]">Ravana</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300 font-mono">
            Showcase
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-neutral-300">
          <Link
            href="/services/web-design"
            className="hover:text-white transition-colors"
          >
            Web Design Pricing
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </div>

        <Link
          href="/services/web-design#pricing"
          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#ff6b57] to-[#fd3a25] text-[#060608] font-bold text-xs shadow-md shadow-[#fd3a25]/30 hover:brightness-110 transition-all whitespace-nowrap"
        >
          Get Yours Built →
        </Link>
      </header>

      {/* Main Content Container */}
      <div className="wd-container pt-36 sm:pt-40 pb-28 relative z-10">
        {/* Top Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="wd-badge-mono mb-6"
          >
            <span className="wd-dot-pulse" />
            <span>CLIENT CONCEPT SHOWCASE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] mb-6"
          >
            Industry-Specific <br />
            <span className="bg-gradient-to-r from-white via-[#ff6b57] to-[#fd3a25] bg-clip-text text-transparent">
              High-Converting Demos
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Explore live, custom-engineered concept landing pages designed by
            BizRavana for client outreach and maximum conversion impact.
          </motion.p>

          {/* Category Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex items-center justify-center gap-2 flex-wrap"
          >
            {[
              { id: 'all', label: 'All Demos' },
              { id: 'salon-spa', label: 'Salons & Spas' },
              { id: 'event-planner', label: 'Event Planners' },
              { id: 'hotel-villa', label: 'Hotels & Villas' },
            ].map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#ff6b57] to-[#fd3a25] text-[#060608] font-bold shadow-lg shadow-[#fd3a25]/30'
                      : 'bg-white/[0.04] text-neutral-400 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Demo Cards Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <AnimatePresence>
            {filteredDemos.map((demo) => {
              const isLive = demo.status === 'ready';
              return (
                <motion.div
                  key={demo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className={`wd-glass-card flex flex-col justify-between group ${
                    isLive ? 'border-[#fd3a25]/40' : 'opacity-75'
                  }`}
                >
                  {/* Card Media Header */}
                  <div className="relative h-64 w-full overflow-hidden bg-[#0c0d12]">
                    <Image
                      src={demo.thumbnailUrl}
                      alt={demo.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-[#0c0d12]/40 to-transparent" />

                    {/* Category & Status Badges */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#060608]/90 border border-white/15 text-[10px] font-bold uppercase tracking-wider text-neutral-300 backdrop-blur-md">
                        {demo.categoryLabel}
                      </span>
                      {isLive ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#fd3a25] text-white text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-md shadow-[#fd3a25]/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          <span>Live Concept</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-neutral-400 text-[9px] font-medium uppercase tracking-wider backdrop-blur-md">
                          Coming Next
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body Details */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between bg-[#0c0d12]/90">
                    <div className="space-y-3">
                      <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#ff6b57] transition-colors leading-snug">
                        {demo.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-2">
                        {demo.tagline}
                      </p>

                      {/* Feature Bullet List */}
                      <div className="pt-2 space-y-1.5 border-t border-white/5">
                        {demo.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-neutral-300"
                          >
                            <span className="text-[#ff6b57] font-bold">✓</span>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pt-6 mt-6 border-t border-white/10">
                      {isLive ? (
                        <Link
                          href={demo.liveUrl}
                          className="w-full py-3 rounded-full bg-gradient-to-r from-[#ff6b57] to-[#fd3a25] hover:from-[#ff8a7a] hover:to-[#ff7060] text-[#060608] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#fd3a25]/25 transition-all transform hover:-translate-y-0.5"
                        >
                          <span>Launch Live Concept Demo</span>
                          <span className="font-sans">→</span>
                        </Link>
                      ) : (
                        <div className="w-full py-3 rounded-full bg-white/[0.04] text-neutral-500 font-medium text-xs uppercase tracking-wider text-center border border-white/5 cursor-not-allowed">
                          Ready for Section-by-Section UI
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom Conversion Section (BizRavana Flame Banner) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-20 sm:mt-28 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#12141c] via-[#0c0d12] to-[#12141c] border border-[#fd3a25]/30 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#fd3a25]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center lg:text-left relative z-10 max-w-xl">
            <div className="wd-badge-mono mb-3">
              <span className="wd-dot-pulse" />
              <span>CUSTOM BUSINESS SITES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Want a high-converting website built for your brand?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Get an ultra-fast, modern web presence tailored with custom UI,
              speed optimization, and 1-click WhatsApp conversions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full lg:w-auto">
            <Link
              href="/services/web-design"
              className="wd-btn-accent w-full sm:w-auto text-xs uppercase tracking-wider"
            >
              Explore Web Design Packages →
            </Link>
            <Link
              href="/contact"
              className="wd-btn-secondary w-full sm:w-auto text-xs uppercase tracking-wider"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>

        {/* Footer Minimalist Strip */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} BizRavana. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link
              href="/services/web-design"
              className="hover:text-white transition-colors"
            >
              Web Design
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
