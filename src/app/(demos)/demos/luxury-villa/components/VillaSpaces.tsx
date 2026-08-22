'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

interface SpaceCard {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: React.ReactNode;
}

const BASE_SPACES_DATA: SpaceCard[] = [
  {
    id: 'wooden-deck',
    title: 'Private Wooden Deck',
    description: 'Suspended lounge space floating above the morning cloud ocean.',
    image: '/demos/villa/hero-1.jpeg',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    id: 'glass-pavilion',
    title: 'A-Frame Glass Pavilion',
    description: 'Floor-to-ceiling panoramic glass facing emerald misty valleys.',
    image: '/demos/villa/hero-3.jpeg',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    id: 'sunrise-lounge',
    title: 'Sunrise Tea Deck',
    description: 'Fresh artisan Ceylon brew served at golden hour overlooking mist.',
    image: '/demos/villa/activity-sunrise.jpg',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    id: 'tea-trails',
    title: 'Estate Nature Trails',
    description: 'Direct private stepping pathways through lush tea plantations.',
    image: '/demos/villa/activity-tea-trek.jpg',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
  },
  {
    id: 'ridge-view',
    title: 'Mountain Ridge Panorama',
    description: '360° unobstructed views of jagged peaks and rolling hilltops.',
    image: '/demos/villa/activity-hiking.jpg',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
  },
  {
    id: 'night-sky',
    title: 'Starlit Mountain Terrace',
    description: 'Crisp night air and peaceful stargazing from the private balcony.',
    image: '/demos/villa/hero-2.jpeg',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    ),
  },
];

// Replicate sets for endless seamless infinite navigation
const INFINITE_SPACES_DATA = [
  ...BASE_SPACES_DATA.map((item) => ({ ...item, uniqueKey: `set1-${item.id}` })),
  ...BASE_SPACES_DATA.map((item) => ({ ...item, uniqueKey: `set2-${item.id}` })),
  ...BASE_SPACES_DATA.map((item) => ({ ...item, uniqueKey: `set3-${item.id}` })),
  ...BASE_SPACES_DATA.map((item) => ({ ...item, uniqueKey: `set4-${item.id}` })),
];

export const VillaSpaces: React.FC = () => {
  const { showDemoToast } = useDemoToast();
  const sliderRef = useRef<HTMLDivElement>(null);

  // Position at the middle set on initial load
  useEffect(() => {
    if (sliderRef.current) {
      const cardWidth = 340; // width + gap
      const singleSetWidth = BASE_SPACES_DATA.length * cardWidth;
      sliderRef.current.scrollLeft = singleSetWidth;
    }
  }, []);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    const cardWidth = 340;
    const singleSetWidth = BASE_SPACES_DATA.length * cardWidth;

    // If approaching start, jump forward by one set seamlessly
    if (el.scrollLeft <= 50) {
      el.scrollLeft += singleSetWidth;
    }
    // If approaching end, jump back by one set seamlessly
    else if (el.scrollLeft >= singleSetWidth * 2.5) {
      el.scrollLeft -= singleSetWidth;
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const cardWidth = 340;
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleExploreGallery = () => {
    showDemoToast('Explore Gallery', 'Opening panoramic photography & cabana gallery of Misty Peaks...');
  };

  return (
    <section className="relative py-20 sm:py-28 bg-[#f8faf9] overflow-hidden border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Top Header Bar (Eyebrow & Title - Center Aligned) ── */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          {/* Eyebrow Tag with Leaf/Compass Icon */}
          <div className="inline-flex items-center gap-2 text-emerald-800 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
              ✦
            </span>
            <span>The Sanctuary</span>
          </div>

          {/* Main Headline */}
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15]">
            Spaces that inspire <br className="hidden sm:inline" />
            and{' '}
            <span className="text-emerald-700">
              connect with nature ✻
            </span>
          </h2>
        </div>

        {/* ── Content Row: Left Intro Text + Infinite Carousel Slider ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Description, Navigation Buttons & Explore Gallery CTA */}
          <div className="lg:col-span-3 space-y-6 lg:pt-2">
            <p className="text-sm text-slate-600 font-light leading-relaxed">
              From panoramic sunrise decks to artisan wooden architecture, every corner of Misty Peaks is
              crafted for intimate serenity and refined mountain living.
            </p>

            {/* Circular Navigation Arrow Buttons (Infinite Loops in Both Directions) */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => scroll('left')}
                className="w-12 h-12 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-emerald-700 flex items-center justify-center shadow-sm hover:shadow-md transition-all cursor-pointer"
                aria-label="Scroll left indefinitely"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => scroll('right')}
                className="w-12 h-12 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-emerald-700 flex items-center justify-center shadow-sm hover:shadow-md transition-all cursor-pointer"
                aria-label="Scroll right indefinitely"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Explore Gallery Button Below Navigations */}
            <div className="pt-2">
              <button
                onClick={handleExploreGallery}
                className="px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs uppercase tracking-wider border border-slate-300 shadow-sm hover:shadow-md transition-all flex items-center gap-2.5 cursor-pointer group"
              >
                <span>Explore Gallery</span>
                <span className="text-emerald-700 transform group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>

          {/* Right Column: Infinite Smooth Continuous Carousel with Left/Right Fadeouts */}
          <div className="lg:col-span-9 relative overflow-hidden">
            {/* Left & Right Smooth Edge Fade Masks */}
            <div className="absolute left-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-r from-[#f8faf9] to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-l from-[#f8faf9] to-transparent pointer-events-none z-10" />

            <div
              ref={sliderRef}
              onScroll={handleScroll}
              className="flex gap-5 sm:gap-6 overflow-x-auto pb-6 pt-2 px-2 sm:px-4 scrollbar-none scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {INFINITE_SPACES_DATA.map((card, idx) => (
                <motion.div
                  key={card.uniqueKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (idx % 6) * 0.08 }}
                  className="w-[280px] sm:w-[320px] shrink-0 rounded-[28px] bg-white border border-slate-200/90 p-3.5 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Top Image Canvas */}
                  <div className="relative aspect-[4/5] w-full rounded-[22px] overflow-hidden bg-slate-100">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="320px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  </div>

                  {/* Overlapping Floating Circle Icon Badge */}
                  <div className="w-12 h-12 rounded-full bg-[#1b4332] text-white flex items-center justify-center -mt-6 ml-4 relative z-10 border-4 border-white shadow-md group-hover:scale-110 group-hover:bg-emerald-700 transition-all duration-300">
                    {card.icon}
                  </div>

                  {/* Card Bottom Content */}
                  <div className="pt-3 pb-2 px-3 space-y-1">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-emerald-800 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-light leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
