'use client';

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Sparkles,
  Droplets,
  Zap,
  Leaf,
  Check,
  ArrowRight,
  Plus,
  Package,
  Flame,
} from 'lucide-react';
import { IMAGES } from '../data/images';

const FLAVOR_DETAILS = [
  {
    origin: 'Ratnagiri Coast Orchards',
    calories: '85 Calories • 0g Added Sugar',
    sweetness: 85,
    tartness: 25,
    energy: 90,
    ingredients: '100% Cold-Pressed Organic Alphonso Mango Pulp, Natural Spring Water, Lime Touch.',
  },
  {
    origin: 'Highland Mist Cloud Forest',
    calories: '60 Calories • 0g Added Sugar',
    sweetness: 65,
    tartness: 55,
    energy: 95,
    ingredients: '100% Cold-Pressed Pink Guava Nectar, Crushed Mint Botanicals, Vitamin C.',
  },
  {
    origin: 'Ancient Mediterranean Riverbed',
    calories: '75 Calories • 0g Added Sugar',
    sweetness: 45,
    tartness: 80,
    energy: 98,
    ingredients: '100% Cold-Pressed Wild Pomegranate Arils, Ruby Elderberry, Active Bio-Flavonoids.',
  },
  {
    origin: 'Tropical Rainfed Volcanic Slopes',
    calories: '70 Calories • 0g Added Sugar',
    sweetness: 70,
    tartness: 75,
    energy: 100,
    ingredients: '100% Cold-Pressed Yellow Passion Fruit Nectar, Hibiscus Floral Infusion, Live Enzymes.',
  },
];

