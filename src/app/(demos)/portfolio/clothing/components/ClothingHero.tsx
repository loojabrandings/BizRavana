'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface HeroSlide {
  id: string;
  image: string;
  cardBg: string;
  textAccent: string;
  num: string;
  title: string;
  tagline: string;
  description: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero1',
    image: '/demos/clothing/hero1.webp',
    cardBg: '#8EA2EA',
    textAccent: '#6E85DF',
    num: '01',
    title: 'Cobalt Silhouette',
    tagline: 'Pure Cotton • Relaxed Fit',
    description: 'Crisp poplin tailored with fluid drape and modern streetwear denim balance.',
  },
  {
    id: 'hero2',
    image: '/demos/clothing/hero2.webp',
    cardBg: '#EAA4BB',
    textAccent: '#D97295',
    num: '02',
    title: 'Blush Velvet',
    tagline: 'Silk Blend • Sculpted Cut',
    description: 'Avant-garde couture drape designed for effortless elegance and subtle motion.',
  },
  {
    id: 'hero3',
    image: '/demos/clothing/hero3.webp',
    cardBg: '#98B58E',
    textAccent: '#7B9E70',
    num: '03',
    title: 'Olive Minimalist',
    tagline: 'Organic Linen • Street Edition',
    description: 'Structured organic outerwear created for versatile day-to-night statement layering.',
  },
];

