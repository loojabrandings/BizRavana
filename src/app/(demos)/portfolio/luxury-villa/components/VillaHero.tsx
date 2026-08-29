'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

const HERO_IMAGES = [
  {
    src: '/demos/villa/hero-1.jpeg',
    alt: 'Misty Peaks A-Frame Luxury Villa nestled in emerald tea hills',
  },
  {
    src: '/demos/villa/hero-2.jpeg',
    alt: 'Misty morning sunrise over tea estate and private wooden deck',
  },
  {
    src: '/demos/villa/hero-3.jpeg',
    alt: 'Serene mountain cabana surrounded by mist and lush greenery',
  },
];



export const VillaHero: React.FC = () => {
  const { showDemoToast } = useDemoToast();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotating slider with 6-second interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const handleBooking = () => {
    showDemoToast('Direct Booking', 'Navigating to date picker & live price calculation...');
    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExplore = () => {
    showDemoToast('Explore Cabana', 'Scrolling to A-Frame amenities and private deck tour.');
    const el = document.getElementById('facilities') || document.getElementById('activities');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[100vh] min-h-[100dvh] flex flex-col justify-between overflow-hidden pt-28 sm:pt-32 pb-10 sm:pb-14">
      {/* ── Background Slideshow with Smooth Crossfade & Slow Ken-Burns Zoom ── */}
      <div className="absolute inset-0 z-0 bg-[#e8f1ec]">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.4, ease: [0.25, 1, 0.5, 1] },
              scale: { duration: 7, ease: 'easeOut' },
            }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={HERO_IMAGES[currentSlide].src}
              alt={HERO_IMAGES[currentSlide].alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Clear view: No dark overlay */}
      </div>

      {/* ── Main Hero Editorial Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-8 sm:py-12">
        <div className="max-w-3xl space-y-6 sm:space-y-8">
          {/* Top Kicker Badge (Frosted White Glass) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 border border-emerald-600/20 text-emerald-900 text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-md shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shadow-sm shadow-emerald-600/80" />
            <span>MISTY PEAKS • LUXURY A-FRAME HIDEAWAY</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.06] drop-shadow-[0_4px_24px_rgba(0,0,0,0.75)]"
          >
            Escape into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-300">
              the Clouds.
            </span>
          </motion.h1>

          {/* Subtitle / Overview */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white leading-relaxed font-medium max-w-2xl drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]"
          >
            A luxury A-frame hideaway nestled amidst endless emerald tea hills. Wake up above the morning mist and
            unwind in pure serenity.
          </motion.p>

          {/* CTA Button Group */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
          >
            {/* Primary CTA */}
            <button
              onClick={handleBooking}
              className="villa-btn-primary px-6 py-2.5 sm:px-6.5 sm:py-3 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 group shadow-xl cursor-pointer"
            >
              <span>Book Your Stay</span>
              <svg
                className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            {/* Secondary CTA */}
            <button
              onClick={handleExplore}
              className="px-6 py-2.5 sm:px-6.5 sm:py-3 rounded-full bg-white/90 hover:bg-white text-slate-900 font-bold text-[11px] sm:text-xs tracking-wider uppercase border border-white/60 hover:border-emerald-500/40 backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Explore the Cabana</span>
              <span className="text-emerald-700 font-bold">↓</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Seamless Bottom Fade Gradient (Fades out sharp edge into light mode background) ── */}
      <div className="absolute inset-x-0 bottom-0 h-36 sm:h-48 bg-gradient-to-t from-[#f6f9f8] via-[#f6f9f8]/70 to-transparent pointer-events-none z-10" />
    </section>
  );
};
