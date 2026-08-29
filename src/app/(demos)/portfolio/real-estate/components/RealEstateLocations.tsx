'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Home, ArrowUpRight, Compass } from 'lucide-react';

interface Neighborhood {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  image: string;
  activeListings: number;
  avgAppreciation: string;
  lifestyle: string[];
}

const NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 'colombo-prime',
    name: 'Colombo 03 & 07',
    subtitle: 'Cinnamon Gardens & Colpetty',
    tagline: 'The Epicenter of Prestige, Diplomatic Enclaves & Luxury High-Rises',
    image: '/demos/realestate/prop-colombo-mansion.jpg',
    activeListings: 18,
    avgAppreciation: '+12.4% p.a.',
    lifestyle: ['Top International Schools', 'Diplomatic Missions', 'Fine Dining & Art Galleries'],
  },
  {
    id: 'rajagiriya-suburbs',
    name: 'Rajagiriya & Battaramulla',
    subtitle: 'The Administrative Capital Belt',
    tagline: 'Serene Waterside Mansions & Exclusive Gated Communities',
    image: '/demos/realestate/prop-rajagiriya-lake.jpg',
    activeListings: 24,
    avgAppreciation: '+14.1% p.a.',
    lifestyle: ['Diyawanna Wetland Parks', 'Rapid City Access', 'Spacious Land Extents'],
  },
  {
    id: 'galle-south-coast',
    name: 'Galle & Southern Coast',
    subtitle: 'Galle Fort, Thalpe & Weligama',
    tagline: 'Colonial Heritage Mansions & High-Yield Beachfront Sanctuaries',
    image: '/demos/realestate/prop-galle-heritage.jpg',
    activeListings: 15,
    avgAppreciation: '+18.6% p.a.',
    lifestyle: ['UNESCO World Heritage', 'High Foreign Rental Yields', 'Direct Coral Beaches'],
  },
  {
    id: 'kandy-hills',
    name: 'Kandy & Central Hills',
    subtitle: 'Hanthana & Tea Country Hills',
    tagline: 'Misty Hilltop Retreats & Serene Mountain Bungalows',
    image: '/demos/realestate/prop-kandy-hilltop.jpg',
    activeListings: 9,
    avgAppreciation: '+9.8% p.a.',
    lifestyle: ['Cool Mountain Climate', 'Breathtaking 360° Views', 'Wellness & Tea Estates'],
  },
];

export function RealEstateLocations() {
  return (
    <section id="locations" className="relative w-full py-24 sm:py-32 bg-[#FAF9F6] text-[#141416] select-none">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        
        {/* ── Section Header ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141416]/5 border border-[#141416]/10 mb-4">
              <Compass className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#141416]">
                Prime Sri Lankan Hotspots
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl text-[#141416] leading-[1.02] tracking-tight">
              <span className="re-font-sans font-light uppercase tracking-wider block text-2xl sm:text-4xl text-[#141416]/70 mb-1">
                Where Prestige Meets
              </span>
              <span className="re-font-serif font-normal text-5xl sm:text-7xl md:text-8xl tracking-tight block text-[#141416]">
                Generational Value
              </span>
            </h2>
          </div>

          <p className="text-base sm:text-lg text-[#6E7178] max-w-md font-normal leading-relaxed">
            Discover the most lucrative real estate micro-markets in Sri Lanka for capital growth, prime luxury residency, and foreign currency rental yields.
          </p>
        </div>

        {/* ── 4 Prime Neighborhoods Grid ───────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {NEIGHBORHOODS.map((hood, idx) => (
            <motion.div
              key={hood.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative bg-white rounded-3xl border border-[#E8E5DF] overflow-hidden shadow-sm hover:shadow-2xl hover:border-[#141416]/20 transition-all duration-500 flex flex-col justify-between"
            >
              {/* Image with Dark/Light Contrast Overlay */}
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#FAF9F6]">
                <Image
                  src={hood.image}
                  alt={hood.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                
                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                {/* Top Location Pill */}
                <div className="absolute top-5 left-5">
                  <span className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-semibold tracking-wider text-[#141416] uppercase shadow-sm">
                    {hood.subtitle}
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <h3 className="re-font-serif text-2xl sm:text-3xl font-normal tracking-tight">
                    {hood.name}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-1 mt-1 font-light">
                    {hood.tagline}
                  </p>
                </div>
              </div>

              {/* Stats & Lifestyle Highlights */}
              <div className="p-7 sm:p-8 flex flex-col justify-between flex-1">
                <div>
                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 gap-4 pb-6 border-b border-[#E8E5DF]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#141416]/5 flex items-center justify-center text-[#141416]">
                        <Home className="w-4 h-4 text-[#A8895E]" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-[#141416]">{hood.activeListings} Active</p>
                        <p className="text-[11px] text-[#6E7178] uppercase tracking-wider">Vetted Listings</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-700">{hood.avgAppreciation}</p>
                        <p className="text-[11px] text-[#6E7178] uppercase tracking-wider">Est. Growth</p>
                      </div>
                    </div>
                  </div>

                  {/* Lifestyle Pills */}
                  <div className="mt-6 flex items-center gap-2 flex-wrap">
                    {hood.lifestyle.map((pill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-[#F3F1ED] text-[#141416] text-[11px] font-medium"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* View District Properties Link */}
                <div className="mt-7 pt-5 border-t border-[#E8E5DF] flex items-center justify-between">
                  <a
                    href="#property-inventory"
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#141416] group-hover:text-[#A8895E] transition-colors"
                  >
                    <span>Browse Properties in {hood.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
