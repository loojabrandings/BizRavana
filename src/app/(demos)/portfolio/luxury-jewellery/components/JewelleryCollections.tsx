'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { JewelleryTiltCard } from './JewelleryTiltCard';

interface CollectionItem {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  category: string;
}

const COLLECTIONS: CollectionItem[] = [
  {
    id: 'rings',
    name: 'RINGS',
    subtitle: 'Timeless Elegance',
    image: '/demos/luxury-jewellery/card-1.jpeg',
    category: 'Solitaires & Bands',
  },
  {
    id: 'necklaces',
    name: 'NECKLACES',
    subtitle: 'Made to Dazzle',
    image: '/demos/luxury-jewellery/card-2.jpeg',
    category: 'Pendants & Chokers',
  },
  {
    id: 'bracelets',
    name: 'BRACELETS',
    subtitle: 'Grace in Every Detail',
    image: '/demos/luxury-jewellery/card-3.jpeg',
    category: 'Bangles & Cuffs',
  },
  {
    id: 'earrings',
    name: 'EARRINGS',
    subtitle: 'Shine from Within',
    image: '/demos/luxury-jewellery/card-4.jpeg',
    category: 'Drops & Studs',
  },
];

const VALUE_PROPS = [
  {
    title: 'LIFETIME WARRANTY',
    icon: (
      <svg className="w-5 h-5 text-[#C6A05F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'EASY RETURNS',
    icon: (
      <svg className="w-5 h-5 text-[#C6A05F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: 'PREMIUM PACKAGING',
    icon: (
      <svg className="w-5 h-5 text-[#C6A05F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: '24/7 SUPPORT',
    icon: (
      <svg className="w-5 h-5 text-[#C6A05F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export function JewelleryCollections() {
  return (
    <section id="collection" className="relative w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#FAF6F0] text-[#0D2D25] overflow-hidden">
      
      {/* ── Ambient Botanical Leaf Shadow Background Accents ─────── */}
      <div className="absolute -top-12 -left-12 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0D2D25]/10 via-transparent to-transparent blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C6A05F]/15 via-transparent to-transparent blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
        
        {/* ── Left Column: Editorial Brand Hook & CTA with Masked Reveal ── */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex flex-col justify-between space-y-10 lg:space-y-12"
        >
          
          <div className="space-y-6">
            {/* Top Subtitle with delicate gold bars */}
            <div className="flex items-center gap-3">
              <motion.span 
                initial={{ width: 0 }}
                whileInView={{ width: 32 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="h-[1.5px] bg-[#C6A05F]" 
              />
              <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-[#C6A05F] uppercase font-sans">
                Handcrafted With Love
              </span>
            </div>

            {/* Main Headline with Masked Pop Reveal */}
            <div className="space-y-1 overflow-hidden">
              <motion.h2 
                initial={{ y: 80 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="font-custom-brand text-5xl sm:text-6xl md:text-7xl lg:text-[5.6rem] leading-[0.88] tracking-tight text-[#0D2D25] lowercase font-normal select-none"
              >
                designed
              </motion.h2>
              <motion.div 
                initial={{ y: 80 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-baseline gap-3"
              >
                <span className="font-custom-brand text-5xl sm:text-6xl md:text-7xl lg:text-[5.6rem] leading-[0.88] tracking-tight text-[#0D2D25] lowercase font-normal select-none">
                  to
                </span>
                <span className="font-script-lux text-6xl sm:text-7xl md:text-8xl text-gold-script tracking-normal capitalize select-none transform translate-y-1">
                  Shine
                </span>
                <motion.span 
                  animate={{ scale: [1, 1.35, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-[#C6A05F] text-2xl sm:text-3xl select-none inline-block cursor-pointer"
                >
                  ♡
                </motion.span>
              </motion.div>
            </div>

            {/* Description Text */}
            <p className="text-[#0D2D25]/75 text-base sm:text-lg leading-relaxed font-light max-w-md">
              Discover our curated collections for every special moment. Handcrafted with ethical diamonds and pure 18K solid gold.
            </p>

            {/* Shop Now Primary Button with Hover Ripple */}
            <div className="pt-2">
              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.98 }}
                href="#collection"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#0D2D25] text-[#F6EFE7] hover:bg-[#123e33] transition-all duration-300 font-semibold tracking-wider text-xs sm:text-sm uppercase shadow-lg hover:shadow-2xl group"
              >
                <span>Shop Now</span>
                <svg
                  className="w-4 h-4 text-[#C6A05F] transform transition-transform duration-300 group-hover:translate-x-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.a>
            </div>
          </div>

          {/* Bottom Value Props 4-Column Row with Hover Spin */}
          <div className="pt-6 border-t border-[#0D2D25]/10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {VALUE_PROPS.map((item, idx) => (
              <motion.div 
                key={item.title} 
                initial={{ opacity: 0, y: 25, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.08 * idx, ease: 'easeOut' }}
                whileHover={{ y: -4 }}
                className="flex flex-col items-start gap-2.5 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0D2D25]/5 border border-[#0D2D25]/10 flex items-center justify-center transition-all duration-300 group-hover:bg-[#0D2D25] group-hover:text-[#F6EFE7] group-hover:rotate-6">
                  {item.icon}
                </div>
                <span className="text-[11px] font-bold tracking-wider text-[#0D2D25] uppercase leading-tight group-hover:text-[#C6A05F] transition-colors">
                  {item.title}
                </span>
              </motion.div>
            ))}
          </div>

        </motion.div>

        {/* ── Right Column: 2x2 Curated Collection Cards Grid with Real-Time 3D Tilt ─────── */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="lg:col-span-7 flex flex-col space-y-6"
        >
          
          {/* Header Divider Label */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#C6A05F]/50 to-transparent" />
            <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-[#C6A05F] uppercase font-sans">
              Explore Our Collections
            </span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#C6A05F]/50 to-transparent" />
          </div>

          {/* 2x2 Grid with 3D Mouse Tilt Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {COLLECTIONS.map((col, idx) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 60, scale: 0.88 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, delay: 0.12 * idx, ease: [0.16, 1, 0.3, 1] }}
              >
                <JewelleryTiltCard maxTilt={14} scaleHover={1.04} className="w-full aspect-square rounded-3xl overflow-hidden shadow-[0_12px_36px_rgba(13,45,37,0.14)] border border-[#C6A05F]/25 cursor-pointer">
                  {/* Background Image */}
                  <Image
                    src={col.image}
                    alt={col.name}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 450px"
                    className="object-cover object-center transition-transform duration-1000 ease-out hover:scale-115"
                  />

                  {/* Dark Vignette Overlay for Crisp Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071713]/95 via-[#071713]/30 to-transparent pointer-events-none" />

                  {/* Subtle Gold Hover Border Glow */}
                  <div className="absolute inset-0 rounded-3xl border border-transparent hover:border-[#C6A05F]/80 transition-colors duration-500 pointer-events-none" />

                  {/* Card Content (Bottom Centered) */}
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 flex flex-col items-center text-center space-y-1.5 z-10 pointer-events-none">
                    <h3 className="font-italiana text-2xl sm:text-3xl text-[#F6EFE7] tracking-wider uppercase font-normal hover:text-[#C6A05F] transition-colors duration-300">
                      {col.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#F6EFE7]/80 font-light font-sans tracking-wide">
                      {col.subtitle}
                    </p>
                  </div>
                </JewelleryTiltCard>
              </motion.div>
            ))}
          </div>

        </motion.div>

      </div>

    </section>
  );
}
