'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bed, 
  Bath, 
  Maximize2, 
  MapPin, 
  ArrowUpRight, 
  Heart, 
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Filter,
  Layers,
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface SriLankanProperty {
  id: string;
  category: 'all' | 'brand-new' | 'pre-owned' | 'coastal' | 'penthouse';
  locationDistrict: string;
  title: string;
  location: string;
  priceLKR: string;
  priceUSD: string;
  image: string;
  condition: 'Brand New (2025)' | 'Restored Heritage' | 'Move-In Ready';
  legalStatus: 'Attorney Vetted Title' | 'Bim Saviya Clean Deed' | 'Clear Title Guaranteed';
  beds: number;
  baths: number;
  perches: string;
  sqft: string;
  highlight: string;
  directOwner: boolean;
}

const SRI_LANKAN_PROPERTIES: SriLankanProperty[] = [
  {
    id: 'sl-prop-1',
    category: 'brand-new',
    locationDistrict: 'colombo',
    title: 'The Cinnamon Groves Residence',
    location: 'Ward Place, Colombo 07',
    priceLKR: 'LKR 285 Mn',
    priceUSD: 'approx. $960,000',
    image: '/demos/realestate/prop-colombo-mansion.jpg',
    condition: 'Brand New (2025)',
    legalStatus: 'Attorney Vetted Title',
    beds: 5,
    baths: 6,
    perches: '18.5 Perches',
    sqft: '6,200 sq.ft',
    highlight: 'Architectural tropical modernist masterpiece with private pool, internal lift, and 4-vehicle garage in prime diplomatic zone.',
    directOwner: true,
  },
  {
    id: 'sl-prop-2',
    category: 'pre-owned',
    locationDistrict: 'galle',
    title: 'Villa Veranda Dutch Heritage',
    location: 'Lighthouse Street, Galle Fort',
    priceLKR: 'LKR 340 Mn',
    priceUSD: 'approx. $1,150,000',
    image: '/demos/realestate/prop-galle-heritage.jpg',
    condition: 'Restored Heritage',
    legalStatus: 'Clear Title Guaranteed',
    beds: 4,
    baths: 5,
    perches: '22.0 Perches',
    sqft: '5,100 sq.ft',
    highlight: 'Impeccably restored 18th-century Dutch colonial villa with central courtyard frangipani pool and valid boutique hotel license.',
    directOwner: true,
  },
  {
    id: 'sl-prop-3',
    category: 'brand-new',
    locationDistrict: 'rajagiriya',
    title: 'The Diyawanna Lakefront Villa',
    location: 'Lake Road, Rajagiriya',
    priceLKR: 'LKR 195 Mn',
    priceUSD: 'approx. $655,000',
    image: '/demos/realestate/prop-rajagiriya-lake.jpg',
    condition: 'Brand New (2025)',
    legalStatus: 'Bim Saviya Clean Deed',
    beds: 4,
    baths: 5,
    perches: '15.2 Perches',
    sqft: '4,800 sq.ft',
    highlight: 'Multi-level architectural glass home overlooking unobstructed Diyawanna Oya bird sanctuary waters with teak sun-deck.',
    directOwner: true,
  },
  {
    id: 'sl-prop-4',
    category: 'coastal',
    locationDistrict: 'kandy',
    title: 'Hanthana Peak Sanctuary',
    location: 'Hanthana Mountain Range, Kandy',
    priceLKR: 'LKR 165 Mn',
    priceUSD: 'approx. $555,000',
    image: '/demos/realestate/prop-kandy-hilltop.jpg',
    condition: 'Move-In Ready',
    legalStatus: 'Attorney Vetted Title',
    beds: 6,
    baths: 6,
    perches: '45.0 Perches',
    sqft: '7,500 sq.ft',
    highlight: 'Suspended cliffside infinity pool with 360° panoramic mist valley views and private organic spice garden.',
    directOwner: true,
  },
  {
    id: 'sl-prop-5',
    category: 'penthouse',
    locationDistrict: 'colombo',
    title: 'The Oceanfront Sky Residence',
    location: 'Galle Face Terrace, Colombo 03',
    priceLKR: 'LKR 245 Mn',
    priceUSD: 'approx. $825,000',
    image: '/demos/realestate/sig-penthouse.jpg',
    condition: 'Brand New (2025)',
    legalStatus: 'Clear Title Guaranteed',
    beds: 4,
    baths: 4,
    perches: 'Penthouse Unit',
    sqft: '4,200 sq.ft',
    highlight: 'Ultra-luxury high-floor apartment with panoramic Indian Ocean sunset views, private elevator access, and concierge.',
    directOwner: false,
  },
  {
    id: 'sl-prop-6',
    category: 'coastal',
    locationDistrict: 'galle',
    title: 'Thalpe Coral Cove Beachfront',
    location: 'Matara Road, Thalpe, Galle',
    priceLKR: 'LKR 310 Mn',
    priceUSD: 'approx. $1,045,000',
    image: '/demos/realestate/sig-coastal.jpg',
    condition: 'Move-In Ready',
    legalStatus: 'Bim Saviya Clean Deed',
    beds: 5,
    baths: 5,
    perches: '30.0 Perches',
    sqft: '5,800 sq.ft',
    highlight: 'Direct sandy beach frontage on Sri Lanka’s most sought-after golden mile with lush coconut grove and pool pavilion.',
    directOwner: true,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Verified Listings' },
  { id: 'brand-new', label: 'Brand New Luxury' },
  { id: 'pre-owned', label: 'Pre-Owned & Restored' },
  { id: 'coastal', label: 'Beachfront & Coastal' },
  { id: 'penthouse', label: 'Skyline Penthouses' },
];

const LOCATIONS = [
  { id: 'all', label: 'All Regions' },
  { id: 'colombo', label: 'Colombo 03 & 07' },
  { id: 'rajagiriya', label: 'Rajagiriya & Suburbs' },
  { id: 'galle', label: 'Galle & South Coast' },
  { id: 'kandy', label: 'Kandy & Central Hills' },
];

export function RealEstatePropertyGrid() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [savedProps, setSavedProps] = useState<Record<string, boolean>>({});

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSavedProps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredProperties = SRI_LANKAN_PROPERTIES.filter((p) => {
    const matchCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchLocation = selectedLocation === 'all' || p.locationDistrict === selectedLocation;
    return matchCategory && matchLocation;
  });

  return (
    <section id="property-inventory" className="relative w-full py-24 sm:py-32 bg-[#F3F1ED] text-[#141416] select-none">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        
        {/* ── Section Header ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E5DF] mb-4 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#141416]">
                100% Deed-Vetted Inventory
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl text-[#141416] leading-[1.02] tracking-tight">
              <span className="re-font-sans font-light uppercase tracking-wider block text-2xl sm:text-4xl text-[#141416]/70 mb-1">
                Explore Verified
              </span>
              <span className="re-font-serif font-normal text-5xl sm:text-7xl md:text-8xl tracking-tight block text-[#141416]">
                Properties in Sri Lanka
              </span>
            </h2>
          </div>

          <p className="text-base sm:text-lg text-[#6E7178] max-w-md font-normal leading-relaxed">
            Every home in our brokerage has undergone rigorous title deed inspection by senior legal counsel. No middleman chains, zero inflated commissions.
          </p>
        </div>

        {/* ── Filter Controls Row ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-10 border-b border-[#E8E5DF]">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-2 sm:pb-0">
            {CATEGORIES.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-[#141416] text-[#FAF9F6] shadow-md'
                    : 'bg-white text-[#6E7178] hover:text-[#141416] border border-[#E8E5DF]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Location Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-[#6E7178] font-medium hidden sm:inline">District:</span>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2.5 rounded-full bg-white border border-[#E8E5DF] text-xs font-semibold text-[#141416] outline-none cursor-pointer shadow-sm hover:border-[#141416]/40 transition-colors"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Property Inventory Grid ──────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProperties.map((prop, idx) => {
              const isSaved = !!savedProps[prop.id];

              return (
                <motion.div
                  key={prop.id}
                  layout
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="group bg-white rounded-3xl border border-[#E8E5DF] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#141416]/25 transition-all duration-400 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Header with Badges */}
                    <div className="relative w-full aspect-[16/11] overflow-hidden bg-[#E8E5DF]">
                      <Image
                        src={prop.image}
                        alt={prop.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                        <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold tracking-wider text-[#141416] uppercase shadow-sm">
                          {prop.condition}
                        </span>

                        <button
                          onClick={(e) => toggleSave(prop.id, e)}
                          aria-label="Save Property"
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 pointer-events-auto cursor-pointer ${
                            isSaved 
                              ? 'bg-rose-500 text-white shadow-md' 
                              : 'bg-white/90 backdrop-blur-md text-[#141416] hover:bg-white shadow-sm'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Legal Deed Verification Badge */}
                      <div className="absolute bottom-3 left-3 pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/85 backdrop-blur-md text-emerald-300 text-[10px] font-semibold tracking-wide border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{prop.legalStatus}</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Body Details */}
                    <div className="p-6">
                      {/* Location & Title */}
                      <div className="flex items-center gap-1.5 text-xs text-[#6E7178] font-medium mb-2">
                        <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{prop.location}</span>
                      </div>

                      <h3 className="re-font-serif text-2xl text-[#141416] font-normal tracking-tight group-hover:text-[#A8895E] transition-colors line-clamp-1">
                        {prop.title}
                      </h3>

                      {/* Dual Currency Price */}
                      <div className="mt-3">
                        <p className="text-2xl font-bold text-[#141416] tracking-tight">
                          {prop.priceLKR}
                        </p>
                        <p className="text-xs text-[#6E7178] font-medium mt-0.5">
                          {prop.priceUSD}
                        </p>
                      </div>

                      {/* Short Highlight */}
                      <p className="mt-3 text-xs text-[#6E7178] leading-relaxed line-clamp-2">
                        {prop.highlight}
                      </p>
                    </div>
                  </div>

                  {/* Specs & WhatsApp Action Row */}
                  <div className="p-6 pt-0">
                    <div className="pt-4 border-t border-[#E8E5DF] flex items-center justify-between text-xs text-[#141416] font-medium mb-4">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{prop.beds} Beds</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{prop.baths} Baths</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{prop.perches}</span>
                      </div>
                    </div>

                    {/* 1-Click WhatsApp Inquiry Button */}
                    <a
                      href={`https://wa.me/94770000000?text=${encodeURIComponent(
                        `Hi Aura Estates, I am interested in scheduling a private inspection for: ${prop.title} (${prop.location}) listed at ${prop.priceLKR}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl bg-[#141416] hover:bg-[#2A2B30] text-white text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <span>Inquire On WhatsApp</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── Help / Off-Market Note Banner ────────────────────────── */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E5DF] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C5A880]/15 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-6 h-6 text-[#A8895E]" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-[#141416]">
                Need custom property sourcing or off-market deeds in Sri Lanka?
              </h4>
              <p className="text-xs sm:text-sm text-[#6E7178] mt-0.5">
                Our senior legal advisors and property brokers source unlisted private land & residences based on your exact budget.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/94770000000?text=Hi%20Aura%20Estates,%20I%20am%20looking%20for%20a%20custom%20property%20sourcing%20consultation."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-full bg-[#141416] text-[#FAF9F6] text-xs font-semibold tracking-wider uppercase whitespace-nowrap hover:bg-[#2A2B30] transition-all shadow-md flex-shrink-0"
          >
            Speak With Legal Broker →
          </a>
        </div>

      </div>
    </section>
  );
}
