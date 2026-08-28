'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Check,
  X,
  ShieldCheck,
  Sparkles,
  Droplets,
  Leaf,
  Recycle,
  HeartHandshake,
} from 'lucide-react';

const COMPARISON_ROWS = [
  {
    metric: 'Added Sugars',
    terra: {
      value: '0g Added Sugar',
      desc: '100% natural sweetness powered exclusively by sun-ripened whole fruit.',
      status: true,
    },
    conventional: {
      value: '32g – 45g Sugar / High-Fructose Syrup',
      desc: 'Artificially sweetened, leading to sharp insulin spikes and midday fatigue.',
      status: false,
    },
  },
  {
    metric: 'Extraction & Processing',
    terra: {
      value: 'Raw Hydraulic Cold-Pressed',
      desc: 'Gentle zero-heat extraction preserving authentic botanical cellular structure.',
      status: true,
    },
    conventional: {
      value: 'Heated & Thermal Pasteurized',
      desc: 'Boiled at high temperatures to extend shelf life, destroying fresh flavor.',
      status: false,
    },
  },
  {
    metric: 'Living Enzymes & Vitamins',
    terra: {
      value: '100% Bio-Active & Intact',
      desc: 'Living antioxidants, active Vitamin C, and raw micronutrients fully preserved.',
      status: true,
    },
    conventional: {
      value: 'Destroyed by Heat Processing',
      desc: 'Micro-nutrients lost during boiling; artificial vitamins added back in later.',
      status: false,
    },
  },
  {
    metric: 'Packaging & Planet',
    terra: {
      value: '100% Infinitely Recyclable Aluminum',
      desc: 'Eco-conscious lightweight aluminum cans with BPA-free protective inner lining.',
      status: true,
    },
    conventional: {
      value: 'Single-Use Plastic Bottles',
      desc: 'Leaches microplastics under sunlight and takes over 450 years to decompose.',
      status: false,
    },
  },
  {
    metric: 'Preservatives & Additives',
    terra: {
      value: 'Zero Chemicals, Dyes, or Gums',
      desc: 'No potassium sorbate, no artificial colorings, and no thickening agents.',
      status: true,
    },
    conventional: {
      value: 'Chemical Stabilizers & Artificial Dyes',
      desc: 'Loaded with sodium benzoate, synthetic flavor enhancers, and stabilizers.',
      status: false,
    },
  },
  {
    metric: 'Fruit Origin & Source',
    terra: {
      value: '100% Single-Origin Orchard Fruit',
      desc: 'Harvested ripe from certified organic groves and pressed within hours.',
      status: true,
    },
    conventional: {
      value: 'Diluted from Stored Concentrate',
      desc: 'Dehydrated into syrup and re-diluted with municipal tap water.',
      status: false,
    },
  },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Certified Organic', desc: 'Zero GMOs or synthetics' },
  { icon: Droplets, label: 'Raw Cold-Pressed', desc: 'No heat degradation' },
  { icon: Recycle, label: 'Eco Aluminum', desc: '100% Infinitely recyclable' },
  { icon: HeartHandshake, label: 'Taste Guarantee', desc: '30-Day freshness pledge' },
];

export function TerraVivaComparison() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const ambientGlowY = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.15, 0.9]);

  return (
    <section
      ref={sectionRef}
      id="comparison"
      className="relative w-full bg-black text-white py-24 sm:py-32 px-4 sm:px-8 lg:px-12 overflow-hidden select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Center Ambient Glow with Parallax */}
      <motion.div
        style={{
          y: ambientGlowY,
          scale: glowScale,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <div
          style={{
            width: 'clamp(380px, 60vw, 900px)',
            height: 'clamp(380px, 60vw, 900px)',
            background: 'radial-gradient(circle, rgba(78,154,104,0.22) 0%, rgba(229,138,19,0.08) 45%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* 1. Header (Animated on Scroll) */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
              THE CLEAN JUICE STANDARD
            </span>
          </div>

          <h2
            className="text-4xl sm:text-6xl font-normal uppercase tracking-tight text-white leading-[1.05]"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            SEE THE DIFFERENCE. FEEL THE PURITY.
          </h2>

          <p className="mt-4 text-sm sm:text-base text-white/60 leading-relaxed">
            Most commercial juices sacrifice nutrition for shelf life. Here is how TerraViva redefines what real fruit beverage should be.
          </p>
        </motion.div>

        {/* 2. Comparison Table / Cards Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-white/15 bg-stone-950/70 backdrop-blur-2xl overflow-hidden shadow-2xl"
        >
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-white/10">
            {/* Column 1 Header: TerraViva */}
            <div className="p-6 sm:p-8 bg-gradient-to-b from-emerald-950/40 via-emerald-950/15 to-transparent border-b md:border-b-0 md:border-r border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    THE GOLD STANDARD
                  </span>
                  <h3
                    className="text-2xl sm:text-3xl font-normal uppercase text-white leading-none tracking-tight"
                    style={{ fontFamily: "'Anton', sans-serif" }}
                  >
                    TERRAVIVA ORGANIC
                  </h3>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-extrabold uppercase tracking-wider shadow-md shadow-emerald-500/20">
                100% PURE
              </span>
            </div>

            {/* Column 2 Header: Conventional */}
            <div className="p-6 sm:p-8 bg-white/[0.01] flex items-center justify-between opacity-80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400">
                  <X className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    MASS-MARKET ALTERNATIVES
                  </span>
                  <h3
                    className="text-2xl sm:text-3xl font-normal uppercase text-white/75 leading-none tracking-tight"
                    style={{ fontFamily: "'Anton', sans-serif" }}
                  >
                    CONVENTIONAL JUICES
                  </h3>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-white/10 text-white/50 text-[10px] font-bold uppercase tracking-wider">
                COMMERCIAL
              </span>
            </div>
          </div>

          {/* Table Comparison Rows (Staggered Row Animation) */}
          <div className="divide-y divide-white/10">
            {COMPARISON_ROWS.map((row, idx) => (
              <motion.div
                key={row.metric}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -15 : 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="grid grid-cols-1 md:grid-cols-2 hover:bg-white/[0.015] transition-colors"
              >
                {/* TerraViva Cell (Left) */}
                <div className="p-6 sm:p-7 md:border-r border-white/10 flex items-start gap-4 bg-emerald-500/[0.015]">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5 shadow-sm shadow-emerald-500/20">
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/80 mb-0.5 block">
                      {row.metric}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white tracking-wide">
                      {row.terra.value}
                    </h4>
                    <p className="text-xs sm:text-sm text-white/60 mt-1 leading-relaxed">
                      {row.terra.desc}
                    </p>
                  </div>
                </div>

                {/* Conventional Cell (Right) */}
                <div className="p-6 sm:p-7 flex items-start gap-4 bg-white/[0.005]">
                  <div className="w-7 h-7 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0 mt-0.5">
                    <X className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-0.5 block">
                      {row.metric}
                    </span>
                    <h4 className="text-base sm:text-lg font-semibold text-white/70 tracking-wide">
                      {row.conventional.value}
                    </h4>
                    <p className="text-xs sm:text-sm text-white/45 mt-1 leading-relaxed">
                      {row.conventional.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 3. Bottom High-Trust Assurance Strip (Staggered Spring Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 sm:mt-16">
          {TRUST_BADGES.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md cursor-pointer hover:border-emerald-500/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    {badge.label}
                  </h4>
                  <p className="text-[11px] text-white/50 leading-tight mt-0.5">
                    {badge.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TerraVivaComparison;
