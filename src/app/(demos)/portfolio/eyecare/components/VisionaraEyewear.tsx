'use client';

import React from 'react';
import Image from 'next/image';
import { Check, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { useVisionaraStore } from './VisionaraStore';

interface FrameItem {
  id: string;
  name: string;
  category: 'titanium' | 'acetate' | 'bluelight' | 'sunglasses';
  tag: string;
  priceLKR: string;
  weight: string;
  material: string;
  faceShape: string;
  image: string;
  description: string;
  features: string[];
  colors: { name: string; hex: string }[];
}

const framesData: FrameItem[] = [
  {
    id: 'aero-titanium',
    name: 'Aero Titanium 01',
    category: 'titanium',
    tag: 'ULTRA LIGHTWEIGHT',
    priceLKR: 'Rs. 14,500',
    weight: '11 Grams',
    material: 'Japanese Grade-5 Beta Titanium',
    faceShape: 'Oval, Round, Heart & Square',
    image: '/demos/eyecare/frame_titanium.jpg',
    description:
      'Forged from aerospace-grade beta titanium with screwless hinges. Weighs only 11 grams for all-day featherlight comfort without pressure marks on your nose.',
    features: [
      '11g featherweight comfort with zero nose pressure',
      'Hypoallergenic Japanese titanium body',
      'Includes premium anti-reflective multicoat lenses',
    ],
    colors: [
      { name: 'Matte Gunmetal', hex: '#64748b' },
      { name: 'Brushed Silver', hex: '#cbd5e1' },
      { name: 'Obsidian Black', hex: '#0f172a' },
    ],
  },
  {
    id: 'kandy-acetate',
    name: 'Kandy Classic Acetate',
    category: 'acetate',
    tag: 'HAND-POLISHED',
    priceLKR: 'Rs. 12,500',
    weight: '22 Grams',
    material: 'Italian Mazzucchelli Bio-Acetate',
    faceShape: 'Oval, Round, Diamond',
    image: '/demos/eyecare/frame_acetate.jpg',
    description:
      'Individually hand-polished organic acetate featuring timeless dark tortoiseshell gradients. Durable five-barrel steel hinges engineered for decades of wear.',
    features: [
      'Hand-buffed Italian Mazzucchelli organic acetate',
      '5-barrel German steel barrel hinges',
      'Warm tortoiseshell colorway with rich depth',
    ],
    colors: [
      { name: 'Dark Tortoiseshell', hex: '#78350f' },
      { name: 'Gloss Deep Havana', hex: '#451a03' },
      { name: 'Midnight Onyx', hex: '#18181b' },
    ],
  },
  {
    id: 'screen-shield',
    name: 'Crystal BlueShield Pro',
    category: 'bluelight',
    tag: 'SCREEN PROTECTION',
    priceLKR: 'Rs. 9,800',
    weight: '15 Grams',
    material: 'Medical Crystal TR-90 Polymer',
    faceShape: 'All Face Types',
    image: '/demos/eyecare/frame_bluelight.jpg',
    description:
      'Engineered specifically for software engineers, gamers, and remote professionals. Filters 99.4% of harmful blue-violet light emitted by laptops and smartphones.',
    features: [
      'Blocks 99.4% harmful blue-violet light spectrum',
      'Zero color distortion optical clarity',
      'Prevents digital eye fatigue and evening headaches',
    ],
    colors: [
      { name: 'Crystal Clear', hex: '#e2e8f0' },
      { name: 'Smoky Grey', hex: '#475569' },
      { name: 'Ice Amber', hex: '#d97706' },
    ],
  },
  {
    id: 'galle-polarized',
    name: 'Galle Coastal Aviator',
    category: 'sunglasses',
    tag: 'UV400 POLARIZED',
    priceLKR: 'Rs. 16,800',
    weight: '18 Grams',
    material: 'Brushed Gold Alloy & CR-39 Lens',
    faceShape: 'Square, Oval, Triangular',
    image: '/demos/eyecare/frame_sunglasses.jpg',
    description:
      'Inspired by the golden sunlight of the Southern Coast. Polarized Category 3 green-tint lenses cut 100% of harsh ocean and highway glare across Sri Lanka.',
    features: [
      '100% UV400 Category 3 polarized optical lenses',
      'Hydrophobic and oil-resistant lens coating',
      'Brushed champagne gold architectural metalwork',
    ],
    colors: [
      { name: 'Champagne Gold', hex: '#ca8a04' },
      { name: 'Matte Stealth Black', hex: '#1e293b' },
      { name: 'Rose Bronze', hex: '#9a3412' },
    ],
  },
];

export function VisionaraEyewear() {
  const {
    activeFrameId,
    setActiveFrameId,
    selectedFilter,
    setSelectedFilter,
    activeColorIdx,
    setActiveColorIdx,
  } = useVisionaraStore();

  const filteredFrames =
    selectedFilter === 'all'
      ? framesData
      : framesData.filter((f) => f.category === selectedFilter);

  const currentFrame =
    framesData.find((f) => f.id === activeFrameId) || framesData[0];

  return (
    <section
      id="eyewear"
      className="relative w-full py-28 md:py-36 text-white px-6 md:px-14 lg:px-20 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto">
        {/* ── SECTION HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-950/60 border border-amber-800/40 text-[11px] font-bold tracking-[0.2em] text-amber-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>03 // BESPOKE OPTICAL FRAMES</span>
            </div>
            <h2 className="font-['Syne',sans-serif] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1] text-white">
              Precision Crafted Frames.
              <br />
              <span className="text-amber-400">Close-Up Detail & Ultimate Comfort.</span>
            </h2>
          </div>

          <p className="text-sm md:text-base text-white/70 max-w-md leading-relaxed font-normal">
            Over 350+ bespoke frames in stock across Colombo 07, Kandy City Center, and Galle Fort with precision same-day lens fitting.
          </p>
        </div>

        {/* ── CATEGORY FILTER BUTTONS (FULL SECTION WIDTH GRID) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full mb-12">
          {[
            { id: 'titanium', label: '11G FEATHER-LIGHT TITANIUM' },
            { id: 'acetate', label: 'HANDMADE BIO-ACETATE' },
            { id: 'bluelight', label: 'SCREEN BLUE-LIGHT SHIELD' },
            { id: 'sunglasses', label: 'POLARIZED SUNGLASSES' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedFilter(cat.id);
                const matching = framesData.find((f) => f.category === cat.id);
                if (matching) {
                  setActiveFrameId(matching.id);
                  setActiveColorIdx(0);
                }
              }}
              className={`w-full py-3.5 md:py-4 px-4 text-center text-xs font-['Syne',sans-serif] font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center justify-center ${
                selectedFilter === cat.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-xl scale-[1.01]'
                  : 'bg-zinc-900/80 text-white/70 border-white/10 hover:bg-zinc-800 hover:text-white hover:border-white/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── MAIN EDITORIAL SHOWCASE STAGE (SEAMLESS OPEN LAYOUT) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left: High Macro Photo Viewport (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-white/15 bg-black group">
              <Image
                src={currentFrame.image}
                alt={currentFrame.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Top Floating Badges */}
              <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
                <span className="px-3 py-1 bg-black/80 backdrop-blur-md border border-amber-500/50 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest">
                  {currentFrame.tag}
                </span>
                <span className="px-3 py-1 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono font-bold uppercase">
                  WEIGHT: {currentFrame.weight}
                </span>
              </div>

              {/* Bottom Image Subtitle */}
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-xs text-white/90 font-mono">
                <span>MACRO EYEWEAR CLOSE-UP</span>
                <span className="text-blue-400 font-bold">100% OPTICAL PRECISION</span>
              </div>
            </div>
          </div>

          {/* Right: Technical Specs & Details (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-mono text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MATERIAL: {currentFrame.material}</span>
              </div>

              <h3 className="font-['Syne',sans-serif] text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase text-white">
                {currentFrame.name}
              </h3>

              <div className="text-2xl sm:text-3xl font-black font-['Syne',sans-serif] text-emerald-400 pt-1">
                {currentFrame.priceLKR}
                <span className="text-xs text-white/50 font-normal font-sans ml-3">
                  (Includes Anti-Glare Lenses & Hard Case)
                </span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-white/80 leading-relaxed font-normal">
              {currentFrame.description}
            </p>

            {/* Color Swatches */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/50 block">
                SELECTED FINISH: ({currentFrame.colors[activeColorIdx]?.name})
              </span>
              <div className="flex items-center space-x-3">
                {currentFrame.colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveColorIdx(idx)}
                    className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 cursor-pointer ${
                      activeColorIdx === idx
                        ? 'border-blue-400 scale-110 shadow-md'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                    title={color.name}
                  >
                    <div
                      className="w-full h-full rounded-full border border-white/20"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Features Checklist */}
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              {currentFrame.features.map((feat, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-xs text-white/85">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
              <div className="flex items-center space-x-2.5 text-xs text-blue-300 pt-1">
                <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  <strong>Warranty:</strong> 2 Years Full Replacement Warranty at all branches
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <a
                href="#booking"
                className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-['Syne',sans-serif] text-xs font-bold uppercase tracking-widest text-center transition-colors shadow-lg cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>TRY ON AT CLINIC</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/94771234567?text=Hi%20Visionara,%20I%20am%20interested%20in%20the%20${encodeURIComponent(
                  currentFrame.name
                )}%20frame.`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-['Syne',sans-serif] text-xs font-bold uppercase tracking-widest text-center transition-colors shadow-lg cursor-pointer"
              >
                WHATSAPP US FOR HOME DELIVERY
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
