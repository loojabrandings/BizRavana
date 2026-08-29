'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const CATEGORIES_LEFT = [
  {
    num: '01',
    name: 'FROCKS',
    count: '18 Styles',
    tagline: 'Flowing & Structured Silhouettes',
    href: '#frocks',
    image: '/demos/clothing/categories/frock.webp',
  },
  {
    num: '02',
    name: 'JEANS',
    count: '24 Fits',
    tagline: 'Raw Denim & Wide-Leg Cuts',
    href: '#jeans',
    image: '/demos/clothing/categories/jeans.webp',
  },
  {
    num: '03',
    name: 'TOPS',
    count: '32 Items',
    tagline: 'Minimal Cutouts & Modern Basics',
    href: '#tops',
    image: '/demos/clothing/categories/tops.webp',
  },
  {
    num: '04',
    name: 'SKIRTS',
    count: '16 Styles',
    tagline: 'Pleated, Denim & Asymmetrical',
    href: '#skirts',
    image: '/demos/clothing/categories/skirt.webp',
  },
  {
    num: '05',
    name: 'CO-ORDS',
    count: '12 Sets',
    tagline: 'Tailored Two-Piece Statement Fits',
    href: '#co-ords',
    image: '/demos/clothing/categories/coords.webp',
  },
];

const CATEGORIES_RIGHT = [
  {
    num: '06',
    name: 'JACKETS',
    count: '14 Drops',
    tagline: 'Technical & Heavyweight Outerwear',
    href: '#jackets',
    image: '/demos/clothing/categories/jacket.webp',
  },
  {
    num: '07',
    name: 'HOODIES',
    count: '26 Styles',
    tagline: 'Oversized Fleece & Graffiti Edition',
    href: '#hoodies',
    image: '/demos/clothing/categories/hoodie.webp',
  },
  {
    num: '08',
    name: 'ACCESSORIES',
    count: '40 Items',
    tagline: 'Beanies, Belts & Mini Bags',
    href: '#accessories',
    image: '/demos/clothing/categories/accessories.webp',
  },
  {
    num: '09',
    name: 'FOOTWEAR',
    count: '15 Pairs',
    tagline: 'Chunky Boots & Minimalist Mules',
    href: '#footwear',
    image: '/demos/clothing/categories/foot.webp',
  },
  {
    num: '10',
    name: 'EYEWEAR',
    count: '10 Models',
    tagline: 'Futuristic Shields & Chrome Frames',
    href: '#eyewear',
    image: '/demos/clothing/categories/eyewear.webp',
  },
];

