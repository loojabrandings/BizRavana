'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ShieldCheck,
  Snowflake,
  Apple,
  Droplets,
  Sparkles,
  Ban,
  Leaf,
  Recycle,
} from 'lucide-react';

const LEFT_FEATURES = [
  {
    icon: ShieldCheck,
    title: '100% Certified Organic',
    desc: 'Sustainably farmed with zero synthetic pesticides, herbicides, or GMOs.',
  },
  {
    icon: Snowflake,
    title: 'Raw Cold-Pressed',
    desc: 'Hydraulic cold extraction protects delicate living enzymes and fresh taste.',
  },
  {
    icon: Apple,
    title: 'Never From Concentrate',
    desc: 'Crafted exclusively from whole, orchard-harvested real fruit in every drop.',
  },
  {
    icon: Droplets,
    title: 'Zero Added Sugars',
    desc: 'Naturally sweet and refreshing, powered solely by sun-ripened fruit.',
  },
];

const RIGHT_FEATURES = [
  {
    icon: Sparkles,
    title: 'Rich In Micro-Nutrients',
    desc: 'Packed with natural Vitamin C, bio-available polyphenols, and minerals.',
  },
  {
    icon: Ban,
    title: 'No Artificial Additives',
    desc: 'Zero preservatives, artificial coloring, chemical stabilizers, or gums.',
  },
  {
    icon: Leaf,
    title: 'Vegan & Gluten-Free',
    desc: 'Pure unadulterated plant-based fuel designed for clean, vibrant energy.',
  },
  {
    icon: Recycle,
    title: 'Infinitely Recyclable',
    desc: 'Eco-conscious aluminum packaging with BPA-free protective inner lining.',
  },
];

export function TerraVivaFeatures() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Strong Parallax values
  const canParallaxY = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.9]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 0.9, 0.5]);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative w-full bg-black text-white pt-12 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-8 lg:px-12 overflow-hidden select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* 1. Center Accent Ambient Glow (Parallax Scaled) */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 'clamp(320px, 55vw, 750px)',
          height: 'clamp(320px, 55vw, 750px)',
          background: 'radial-gradient(circle, rgba(78,154,104,0.4) 0%, rgba(78,154,104,0.1) 45%, transparent 70%)',
          filter: 'blur(50px)',
          scale: glowScale,
          opacity: glowOpacity,
          zIndex: 1,
        }}
      />

      {/* 2. Top Section Header (Scroll Animated) */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-4xl mx-auto text-center mb-10 sm:mb-14"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-3.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
            NATURE’S FINEST CRAFT
          </span>
        </div>

        <h2
          className="text-4xl sm:text-6xl font-normal uppercase tracking-tight text-white leading-[1.05]"
          style={{ fontFamily: "'Anton', sans-serif" }}
        >
          PURE ESSENCE. ZERO COMPROMISE.
        </h2>

        <p className="mt-3.5 text-sm sm:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
          Every can of TerraViva is a masterclass in organic botanical purity, crafted with respect for nature and your well-being.
        </p>
      </motion.div>

      {/* 3. Main 8 Features + Fixed Center Can Grid */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Desktop Layout: 4 Left Features | Center Parallax Showcase | 4 Right Features */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_280px_1fr] xl:grid-cols-[1fr_320px_1fr] items-center gap-8 xl:gap-12">
          {/* Left Column: 4 Features (Staggered Left Reveal) */}
          <div className="flex flex-col gap-5 xl:gap-6">
            {LEFT_FEATURES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex items-start gap-3.5 xl:gap-4 text-right justify-end group cursor-pointer"
                >
                  <div className="flex-1">
                    <h3 className="text-sm xl:text-base font-bold text-white tracking-wide mb-0.5 transition-colors group-hover:text-emerald-400">
                      {item.title}
                    </h3>
                    <p className="text-xs xl:text-xs text-white/55 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 bg-white/[0.04] backdrop-blur-sm shadow-[0_0_20px_-5px_rgba(78,154,104,0.3)] transition-transform duration-300 group-hover:scale-110 group-hover:border-emerald-500/40">
                    <Icon className="w-4 h-4 xl:w-5 xl:h-5 text-emerald-400" strokeWidth={2} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Center Column: Parallax Floating Pink Guava Can */}
          <div className="relative flex items-center justify-center h-[420px] xl:h-[460px]">
            <motion.div
              style={{
                y: canParallaxY,
              }}
              className="relative flex items-center justify-center"
            >
              <div
                className="relative aspect-[0.45/1] flex items-center justify-center"
                style={{
                  width: '220px',
                  transform: 'translate(0px, 210px) scale(1.75)',
                }}
              >
                <img
                  src="/demos/drink/guava.webp"
                  alt="TerraViva Pink Guava Cold-Pressed"
                  className="w-full h-full object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] animate-subtle-float"
                  draggable={false}
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column: 4 Features (Staggered Right Reveal) */}
          <div className="flex flex-col gap-5 xl:gap-6">
            {RIGHT_FEATURES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex items-start gap-3.5 xl:gap-4 text-left justify-start group cursor-pointer"
                >
                  <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 bg-white/[0.04] backdrop-blur-sm shadow-[0_0_20px_-5px_rgba(78,154,104,0.3)] transition-transform duration-300 group-hover:scale-110 group-hover:border-emerald-500/40">
                    <Icon className="w-4 h-4 xl:w-5 xl:h-5 text-emerald-400" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm xl:text-base font-bold text-white tracking-wide mb-0.5 transition-colors group-hover:text-emerald-400">
                      {item.title}
                    </h3>
                    <p className="text-xs xl:text-xs text-white/55 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Tablet & Mobile Layout: Staggered feature cards */}
        <div className="flex flex-col items-center gap-6 sm:gap-8 lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl">
            {[...LEFT_FEATURES, ...RIGHT_FEATURES].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: (idx % 4) * 0.08 }}
                  className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 bg-white/[0.05] shadow-[0_0_15px_-3px_rgba(78,154,104,0.25)]">
                    <Icon className="w-5 h-5 text-emerald-400" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white tracking-wide mb-0.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TerraVivaFeatures;
