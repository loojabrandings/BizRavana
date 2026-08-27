'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Flame } from 'lucide-react';
import WebDesignNav from '@/app/(site)/services/web-design/components/WebDesignNav';
import { DEMO_SITES } from '@/data/demo-sites';
import '@/app/(site)/services/web-design/web-design.css';

function PortfolioContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Industry categories
  const categories = useMemo(() => [
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
  ], []);

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
    <main className="relative min-h-screen bg-[#060608] text-white overflow-x-hidden font-sans selection:bg-[#fd3a25] selection:text-white">
      {/* Background Atmosphere Grid & Glows from Web Design System */}
      <div className="wd-bg-grid" />
      <div className="wd-radial-glow wd-radial-glow-hero" />
      <div className="wd-radial-glow wd-radial-glow-center" />

      {/* Web Design Navigation Bar */}
      <WebDesignNav />

      {/* Main Page Layout Container */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 pt-32 sm:pt-36 pb-28 relative z-10">
        
        {/* Mobile Horizontal Filter Scroller */}
        <div className="lg:hidden mb-8 overflow-x-auto no-scrollbar -mx-4 px-4 py-2 flex items-center gap-2">
          {categories.map((tab) => {
            const isActive = activeCategory === tab.id;
            const count = getCategoryCount(tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => handleSelectCategory(tab.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff6b57] to-[#fd3a25] text-white font-bold shadow-md shadow-[#fd3a25]/30'
                    : 'bg-white/[0.04] text-neutral-400 border border-white/10'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-white/20 text-white font-bold' : 'bg-white/10 text-neutral-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2-Column Desktop Architecture: Sidebar + Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
          
          {/* ══════════════════════════════════════════════════════════════════════════
              LEFT SIDEBAR: Industry Filter Navigation & Quick Actions
          ══════════════════════════════════════════════════════════════════════════ */}
          <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 sticky top-28 self-start gap-6">
            
            {/* Sidebar Navigation Box */}
            <div className="p-5 rounded-3xl bg-[#0c0d12]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#fd3a25]" />
                  <span className="font-mono text-xs font-bold tracking-wider text-neutral-300 uppercase">
                    Industries
                  </span>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-neutral-400">
                  {DEMO_SITES.length} Live
                </span>
              </div>

              {/* Vertical Category Filter List (Larger Font, White Active State Text) */}
              <div className="flex flex-col gap-1.5">
                {categories.map((tab) => {
                  const isActive = activeCategory === tab.id;
                  const count = getCategoryCount(tab.id);

                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleSelectCategory(tab.id)}
                      className={`relative w-full text-left px-4 py-3 rounded-xl text-sm sm:text-[15px] font-semibold tracking-wide transition-all duration-300 flex items-center justify-between cursor-pointer group ${
                        isActive
                          ? 'text-white font-bold shadow-md shadow-[#fd3a25]/35'
                          : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarBubble"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#ff6b57] to-[#fd3a25] -z-10"
                          transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                        />
                      )}
                      
                      <span className="truncate">{tab.label}</span>
                      
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-md transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white font-bold'
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
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#141620] via-[#0c0d12] to-[#12141c] border border-[#fd3a25]/20 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#fd3a25]/10 rounded-full blur-2xl pointer-events-none" />
              
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#ff6b57] font-semibold">
                Custom Web Design
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Ready for a high-converting website engineered for your brand?
              </p>
              <Link
                href="/services/web-design#pricing"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#ff6b57] transition-colors mt-1 group"
              >
                <span>View Design Packages</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </aside>

          {/* ══════════════════════════════════════════════════════════════════════════
              RIGHT MAIN SECTION: Top Header Strip + Cards Grid + Conversion Banner
          ══════════════════════════════════════════════════════════════════════════ */}
          <div className="flex-1 min-w-0 flex flex-col">
            
            {/* Header Title & Active Status Strip */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#fd3a25] animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#ff6b57] font-semibold">
                    {activeCategory === 'all' ? 'All Live Projects' : activeCategoryObject.label}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {activeCategory === 'all' ? (
                    <>
                      Client Work &{' '}
                      <span className="bg-gradient-to-r from-white via-[#ff6b57] to-[#fd3a25] bg-clip-text text-transparent">
                        Concept Showcase
                      </span>
                    </>
                  ) : (
                    <>
                      {activeCategoryObject.label}{' '}
                      <span className="bg-gradient-to-r from-white via-[#ff6b57] to-[#fd3a25] bg-clip-text text-transparent">
                        Websites
                      </span>
                    </>
                  )}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-neutral-400">
                  Showing <span className="text-white font-bold">{filteredDemos.length}</span> of <span className="text-neutral-500">{DEMO_SITES.length}</span> experiences
                </span>
              </div>
            </div>

            {/* Demo Cards Bento Grid (WITH SLIGHTLY SMALLER SLEEK TITLE TYPOGRAPHY) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
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
                        className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#0c0d12]/90 backdrop-blur-xl overflow-hidden shadow-2xl hover:border-white/25 transition-all duration-500 hover:-translate-y-1.5 h-full"
                      >
                        {/* Ambient Glow on Hover */}
                        <div
                          className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10 blur-xl"
                          style={{
                            background: `radial-gradient(circle at 50% 50%, ${demo.accentColor}25, transparent 70%)`,
                          }}
                        />

                        {/* Card Media Viewport */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#060608]">
                          <Image
                            src={demo.thumbnailUrl}
                            alt={demo.title}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          
                          {/* Subtle Bottom Vignette */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-transparent to-transparent opacity-80" />

                          {/* Center Hover Launch Pill */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                            <div className="px-5 py-2.5 rounded-full bg-[#060608]/90 border border-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-2xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                              <span>{isExternal ? 'Visit Live Website' : 'Explore Experience'}</span>
                              <span className="text-[#ff6b57]">↗</span>
                            </div>
                          </div>
                        </div>

                        {/* Minimalist Editorial Bottom Bar */}
                        <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-[#0c0d12] border-t border-white/5 mt-auto">
                          <div className="space-y-0.5 min-w-0">
                            {/* Category Label */}
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff6b57] font-semibold block">
                              {demo.categoryLabel}
                            </span>
                            {/* Title: Brand Name (Smaller, Sleek Typography) */}
                            <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-white transition-colors truncate">
                              {demo.title}
                            </h2>
                          </div>

                          {/* Action Arrow Icon Button */}
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.06] border border-white/10 group-hover:bg-[#fd3a25] group-hover:border-[#fd3a25] group-hover:text-white text-white flex items-center justify-center shrink-0 transition-all duration-300 shadow-md">
                            <svg
                              className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                          </div>
                        </div>
                      </CardWrapper>
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
              className="mt-20 sm:mt-24 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#12141c] via-[#0c0d12] to-[#12141c] border border-[#fd3a25]/30 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden"
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

        </div>

      </div>
    </main>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060608]" />}>
      <PortfolioContent />
    </Suspense>
  );
}
