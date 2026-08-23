'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { JewelleryParticles } from './JewelleryParticles';

interface HeroItem {
  id: string;
  heroImage: string;
  cardImage: string;
  title: string;
  description: string;
}

const HERO_ITEMS: HeroItem[] = [
  {
    id: 'card-1',
    heroImage: '/demos/luxury-jewellery/hero-1.jpeg',
    cardImage: '/demos/luxury-jewellery/card-1.jpeg',
    title: 'Câlin Jewelry',
    description:
      'These jewelry will be an unforgettable gift that will preserve wonderful moments of high feelings for many years.',
  },
  {
    id: 'card-2',
    heroImage: '/demos/luxury-jewellery/hero-2.jpeg',
    cardImage: '/demos/luxury-jewellery/card-2.jpeg',
    title: 'Aura Émeraude',
    description:
      'Hand-sculpted organic silhouette accented with fine bespoke gold craftsmanship, crafted for timeless allure.',
  },
  {
    id: 'card-3',
    heroImage: '/demos/luxury-jewellery/hero-3.jpeg',
    cardImage: '/demos/luxury-jewellery/card-3.jpeg',
    title: 'Lumière Dorée',
    description:
      'An artistic homage to architectural geometry, radiating delicate warmth with brushed champagne finishes.',
  },
  {
    id: 'card-4',
    heroImage: '/demos/luxury-jewellery/hero-4.jpeg',
    cardImage: '/demos/luxury-jewellery/card-4.jpeg',
    title: 'Symphonie Noir',
    description:
      'A dramatic collision of nocturnal contrast and haute joaillerie refinement, designed to transcend generations.',
  },
];

export function JewelleryHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Scroll parallax transformations (Scroll-based only, no mouse parallax)
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const carouselY = useTransform(scrollYProgress, [0, 1], [0, -70]);

  // Auto-change active card & hero background every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_ITEMS.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const activeItem = HERO_ITEMS[activeIndex];

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#071713] text-[#F6EFE7]"
    >
      {/* ── Ambient Floating Diamond Sparkles & Dust ──────────────── */}
      <JewelleryParticles count={25} />

      {/* ── Dynamic Fullscreen Hero Background Crossfade with Scroll Parallax ── */}
      <motion.div 
        style={{ y: bgY, scale: bgScale }} 
        className="absolute inset-0 z-0 select-none origin-bottom"
      >
        {HERO_ITEMS.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
              }`}
            >
              <Image
                src={item.heroImage}
                alt={`Câlin High Jewellery - ${item.title}`}
                fill
                priority={index === 0}
                unoptimized
                sizes="100vw"
                className="object-cover object-[80%_100%] sm:object-bottom transform scale-100 transition-transform duration-1000 ease-out"
              />
              {/* Subtle Mobile Dark Vignette for Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#071713]/70 via-transparent to-[#071713]/85 sm:hidden" />
            </div>
          );
        })}
      </motion.div>

      {/* ── Main Foreground Content Area ─────────────────────────── */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-between pt-24 sm:pt-32 lg:pt-36 pb-8 sm:pb-12 text-center sm:text-left">

        {/* Top Section: Editorial Display Title with Masked Reveal & High-Impact Scroll ── */}
        <motion.div 
          style={{ y: titleY, opacity: titleOpacity }}
          className="max-w-4xl select-none pt-2 sm:pt-4 mx-auto sm:mx-0 overflow-hidden space-y-5 sm:space-y-6"
        >
          <motion.h1 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="hero-editorial-title text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[11.2rem] leading-[0.88] lowercase font-normal tracking-normal text-[#F6EFE7] drop-shadow-2xl"
          >
            Timeless <br />
            jewelry
          </motion.h1>

          {/* Explore Collection CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="pt-1 flex justify-center sm:justify-start"
          >
            <a
              href="#collection"
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#FAF6F0]/15 hover:bg-[#FAF6F0]/25 backdrop-blur-md border border-[#F6EFE7]/25 text-[#F6EFE7] hover:border-[#C6A05F]/60 text-xs uppercase tracking-widest font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <span>Explore Collection</span>
              <svg
                className="w-3.5 h-3.5 text-[#C6A05F] transform transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        </motion.div>

        {/* Bottom Container: Carousel & Dynamic Story Anchored at Bottom on Mobile */}
        <motion.div 
          style={{ y: carouselY }}
          className="mt-auto sm:mt-0 space-y-6 sm:space-y-8 pt-6"
        >
          
          {/* Middle/Bottom Section: Auto-cycling 1:1 Carousel Cards with 3D Float */}
          <div className="w-full flex justify-center sm:justify-start">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="flex items-center justify-center sm:justify-start gap-3.5 sm:gap-6 overflow-x-auto no-scrollbar py-2 sm:py-4 px-1 max-w-full"
            >
              {HERO_ITEMS.map((item, index) => {
                const isActive = activeIndex === index;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveIndex(index)}
                    whileHover={{ scale: isActive ? 1.22 : 1.08, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isActive ? { y: [0, -6, 0] } : {}}
                    transition={isActive ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : {}}
                    aria-label={`Select jewellery piece: ${item.title}`}
                    className={`group relative flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 aspect-square rounded-2xl overflow-hidden transition-all duration-700 ease-out cursor-pointer focus:outline-none ${
                      isActive
                        ? 'scale-115 sm:scale-120 shadow-[0_24px_48px_rgba(0,0,0,0.95)] z-20 opacity-100'
                        : 'scale-90 opacity-50 hover:opacity-85'
                    }`}
                  >
                    <Image
                      src={item.cardImage}
                      alt={item.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 96px, 128px"
                      className={`object-cover object-center transition-transform duration-700 ease-out ${
                        isActive ? 'scale-110' : 'scale-100 group-hover:scale-110'
                      }`}
                    />
                    {/* Active Subtle Bottom Shadow */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          {/* Bottom Bar: Dynamic Story on Left/Center, Scroll Indicator */}
          <div className="w-full flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 pt-2">

            {/* Bottom Story Text with Kinetic Entrance */}
            <motion.div 
              key={activeItem.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="max-w-md space-y-1.5 text-center sm:text-left mx-auto sm:mx-0"
            >
              <h2 className="font-italiana text-2xl sm:text-3xl text-[#F6EFE7] tracking-wide font-normal">
                {activeItem.title}
              </h2>
              <p className="text-[#F6EFE7]/85 text-xs sm:text-sm leading-relaxed font-light font-sans max-w-sm mx-auto sm:mx-0">
                {activeItem.description}
              </p>
            </motion.div>

            {/* Bottom Center Scroll Indicator with Pulsing Ring */}
            <div className="flex flex-col items-center mx-auto sm:mx-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:bottom-10 gap-2 text-center group cursor-pointer pt-2 sm:pt-0">
              <div className="scroll-line-indicator rounded-full" />
              <svg
                className="w-4 h-4 text-[#C6A05F] animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Right Side Spacer */}
            <div className="hidden lg:block w-48" />

          </div>

        </motion.div>

      </div>

    </section>
  );
}
