'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Flame, ExternalLink } from 'lucide-react';
import WebDesignNav from '@/app/(site)/services/web-design/components/WebDesignNav';
import WebDesignFooter from '@/app/(site)/services/web-design/components/WebDesignFooter';
import { DEMO_SITES } from '@/data/demo-sites';
import '@/app/(site)/services/web-design/web-design.css';

function PortfolioContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Industry categories
  const categories = useMemo(
    () => [
      { id: 'all', label: 'All Industries' },
      { id: 'gym', label: 'Fitness & Gyms' },
      { id: 'healthcare', label: 'Healthcare & Dental' },
      { id: 'ecommerce', label: 'E-Commerce' },
      { id: 'restaurant', label: 'Food & Beverage' },
      { id: 'saas', label: 'SaaS & Web Apps' },
      { id: 'hotels', label: 'Hotels & Villas' },
      { id: 'jewellery', label: 'Jewellery' },
      { id: 'fashion', label: 'Fashion & Apparel' },
      { id: 'real-estate', label: 'Real Estate' },
      { id: 'salons', label: 'Salons & Spa' },
    ],
    []
  );

  // Initialize category from URL query param if present
  const categoryParam = searchParams.get('category') || searchParams.get('cat') || 'all';
  const [activeCategory, setActiveCategory] = useState<string>(categoryParam);

  // Sync state if URL search param changes
  useEffect(() => {
    const currentParam = searchParams.get('category') || searchParams.get('cat') || 'all';
    setActiveCategory(currentParam);
  }, [searchParams]);

  // Handle category selection and sync with URL query param
  const handleSelectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const params = new URLSearchParams(searchParams.toString());

    if (categoryId === 'all') {
      params.delete('category');
      params.delete('cat');
    } else {
      params.set('category', categoryId);
    }

    const newQueryString = params.toString();
    const newUrl = newQueryString ? `${pathname}?${newQueryString}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  // Filter demos based on selected category
  const filteredDemos = useMemo(() => {
    return activeCategory === 'all'
      ? DEMO_SITES
      : DEMO_SITES.filter((d) => d.category === activeCategory);
  }, [activeCategory]);

  // Get item counts per category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return DEMO_SITES.length;
    return DEMO_SITES.filter((d) => d.category === categoryId).length;
  };

  const activeCategoryObject = categories.find((c) => c.id === activeCategory) || categories[0];

  return (
    <div className="wd-standalone-root">
      <main className="relative min-h-screen bg-[#0C0C0C] text-white selection:bg-[#fd3a25] selection:text-white">
        {/* Background Atmosphere Grid & Glows */}
        <div className="wd-bg-grid" />
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#fd3a25]/6 rounded-full blur-[160px] pointer-events-none -z-0" />
        <div className="absolute top-2/3 left-1/4 w-[500px] h-[500px] bg-[#ff6b57]/4 rounded-full blur-[160px] pointer-events-none -z-0" />

        {/* Global Floating HUD Navigation Bar */}
        <WebDesignNav />

        {/* Page Hero Header */}
        <section className="pt-36 sm:pt-44 pb-12 sm:pb-16 relative z-10">
          <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 text-center flex flex-col items-center">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="wd-badge-mono mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
              <span>[ LIVE EXPERIENCES &amp; CONCEPTS ]</span>
            </motion.div>

            {/* Massive .hero-heading Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="hero-heading font-kanit font-black uppercase leading-none tracking-tight text-center select-none mb-6"
              style={{ fontSize: 'clamp(2.8rem, 10vw, 130px)' }}
            >
              PORTFOLIO
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-neutral-400 text-sm sm:text-base md:text-lg font-kanit font-light max-w-2xl mx-auto leading-relaxed"
            >
              Explore our interactive showcase of high-performance websites, eCommerce platforms, and custom web applications engineered for ambitious businesses.
            </motion.p>
          </div>
        </section>

        {/* Main Content Layout Container */}
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 pb-28 relative z-10">
          
          {/* Mobile Horizontal Filter Scroller */}
          <div className="lg:hidden mb-8 overflow-x-auto no-scrollbar -mx-4 px-4 py-2 flex items-center gap-2">
            {categories.map((tab) => {
              const isActive = activeCategory === tab.id;
              const count = getCategoryCount(tab.id);

              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectCategory(tab.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-kanit font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#fd3a25] text-white shadow-md shadow-[#fd3a25]/30'
                      : 'bg-[#0C0C0C] text-neutral-400 border-2 border-[#D7E2EA]/20'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/20 text-white font-bold' : 'bg-white/10 text-neutral-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 2-Column Desktop Architecture: Sidebar + Content Grid */}
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-10 items-start">
            
            {/* ══════════════════════════════════════════════════════════════════════════
                LEFT SIDEBAR: Industry Filter Navigation & Quick Actions
            ══════════════════════════════════════════════════════════════════════════ */}
            <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 sticky top-28 self-start gap-6">
              
              {/* Sidebar Navigation Box */}
              <div className="p-6 rounded-[32px] bg-[#0C0C0C] border-2 border-[#D7E2EA]/20 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#fd3a25]" />
                    <span className="font-kanit font-bold text-xs tracking-wider text-white uppercase">
                      Industries
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[#ff8a7a]">
                    {DEMO_SITES.length} LIVE
                  </span>
                </div>

                {/* Vertical Category Filter List */}
                <div className="flex flex-col gap-1.5">
                  {categories.map((tab) => {
                    const isActive = activeCategory === tab.id;
                    const count = getCategoryCount(tab.id);

                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleSelectCategory(tab.id)}
                        className={`relative w-full text-left px-4 py-2.5 rounded-2xl text-xs font-kanit font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-between cursor-pointer group ${
                          isActive
                            ? 'text-white font-bold'
                            : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeSidebarBubble"
                            className="absolute inset-0 rounded-2xl bg-[#fd3a25] shadow-lg shadow-[#fd3a25]/30 -z-10"
                            transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                          />
                        )}
                        
                        <span className="truncate">{tab.label}</span>
                        
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full transition-colors ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-white/[0.06] text-neutral-500 group-hover:text-neutral-300'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Pricing Shortcut Widget */}
              <div className="p-6 rounded-[32px] bg-[#120807] border-2 border-[#fd3a25]/35 flex flex-col gap-3 relative overflow-hidden shadow-xl shadow-black/60">
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#fd3a25]/15 rounded-full blur-2xl pointer-events-none" />
                
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff8a7a] font-bold">
                  Custom Architecture
                </span>
                <p className="text-xs font-kanit font-light text-neutral-300 leading-relaxed">
                  Ready for a sub-second website engineered for your specific business?
                </p>
                <Link
                  href="/#pricing"
                  className="inline-flex items-center gap-1.5 text-xs font-kanit font-bold uppercase tracking-wider text-white hover:text-[#ff8a7a] transition-colors mt-1 group"
                >
                  <span>View Pricing Packages</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </aside>

            {/* ══════════════════════════════════════════════════════════════════════════
                RIGHT MAIN SECTION: Top Header Strip + Cards Grid + Conversion Banner
            ══════════════════════════════════════════════════════════════════════════ */}
            <div className="flex-1 min-w-0 flex flex-col">
              
              {/* Header Title & Active Status Strip */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#fd3a25] animate-pulse" />
                    <span className="font-mono text-[11px] uppercase tracking-widest text-[#ff8a7a] font-bold">
                      {activeCategory === 'all' ? 'All Live Flagships' : activeCategoryObject.label}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-kanit uppercase text-white tracking-tight">
                    {activeCategory === 'all' ? (
                      <>
                        Live Work &amp;{' '}
                        <span className="hero-heading">
                          Concept Studio
                        </span>
                      </>
                    ) : (
                      <>
                        {activeCategoryObject.label}{' '}
                        <span className="hero-heading">
                          Showcase
                        </span>
                      </>
                    )}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-neutral-400">
                    Showing <span className="text-white font-bold">{filteredDemos.length}</span> of <span className="text-neutral-500">{DEMO_SITES.length}</span> experiences
                  </span>
                </div>
              </div>

              {/* Demo Cards Grid (Strictly 3 cards per row on desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                <AnimatePresence mode="popLayout">
                  {filteredDemos.map((demo) => {
                    const isExternal = demo.liveUrl.startsWith('http');
                    const CardWrapper = isExternal ? 'a' : Link;
                    const wrapperProps = isExternal
                      ? { href: demo.liveUrl, target: '_blank', rel: 'noopener noreferrer' }
                      : { href: demo.liveUrl };

                    return (
                      <motion.div
                        key={demo.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.35 }}
                      >
                        <CardWrapper
                          {...wrapperProps}
                          className="group relative flex flex-col justify-between rounded-[32px] border-2 border-[#D7E2EA]/30 bg-[#0C0C0C] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85)] hover:border-white transition-all duration-300 hover:-translate-y-1.5 h-full cursor-pointer"
                        >
                          {/* Card Media Viewport */}
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#060608]">
                            <Image
                              src={demo.thumbnailUrl}
                              alt={demo.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            
                            {/* Subtle Bottom Vignette */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-transparent opacity-80" />

                            {/* Center Hover Launch Pill */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                              <div className="px-5 py-2.5 rounded-full bg-[#0C0C0C]/90 border-2 border-white/30 text-white font-kanit font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-2xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <span>{isExternal ? 'Visit Live Website' : 'Explore Experience'}</span>
                                <span className="text-[#ff8a7a]">↗</span>
                              </div>
                            </div>
                          </div>

                          {/* Minimalist Editorial Bottom Bar */}
                          <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-[#0C0C0C] border-t border-white/[0.08] mt-auto">
                            <div className="space-y-0.5 min-w-0">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff8a7a] font-bold block truncate">
                                {demo.categoryLabel}
                              </span>
                              <h3 className="text-base sm:text-lg font-bold font-kanit uppercase text-white group-hover:text-[#ff8a7a] transition-colors truncate">
                                {demo.title}
                              </h3>
                            </div>

                            {/* Action Arrow Icon Button */}
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.06] border border-white/10 group-hover:bg-[#fd3a25] group-hover:border-[#fd3a25] group-hover:text-white text-white flex items-center justify-center shrink-0 transition-all duration-300 shadow-md">
                              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5px]" />
                            </div>
                          </div>
                        </CardWrapper>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Bottom Conversion Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="mt-20 sm:mt-24 p-8 sm:p-12 rounded-[36px] sm:rounded-[48px] bg-[#0C0C0C] border-2 border-[#D7E2EA]/30 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-[0_30px_70px_rgba(0,0,0,0.85)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#fd3a25]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="text-center lg:text-left relative z-10 max-w-xl">
                  <div className="wd-badge-mono mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
                    <span>[ START YOUR PROJECT ]</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black font-kanit uppercase text-white mb-3">
                    Want a high-converting website built for your brand?
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 font-kanit font-light leading-relaxed">
                    Get an ultra-fast, modern web presence tailored with custom Next.js UI, speed optimization, and 1-click WhatsApp lead funnels.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full lg:w-auto flex-shrink-0">
                  <Link
                    href="/#pricing"
                    className="wd-contact-pill-btn px-7 py-3.5 text-xs sm:text-sm tracking-wider w-full sm:w-auto"
                  >
                    <span>View Pricing Packages →</span>
                  </Link>
                  <Link
                    href="/#contact"
                    className="wd-ghost-pill-btn px-6 py-3.5 text-xs sm:text-sm tracking-widest w-full sm:w-auto"
                  >
                    <span>Contact Us</span>
                  </Link>
                </div>
              </motion.div>

            </div>

          </div>

        </div>

        {/* Global Footer */}
        <WebDesignFooter />
      </main>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C0C0C]" />}>
      <PortfolioContent />
    </Suspense>
  );
}