export function TerraVivaCollection() {
  const [activeFlavor, setActiveFlavor] = useState<number>(0);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const ambientGlowY = useTransform(scrollYProgress, [0, 1], [-120, 120]);
  const cansParallaxY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={sectionRef}
      id="lineup"
      className="relative w-full bg-stone-950 text-white py-24 sm:py-32 px-4 sm:px-8 lg:px-12 overflow-hidden select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background Ambience with Parallax Drift */}
      <motion.div
        style={{ y: ambientGlowY }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none"
      >
        <div
          style={{
            width: 'clamp(400px, 70vw, 1000px)',
            height: '450px',
            background: 'radial-gradient(ellipse at center, rgba(78,154,104,0.18) 0%, rgba(229,138,19,0.08) 50%, transparent 80%)',
            filter: 'blur(70px)',
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* 1. Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
              INTERACTIVE LINEUP
            </span>
          </div>

          <h2
            className="text-4xl sm:text-6xl font-normal uppercase tracking-tight text-white leading-[1.05]"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            EXPLORE THE FOUR HARVESTS
          </h2>

          <p className="mt-4 text-sm sm:text-base text-white/60 leading-relaxed">
            Click on any harvest to expand its complete profile, tasting notes, and organic origins.
          </p>
        </motion.div>

        {/* 2. Interactive Horizontal Expanding Cards Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row gap-3.5 xl:gap-4.5 items-stretch min-h-[540px] xl:min-h-[580px] mb-16 sm:mb-20"
        >
          {IMAGES.map((item, index) => {
            const isExpanded = activeFlavor === index;
            const detail = FLAVOR_DETAILS[index];
            const color = item.bg;

            return (
              <div
                key={item.name}
                onClick={() => setActiveFlavor(index)}
                className={`group relative rounded-3xl border transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer overflow-hidden backdrop-blur-xl ${
                  isExpanded
                    ? 'lg:flex-[3.5] border-white/25 bg-white/[0.04] shadow-2xl p-6 sm:p-8'
                    : 'lg:flex-[1] border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 p-5 flex flex-col justify-between items-center'
                }`}
                style={{
                  boxShadow: isExpanded ? `0 25px 50px -12px ${color}35` : 'none',
                }}
              >
                {/* Ambient Glow Aura */}
                <div
                  className={`absolute rounded-full pointer-events-none blur-3xl transition-opacity duration-700 ${
                    isExpanded ? 'opacity-35 -top-20 -right-20 w-80 h-80' : 'opacity-10 group-hover:opacity-25 inset-0'
                  }`}
                  style={{ backgroundColor: color }}
                />

                {/* ── COLLAPSED VIEW (Desktop) ── */}
                {!isExpanded && (
                  <div className="hidden lg:flex relative flex-col justify-center items-center h-full w-full overflow-hidden">
                    {/* Giant Full-Height Vertical Title spanning behind/alongside the center can */}
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
                    >
                      <span
                        className="font-normal uppercase text-white/20 group-hover:text-white/40 tracking-tighter transition-colors duration-300 whitespace-nowrap text-[68px] xl:text-[84px] leading-none"
                        style={{
                          fontFamily: "'Anton', sans-serif",
                          writingMode: 'vertical-rl',
                          transform: 'rotate(180deg)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {item.name}
                      </span>
                    </div>

                    {/* Large Centered Can */}
                    <div className="relative z-10 w-full aspect-[0.45/1] max-w-[130px] xl:max-w-[155px] flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                      <img
                        src={item.src}
                        alt={item.name}
                        className="w-full h-full object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.9)]"
                        draggable={false}
                      />
                    </div>
                  </div>
                )}

                {/* ── EXPANDED VIEW (Desktop & Mobile) ── */}
                {isExpanded ? (
                  <div className="relative z-10 w-full h-full grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-6 xl:gap-10 items-center animate-fadeIn">
                    {/* Left: Can Showcase (Centered) */}
                    <div className="relative flex items-center justify-center h-full min-h-[280px] sm:min-h-[340px] p-2 my-auto">
                      <div className="relative z-10 w-full max-w-[210px] sm:max-w-[245px] aspect-[0.45/1] flex items-center justify-center">
                        <img
                          src={item.src}
                          alt={item.name}
                          className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] animate-subtle-float"
                          draggable={false}
                        />
                      </div>
                    </div>

                    {/* Right: Rich Tasting Breakdown & Order Action */}
                    <div className="flex flex-col justify-between h-full py-1">
                      <div>
                        {/* Top Category Badge */}
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span
                            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
                            style={{
                              borderColor: `${color}50`,
                              backgroundColor: `${color}20`,
                              color: color,
                            }}
                          >
                            Single-Origin Release
                          </span>
                          <span className="text-xs font-mono text-white/50">{detail.calories}</span>
                        </div>

                        {/* Title */}
                        <h3
                          className="text-3xl sm:text-5xl font-normal uppercase text-white tracking-tight leading-[1.05]"
                          style={{ fontFamily: "'Anton', sans-serif" }}
                        >
                          {item.name}
                        </h3>

                        <p className="text-sm font-semibold text-white/90 mt-1.5" style={{ color }}>
                          {item.flavor}
                        </p>

                        <p className="text-xs sm:text-sm text-white/65 leading-relaxed mt-2.5">
                          {item.tagline}
                        </p>

                        {/* Taste Radar / Intensity Bars (3 Rows) */}
                        <div className="flex flex-col gap-2.5 my-4 p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                          {/* Row 1: Sweetness */}
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs text-white/70">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Droplets className="w-3.5 h-3.5 text-amber-400" />
                                Sweetness
                              </span>
                              <span className="font-mono text-white/90 text-[11px]">{detail.sweetness}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${detail.sweetness}%`, backgroundColor: color }}
                              />
                            </div>
                          </div>

                          {/* Row 2: Tartness */}
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs text-white/70">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                                Tartness
                              </span>
                              <span className="font-mono text-white/90 text-[11px]">{detail.tartness}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${detail.tartness}%`, backgroundColor: color }}
                              />
                            </div>
                          </div>

                          {/* Row 3: Live Enzymes / Vitality */}
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs text-white/70">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                Live Enzymes
                              </span>
                              <span className="font-mono text-white/90 text-[11px]">{detail.energy}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${detail.energy}%`, backgroundColor: color }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Ingredients */}
                        <div className="text-[11px] text-white/50 leading-relaxed mb-4">
                          <strong className="text-white/80 font-medium">Ingredients: </strong>
                          {detail.ingredients}
                        </div>
                      </div>

                      {/* Buy 12-Pack Button */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-white/40 block">
                            Direct Cold Shipping
                          </span>
                          <span
                            className="text-2xl sm:text-3xl font-normal text-white"
                            style={{ fontFamily: "'Anton', sans-serif" }}
                          >
                            $38.00{' '}
                            <span className="text-xs font-sans text-white/60 font-medium">
                              / 12-Pack
                            </span>
                          </span>
                        </div>

                        <button
                          type="button"
                          className="py-3 px-6 rounded-full font-bold text-xs uppercase tracking-wider text-black transition-all duration-200 flex items-center gap-2 shadow-lg hover:scale-105 cursor-pointer"
                          style={{
                            backgroundColor: color,
                            boxShadow: `0 10px 25px -5px ${color}60`,
                          }}
                        >
                          <Package className="w-4 h-4" />
                          <span>Order 12-Pack</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── MOBILE COLLAPSED ROW ── */
                  <div className="lg:hidden flex items-center justify-between w-full py-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex flex-col text-left">
                        <span
                          className="text-lg font-normal uppercase text-white leading-none"
                          style={{ fontFamily: "'Anton', sans-serif" }}
                        >
                          {item.name}
                        </span>
                        <span className="text-[11px] text-white/50 mt-0.5">{item.flavor}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 aspect-[0.45/1] flex items-center justify-center">
                        <img src={item.src} alt={item.name} className="h-full object-contain" />
                      </div>
                      <div className="w-7 h-7 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/50">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>

        {/* 3. High-Impact Starter Variety Pack Banner */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl border border-white/15 bg-gradient-to-r from-stone-900/90 via-stone-900/60 to-stone-900/90 p-8 sm:p-10 backdrop-blur-xl overflow-hidden shadow-2xl"
        >
          {/* Accent glow corner */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #4E9A68 0%, #E58A13 50%, transparent 80%)',
            }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] items-center gap-8 xl:gap-12">
            {/* Left Content */}
            <div className="flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>POPULAR CHOICE • SAVE 15%</span>
              </div>

              <h3
                className="text-3xl sm:text-5xl font-normal uppercase tracking-tight text-white leading-tight"
                style={{ fontFamily: "'Anton', sans-serif" }}
              >
                THE DISCOVERY VARIETY PACK
              </h3>

              <p className="mt-3 text-sm sm:text-base text-white/70 leading-relaxed max-w-xl">
                Can&apos;t pick just one? Taste the entire TerraViva organic collection. Includes 3 cans of each signature flavor delivered chilled in an eco-insulated box.
              </p>

              {/* Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5 text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>3× Mango, 3× Guava, 3× Delum, 3× Passion</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>100% Free Carbon-Neutral Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Zero Added Sugar & No Preservatives</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>30-Day Fresh Taste Guarantee</span>
                </div>
              </div>

              {/* Price & CTA Button */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-3xl sm:text-4xl font-normal text-white"
                    style={{ fontFamily: "'Anton', sans-serif" }}
                  >
                    $34.00
                  </span>
                  <span className="text-sm text-white/40 line-through font-mono">$40.00</span>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                    (12 Cans)
                  </span>
                </div>

                <button
                  type="button"
                  className="py-3.5 px-8 rounded-full bg-white hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 shadow-lg shadow-white/10 hover:shadow-emerald-400/20 hover:scale-105 cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>Order Variety Box</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Visual: Fanned Out Lineup of 4 Cans with Parallax Float */}
            <motion.div
              style={{ y: cansParallaxY }}
              className="relative flex items-center justify-center pt-4 lg:pt-0"
            >
              <div className="flex items-center justify-center -space-x-8 sm:-space-x-12">
                {IMAGES.map((can, idx) => (
                  <motion.div
                    key={can.name}
                    whileHover={{ scale: 1.15, y: -12, zIndex: 40 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    className="relative w-28 sm:w-36 lg:w-40 aspect-[0.45/1] cursor-pointer"
                    style={{
                      zIndex: idx === 1 || idx === 2 ? 20 : 10,
                      transform:
                        idx === 0
                          ? 'rotate(-6deg)'
                          : idx === 1
                          ? 'rotate(-2deg)'
                          : idx === 2
                          ? 'rotate(2deg)'
                          : 'rotate(6deg)',
                    }}
                  >
                    <img
                      src={can.src}
                      alt={can.name}
                      className="w-full h-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
                      draggable={false}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default TerraVivaCollection;
