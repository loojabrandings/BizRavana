'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bed, 
  Bath, 
  Maximize2, 
  MapPin, 
  ArrowUpRight, 
  Sparkles,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface SignaturePlace {
  id: string;
  title: string;
  tagline: string;
  location: string;
  price: string;
  image: string;
  badge: string;
  beds: number;
  baths: number;
  sqft: string;
  year: number;
  description: string;
}

const SIGNATURE_PLACES: SignaturePlace[] = [
  {
    id: 'place-1',
    title: 'The Solstice Horizon Villa',
    tagline: 'Infinite Aegean Sea Panorama',
    location: 'Mykonos Coast, Greece',
    price: '$18,750,000',
    image: '/demos/realestate/sig-villa.jpg',
    badge: 'Exclusive Listing',
    beds: 6,
    baths: 7,
    sqft: '7,400 sq.ft',
    year: 2025,
    description: 'A monolithic travertine cliffside sanctuary featuring a 40-meter cantilevered infinity pool that merges seamlessly with the Aegean horizon.',
  },
  {
    id: 'place-2',
    title: 'The Crown Panorama Penthouse',
    tagline: 'Tribeca Architectural Trophy',
    location: 'Tribeca, New York',
    price: '$24,500,000',
    image: '/demos/realestate/sig-penthouse.jpg',
    badge: 'Architectural Trophy',
    beds: 5,
    baths: 6,
    sqft: '6,850 sq.ft',
    year: 2024,
    description: 'Double-height cathedral glass walls framing unobstructed Hudson River sunsets, private elevator gallery, and custom Calacatta marble hearth.',
  },
  {
    id: 'place-3',
    title: 'Villa Azure Cantilever',
    tagline: 'Private Coastal Estate',
    location: 'Kauai Coast, Hawaii',
    price: '$21,900,000',
    image: '/demos/realestate/sig-coastal.jpg',
    badge: 'Private Waterfront',
    beds: 5,
    baths: 6,
    sqft: '8,200 sq.ft',
    year: 2025,
    description: 'Framed in natural cedar and volcanic stone, offering direct secluded cove access, open-air living pavilions, and organic lush landscaping.',
  },
  {
    id: 'place-4',
    title: 'The Matterhorn Alpine Lodge',
    tagline: 'Private Mountain Retreat',
    location: 'Zermatt, Switzerland',
    price: '$16,800,000',
    image: '/demos/realestate/sig-alpine.jpg',
    badge: 'Alpine Sanctuary',
    beds: 7,
    baths: 8,
    sqft: '9,100 sq.ft',
    year: 2026,
    description: 'Architectural glass and charred timber ski-in/ski-out lodge with heated geothermal outdoor infinity pool and private wine vault.',
  },
];

const AUTO_PLAY_INTERVAL = 5000; // 5 seconds per slide

export function RealEstateSignaturePlaces() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activePlace = SIGNATURE_PLACES[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SIGNATURE_PLACES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SIGNATURE_PLACES.length) % SIGNATURE_PLACES.length);
  };

  // Auto-advance slideshow timer
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      handleNext();
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused]);

  return (
    <section 
      id="signature-places" 
      className="relative w-full py-24 sm:py-32 bg-[#FAF9F6] text-[#141416] select-none overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        
        {/* ── Top Header: Left Title | Right Interactive Thumbnails ──── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 sm:mb-16">
          
          {/* Left Title Area */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141416]/5 border border-[#141416]/10 mb-4"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#141416]">
                Curated Portfolio 2026
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl text-[#141416] leading-[1.02] tracking-tight"
            >
              <span className="re-font-sans font-light uppercase tracking-wider block text-2xl sm:text-4xl text-[#141416]/70 mb-1">
                Signature
              </span>
              <span className="re-font-serif font-normal text-5xl sm:text-7xl md:text-8xl tracking-tight block text-[#141416]">
                Places
              </span>
            </motion.h2>
          </div>

          {/* Right: Clean Interactive Thumbnails Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center gap-2.5 sm:gap-3 flex-wrap"
          >
            {SIGNATURE_PLACES.map((place, idx) => {
              const isActive = idx === currentIndex;

              return (
                <button
                  key={place.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-20 sm:w-24 aspect-[16/11] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    isActive
                      ? 'ring-2 ring-[#141416] shadow-lg scale-105'
                      : 'opacity-50 hover:opacity-100 hover:scale-100'
                  }`}
                >
                  <Image
                    src={place.image}
                    alt={place.title}
                    fill
                    sizes="100px"
                    className="object-cover object-center"
                  />
                  
                  {/* Active Progress Bar Overlay */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/40 overflow-hidden">
                      <motion.div
                        key={currentIndex}
                        initial={{ width: '0%' }}
                        animate={{ width: isPaused ? '100%' : '100%' }}
                        transition={{ duration: isPaused ? 0 : AUTO_PLAY_INTERVAL / 1000, ease: 'linear' }}
                        className="h-full bg-[#141416]"
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </motion.div>

        </div>

        {/* ── Main Split Showcase: Left Text Info | Right Large Active Image ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ── LEFT COLUMN: Active Property Details (5 Cols) ── */}
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePlace.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Location & Badge */}
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#6E7178] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>{activePlace.location}</span>
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#141416]/20" />
                  <span className="text-[11px] font-semibold tracking-wider text-[#C5A880] uppercase">
                    {activePlace.badge}
                  </span>
                </div>

                {/* Property Name */}
                <h3 className="re-font-serif text-3xl sm:text-4xl lg:text-[2.6rem] text-[#141416] font-normal leading-[1.12] tracking-tight">
                  {activePlace.title}
                </h3>

                {/* Price Tag */}
                <p className="mt-2 text-2xl sm:text-3xl font-semibold text-[#141416] tracking-tight">
                  {activePlace.price}
                </p>

                {/* Description */}
                <p className="mt-4 text-sm sm:text-base text-[#6E7178] leading-relaxed">
                  {activePlace.description}
                </p>

                {/* Specs Row */}
                <div className="mt-6 pt-5 border-t border-[#E8E5DF] flex items-center gap-6 text-xs sm:text-sm font-medium text-[#141416]">
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-[#C5A880]" />
                    <span>{activePlace.beds} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-[#C5A880]" />
                    <span>{activePlace.baths} Baths</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4 text-[#C5A880]" />
                    <span>{activePlace.sqft}</span>
                  </div>
                </div>

                {/* CTA Action */}
                <div className="mt-7">
                  <a
                    href="#contact"
                    className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#141416] text-[#FAF9F6] text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-lg hover:bg-[#2A2B30] transition-all duration-300"
                  >
                    <span>Inquire Property</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── RIGHT COLUMN: Large Active Photo Showcase (7 Cols) ────────── */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden shadow-2xl bg-[#E8E5DF] border border-[#E8E5DF]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePlace.id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image
                    src={activePlace.image}
                    alt={activePlace.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover object-center"
                  />

                  {/* Soft Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Bottom Estate Tagline & Title */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between flex-wrap gap-4 text-white pointer-events-none">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/80 font-medium">
                        {activePlace.tagline}
                      </p>
                      <p className="text-2xl sm:text-3xl font-semibold tracking-tight drop-shadow-md">
                        {activePlace.title}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