export function ClothingHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Auto-cycle every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Strong Scroll Parallax Hooks (No mouse interaction)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Layer Parallax Transforms
  const yTypography = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const xLeftText = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const xRightText = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const opacityTypography = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.8, 0.2]);

  const yCard = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const scaleCard = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  // Model anchors to bottom and scales up dramatically upwards from bottom origin
  const scaleModel = useTransform(scrollYProgress, [0, 1], [1, 1.26]);

  const yLeftContent = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const yRightRows = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const activeSlide = HERO_SLIDES[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <section 
      ref={sectionRef}
      className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 select-none font-lexend"
    >
      
      {/* ── 1. Top Typography Layer (Parallax upward & expanding horizontally) ─ */}
      <motion.div 
        style={{ y: yTypography, opacity: opacityTypography }}
        className="relative z-10 w-full flex items-start justify-between px-0 pt-0 pb-4 will-change-transform"
      >
        {/* Left Side: "Define Your STYLE" */}
        <motion.div style={{ x: xLeftText }} className="text-left z-10 will-change-transform">
          <p className="font-lexend text-2xl sm:text-3xl lg:text-4xl font-extrabold italic tracking-tight text-[#120F1D]">
            Define Your
          </p>
          <h1 
            style={{ color: activeSlide.textAccent }}
            className="font-righteous text-5xl sm:text-6xl md:text-7xl lg:text-[6.8rem] tracking-tight leading-[0.88] uppercase transition-colors duration-700"
          >
            STYLE
          </h1>
        </motion.div>

        {/* Right Side: "Own Your WORLD" */}
        <motion.div style={{ x: xRightText }} className="text-left z-10 will-change-transform">
          <p className="font-lexend text-2xl sm:text-3xl lg:text-4xl font-extrabold italic tracking-tight text-[#120F1D]">
            Own Your
          </p>
          <div className="flex items-center gap-3">
            <h2 
              style={{ color: activeSlide.textAccent }}
              className="font-righteous text-5xl sm:text-6xl md:text-7xl lg:text-[6.8rem] tracking-tight leading-[0.88] uppercase transition-colors duration-700"
            >
              WORLD
            </h2>
          </div>
        </motion.div>
      </motion.div>

      {/* ── 2. Dynamic Hero Card Container & Anchored Model ─── */}
      <div className="relative mt-2 sm:mt-4 mb-0">
        
        {/* The Card */}
        <motion.div 
          style={{ 
            backgroundColor: activeSlide.cardBg,
            y: yCard,
            scale: scaleCard,
          }}
          className="relative rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 lg:p-14 pb-6 sm:pb-10 lg:pb-12 text-white overflow-hidden min-h-[360px] sm:min-h-[440px] md:min-h-[540px] lg:min-h-[580px] flex flex-col justify-between transition-colors duration-700 will-change-transform"
        >
          {/* Grid Layout */}
          <div className="relative z-20 grid grid-cols-1 md:grid-cols-12 gap-8 h-full items-center">
            
            {/* ── Left Column: Headline, Copy, CTA (Desktop / Tablet Parallax) ─ */}
            <motion.div 
              style={{ y: yLeftContent }}
              className="hidden md:flex md:col-span-5 lg:col-span-5 flex-col justify-between items-start z-20 font-lexend will-change-transform"
            >
              <div className="space-y-4 sm:space-y-5 max-w-sm">
                {/* ✦ New Collection Pill */}
                <div className="flex items-center gap-1.5 text-white text-xs sm:text-[13px] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-white fill-white" />
                  <span>New Collection</span>
                </div>

                {/* Main Headline */}
                <h3 className="font-righteous sm:text-3xl md:text-[2.8rem] lg:text-[3.4rem] xl:text-[3.8rem] font-extrabold leading-[1.08] text-white tracking-tight">
                  Where<br />Comfort<br />Meets<br />Confidence
                </h3>

                {/* Subtitle */}
                <p className="font-lexend text-white/90 text-sm sm:text-base font-normal leading-relaxed max-w-xs">
                  Elevate your everyday look with pieces that speak you.
                </p>

                {/* Explore Now Button */}
                <div className="pt-2">
                  <a
                    href="#shop"
                    className="font-lexend inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#120F1D] text-white text-sm font-bold shadow-xl hover:bg-black transition-colors"
                  >
                    <span>Explore Now</span>
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </span>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* ── Center Gap for Model Silhouette ─────── */}
            <div className="hidden md:block md:col-span-2 lg:col-span-2 pointer-events-none" />

            {/* ── Right Column: 3 Interactive Text Rows (Desktop Only Parallax) ─ */}
            <motion.div 
              style={{ y: yRightRows }}
              className="hidden md:flex md:col-span-5 lg:col-span-5 flex-col items-end text-right justify-center gap-5 sm:gap-6 z-20 font-lexend will-change-transform"
            >
              {HERO_SLIDES.map((slide, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <div
                    key={slide.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`group cursor-pointer flex flex-col items-end text-right transition-all duration-500 w-full max-w-sm ${
                      isActive ? 'opacity-100' : 'opacity-40 hover:opacity-75'
                    }`}
                  >
                    {/* Row Header: Number & Title with Right-Zoom Effect */}
                    <div className="flex items-center justify-end gap-3 w-full">
                      <span className={`font-righteous text-xs sm:text-sm tracking-wider ${isActive ? 'text-white' : 'text-white/80'}`}>
                        {slide.num}
                      </span>
                      <h4
                        className={`font-righteous tracking-tight transition-all duration-500 transform uppercase ${
                          isActive
                            ? 'text-2xl sm:text-3xl lg:text-4xl text-white translate-x-0 scale-100'
                            : 'text-lg sm:text-xl lg:text-2xl text-white/80 translate-x-3 scale-95'
                        }`}
                      >
                        {slide.title}
                      </h4>
                    </div>

                    {/* Expandable Description (Only visible when active) */}
                    <div
                      className={`transition-all duration-500 overflow-hidden flex flex-col items-end ${
                        isActive
                          ? 'max-h-32 opacity-100 mt-2'
                          : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                      }`}
                    >
                      <span className="text-xs font-semibold text-white/95 uppercase tracking-wider block mb-1">
                        {slide.tagline}
                      </span>
                      <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal max-w-[280px]">
                        {slide.description}
                      </p>
                    </div>

                    {/* Subtle underline divider */}
                    <div className={`h-[1px] mt-3 transition-all duration-500 ${isActive ? 'w-full bg-white/40' : 'w-16 bg-white/15'}`} />
                  </div>
                );
              })}
            </motion.div>

          </div>

          {/* ── Subtle Navigation at Bottom Right Corner ──────── */}
          <div className="absolute right-4 sm:right-8 lg:right-10 bottom-4 sm:bottom-6 lg:bottom-8 z-30 flex items-center gap-2 sm:gap-3">
            {/* Prev Button */}
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

        </motion.div>

        {/* ── Center Fashion Model (Anchored to Bottom & Scaling Upwards on Scroll) ── */}
        <motion.div 
          style={{ 
            scale: scaleModel,
            transformOrigin: 'bottom center',
          }}
          className="absolute left-1/2 -translate-x-1/2 -top-[125px] sm:-top-[145px] md:-top-[160px] lg:-top-[170px] bottom-0 z-30 pointer-events-none flex items-end justify-center w-[280px] sm:w-[380px] md:w-[480px] lg:w-[520px] will-change-transform"
        >
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 flex items-end justify-center transition-opacity duration-700 ${
                  isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <Image
                  src={slide.image}
                  alt={`Luxe Model - ${slide.title}`}
                  width={750}
                  height={1050}
                  priority={index === 0}
                  className="w-full h-full object-contain object-bottom block mx-auto drop-shadow-[0_20px_35px_rgba(40,15,90,0.18)]"
                />
              </div>
            );
          })}
        </motion.div>

      </div>

      {/* ── 3. Mobile Only: Card Text Content Rendered Below the Card ── */}
      <div className="md:hidden mt-6 flex flex-col items-start gap-4 px-2 font-lexend">
        {/* ✦ New Collection Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2EEFB] text-[#8362F4] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#8362F4] fill-[#8362F4]" />
          <span>New Collection</span>
        </div>

        {/* Headline */}
        <h3 className="font-righteous text-3xl sm:text-4xl font-extrabold leading-tight text-[#120F1D] tracking-tight">
          Where Comfort<br />Meets Confidence
        </h3>

        {/* Subtitle */}
        <p className="font-lexend text-neutral-600 text-sm sm:text-base font-normal leading-relaxed max-w-sm">
          Elevate your everyday look with pieces that speak you.
        </p>

        {/* Explore Now Button */}
        <div className="w-full pt-2">
          <a
            href="#shop"
            className="font-lexend inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#120F1D] text-white text-sm font-bold shadow-lg hover:bg-black transition-colors"
          >
            <span>Explore Now</span>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </span>
          </a>
        </div>
      </div>

    </section>
  );
}