export function ClothingCategories() {
  const [activeImage, setActiveImage] = useState<string>('/demos/clothing/categories/frock.webp');
  const [activeName, setActiveName] = useState<string>('FROCKS');
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll Parallax Hooks (No mouse interaction)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Layer Parallax Transforms
  const yHeader = useTransform(scrollYProgress, [0, 0.5, 1], [40, 0, -40]);
  const yLeftCol = useTransform(scrollYProgress, [0, 1], [60, -50]);
  const yRightCol = useTransform(scrollYProgress, [0, 1], [100, -30]);
  const yModel = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const scaleModel = useTransform(scrollYProgress, [0, 0.5, 1], [0.96, 1.04, 0.98]);

  return (
    <section 
      ref={sectionRef}
      id="collections" 
      className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-4 sm:pb-6 select-none font-lexend bg-white text-[#120F1D] overflow-hidden"
    >
      
      {/* ── Section Title (Delayed Animated Entry & Parallax) ── */}
      <motion.div 
        style={{ y: yHeader }}
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-8 sm:mb-10 will-change-transform"
      >
        <motion.span 
          initial={{ opacity: 0, letterSpacing: '0.12em' }}
          whileInView={{ opacity: 1, letterSpacing: '0.28em' }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="font-lexend text-xs uppercase text-[#8362F4] font-bold block mb-2"
        >
          Curated Wardrobe
        </motion.span>
        <h2 className="font-righteous text-3xl sm:text-5xl md:text-6xl text-[#120F1D] uppercase tracking-tight">
          Shop By Category
        </h2>
      </motion.div>

      {/* ── Category Layout: 2 Columns on Mobile, 3 Columns with Hover-Interactive Image in Center ── */}
      <div className="relative grid grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
        
        {/* ── Column 1 (Left 5 Categories) ── */}
        <motion.div 
          style={{ y: yLeftCol }}
          className="col-span-1 lg:col-span-4 flex flex-col justify-around gap-4 sm:gap-6 lg:gap-8 text-left z-10 will-change-transform"
        >
          {CATEGORIES_LEFT.map((cat, idx) => {
            const isHovered = activeName === cat.name;
            return (
              <motion.div
                key={cat.num}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, delay: 0.45 + idx * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <Link
                  href={cat.href}
                  onMouseEnter={() => {
                    setActiveImage(cat.image);
                    setActiveName(cat.name);
                  }}
                  className={`group flex flex-col py-2 sm:py-2.5 border-b transition-all duration-300 ${
                    isHovered ? 'border-[#8362F4]' : 'border-neutral-200/80 hover:border-[#8362F4]'
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2 sm:gap-3 transition-transform duration-300 group-hover:translate-x-1.5">
                      <span className={`font-righteous text-xs sm:text-sm transition-colors duration-300 ${
                        isHovered ? 'text-[#8362F4]' : 'text-neutral-400 group-hover:text-[#8362F4]'
                      }`}>
                        {cat.num}
                      </span>
                      <h3 className={`font-righteous text-base sm:text-2xl lg:text-3xl uppercase tracking-tight transition-colors duration-300 ${
                        isHovered ? 'text-[#8362F4]' : 'text-[#120F1D] group-hover:text-[#8362F4]'
                      }`}>
                        {cat.name}
                      </h3>
                    </div>
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center transition-all duration-300 transform ${
                      isHovered
                        ? 'border-[#8362F4] bg-[#8362F4] text-white rotate-45 scale-110'
                        : 'border-neutral-300 text-[#120F1D] group-hover:border-[#8362F4] group-hover:bg-[#8362F4] group-hover:text-white group-hover:rotate-45 group-hover:scale-110'
                    }`}>
                      <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-0.5 sm:mt-1 text-[11px] sm:text-[13px] text-neutral-500 font-medium font-lexend">
                    <span className="hidden sm:inline transition-colors duration-300 group-hover:text-neutral-700">{cat.tagline}</span>
                    <span className={`text-[10px] sm:text-[10.5px] uppercase tracking-wider font-semibold font-lexend transition-colors duration-300 ${
                      isHovered ? 'text-[#8362F4]' : 'text-neutral-400 group-hover:text-[#8362F4]'
                    }`}>
                      {cat.count}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Center Hover-Interactive Category Showcase Image (Bottom Fadeout + Parallax Floating) ─ */}
        <motion.div 
          style={{ y: yModel, scale: scaleModel }}
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.95, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex lg:col-span-4 items-center justify-center z-20 py-6 lg:py-0 will-change-transform"
        >
          <div 
            style={{
              maskImage: 'linear-gradient(to bottom, black 72%, rgba(0,0,0,0.85) 82%, rgba(0,0,0,0.4) 92%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 72%, rgba(0,0,0,0.85) 82%, rgba(0,0,0,0.4) 92%, transparent 100%)',
            }}
            className="relative w-[300px] sm:w-[360px] lg:w-[400px] h-[460px] sm:h-[520px] lg:h-[560px] flex items-center justify-center overflow-hidden"
          >
            {/* Smooth Animated Image Switcher on Category Hover */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.04, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <Image
                  src={activeImage}
                  alt={activeName}
                  width={600}
                  height={800}
                  priority
                  className="w-auto h-full max-h-[540px] object-contain object-bottom block mx-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.12)] transition-transform duration-500"
                />
              </motion.div>
            </AnimatePresence>

          </div>
        </motion.div>

        {/* ── Column 2 (Right 5 Categories) ── */}
        <motion.div 
          style={{ y: yRightCol }}
          className="col-span-1 lg:col-span-4 flex flex-col justify-around gap-4 sm:gap-6 lg:gap-8 text-left z-10 will-change-transform"
        >
          {CATEGORIES_RIGHT.map((cat, idx) => {
            const isHovered = activeName === cat.name;
            return (
              <motion.div
                key={cat.num}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, delay: 0.45 + idx * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <Link
                  href={cat.href}
                  onMouseEnter={() => {
                    setActiveImage(cat.image);
                    setActiveName(cat.name);
                  }}
                  className={`group flex flex-col py-2 sm:py-2.5 border-b transition-all duration-300 ${
                    isHovered ? 'border-[#8362F4]' : 'border-neutral-200/80 hover:border-[#8362F4]'
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2 sm:gap-3 transition-transform duration-300 group-hover:translate-x-1.5">
                      <span className={`font-righteous text-xs sm:text-sm transition-colors duration-300 ${
                        isHovered ? 'text-[#8362F4]' : 'text-neutral-400 group-hover:text-[#8362F4]'
                      }`}>
                        {cat.num}
                      </span>
                      <h3 className={`font-righteous text-base sm:text-2xl lg:text-3xl uppercase tracking-tight transition-colors duration-300 ${
                        isHovered ? 'text-[#8362F4]' : 'text-[#120F1D] group-hover:text-[#8362F4]'
                      }`}>
                        {cat.name}
                      </h3>
                    </div>
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center transition-all duration-300 transform ${
                      isHovered
                        ? 'border-[#8362F4] bg-[#8362F4] text-white rotate-45 scale-110'
                        : 'border-neutral-300 text-[#120F1D] group-hover:border-[#8362F4] group-hover:bg-[#8362F4] group-hover:text-white group-hover:rotate-45 group-hover:scale-110'
                    }`}>
                      <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-0.5 sm:mt-1 text-[11px] sm:text-[13px] text-neutral-500 font-medium font-lexend">
                    <span className="hidden sm:inline transition-colors duration-300 group-hover:text-neutral-700">{cat.tagline}</span>
                    <span className={`text-[10px] sm:text-[10.5px] uppercase tracking-wider font-semibold font-lexend transition-colors duration-300 ${
                      isHovered ? 'text-[#8362F4]' : 'text-neutral-400 group-hover:text-[#8362F4]'
                    }`}>
                      {cat.count}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

      </div>

    </section>
  );
}
