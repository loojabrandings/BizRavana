'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Check } from 'lucide-react';
import { DEMO_SITES } from '@/data/demo-sites';
import '@/app/(site)/services/web-design/web-design.css';

function DemosContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

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

  // Copy shareable link to clipboard
  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const categories = [
    { id: 'all', label: 'All Demos' },
    { id: 'gym', label: 'Gym & Strength' },
    { id: 'luxury-jewellery', label: 'Haute Jewellery' },
    { id: 'hotel-villa', label: 'Hotels & Villas' },
    { id: 'salon-spa', label: 'Salons & Spas' },
    { id: 'fashion-clothing', label: 'Fashion & Apparel' },
    { id: 'real-estate', label: 'Luxury Real Estate' },
    { id: 'hospital-wellness', label: 'Hospital & Healthcare' },
    { id: 'dental-clinic', label: 'Dental & Aesthetics' },
  ];

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
            className="wd-badge-mono mb-6 inline-flex items-center gap-2"
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

          {/* Category Filter Tabs with Shareable Link Sync */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex items-center justify-center gap-2 flex-wrap"
          >
            {categories.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectCategory(tab.id)}
                  className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#ff6b57] to-[#fd3a25] text-[#060608] font-bold shadow-lg shadow-[#fd3a25]/30 scale-105'
                      : 'bg-white/[0.04] text-neutral-400 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </motion.div>

          {/* Share Filtered View Button */}
          {activeCategory !== 'all' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 flex items-center justify-center"
            >
              <button
                onClick={handleCopyShareLink}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-xs text-neutral-300 hover:text-white hover:border-white/30 transition-all shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Link Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#ff6b57]" />
                    <span>Copy Shareable Link for this Category</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* Demo Cards Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredDemos.map((demo) => {
              return (
                <motion.div
                  key={demo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                >
                  <Link
                    href={demo.liveUrl}
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
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      
                      {/* Subtle Bottom Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-transparent to-transparent opacity-80" />

                      {/* Center Hover Launch Pill */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                        <div className="px-5 py-2.5 rounded-full bg-[#060608]/90 border border-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-2xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <span>Explore Experience</span>
                          <span className="text-[#ff6b57]">↗</span>
                        </div>
                      </div>
                    </div>

                    {/* Minimalist Editorial Bottom Bar */}
                    <div className="p-5 sm:p-6 flex items-center justify-between gap-4 bg-[#0c0d12] border-t border-white/5 mt-auto">
                      <div className="space-y-1 min-w-0">
                        {/* Category Label */}
                        <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff6b57] font-semibold block">
                          {demo.categoryLabel}
                        </span>
                        {/* Title: Brand Name Only */}
                        <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-white transition-colors truncate">
                          {demo.title}
                        </h2>
                      </div>

                      {/* Action Arrow Icon Button */}
                      <div className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/10 group-hover:bg-[#fd3a25] group-hover:border-[#fd3a25] group-hover:text-[#060608] text-white flex items-center justify-center shrink-0 transition-all duration-300 shadow-md">
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                      </div>
                    </div>
                  </Link>
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

export default function DemosHubPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060608]" />}>
      <DemosContent />
    </Suspense>
  );
}
