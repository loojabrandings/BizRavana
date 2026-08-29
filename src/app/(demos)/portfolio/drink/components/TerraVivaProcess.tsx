'use client';

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Sprout,
  Snowflake,
  Sparkles,
  Recycle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: Sprout,
    tag: 'Hand-Selected',
    title: 'SUSTAINABLE HARVEST',
    desc: 'Whole fruits hand-picked at peak sun-ripeness from certified organic, rainfed groves with zero synthetic pesticides or chemicals.',
    highlight: 'Pressed Within 4 Hours of Picking',
    color: '#4E9A68',
  },
  {
    step: '02',
    icon: Snowflake,
    tag: 'Zero Thermal Heat',
    title: 'GENTLE COLD-EXTRACTION',
    desc: 'Slow hydraulic cold-extraction crushes fruit under immense pressure without generating friction heat that destroys vitamins.',
    highlight: 'Preserves 100% Raw Active Enzymes',
    color: '#29B6F6',
  },
  {
    step: '03',
    icon: Sparkles,
    tag: 'Clean Formulation',
    title: 'BOTANICAL INFUSION',
    desc: 'Naturally balanced with wild botanical essences and mountain spring water. Pure fruit integrity with zero artificial chemicals or gums.',
    highlight: 'Zero Added Sugars & Clean Label',
    color: '#E58A13',
  },
  {
    step: '04',
    icon: Recycle,
    tag: 'Locked Freshness',
    title: 'ECO-SHIELD CANNING',
    desc: 'Nitrogen-dosed and sealed in infinitely recyclable lightweight aluminum with BPA-free protective liner to preserve garden freshness.',
    highlight: '100% Infinitely Recyclable Aluminum',
    color: '#BE2B45',
  },
];

export function TerraVivaProcess() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const ambientGlowY = useTransform(scrollYProgress, [0, 1], [-90, 90]);
  const oddCardY = useTransform(scrollYProgress, [0, 1], [-25, 25]);
  const evenCardY = useTransform(scrollYProgress, [0, 1], [25, -25]);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative w-full bg-stone-950 text-white py-24 sm:py-32 px-4 sm:px-8 lg:px-12 overflow-hidden select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background Ambience Glow with Parallax */}
      <motion.div
        style={{ y: ambientGlowY }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none"
      >
        <div
          style={{
            width: 'clamp(400px, 70vw, 1000px)',
            height: '450px',
            background: 'radial-gradient(ellipse at center, rgba(78,154,104,0.14) 0%, rgba(41,182,246,0.08) 50%, transparent 80%)',
            filter: 'blur(70px)',
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* 1. Header (Animated on Scroll) */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-3.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
              THE FARM-TO-CAN JOURNEY
            </span>
          </div>

          <h2
            className="text-4xl sm:text-6xl font-normal uppercase tracking-tight text-white leading-[1.05]"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            HOW TERRAVIVA IS CRAFTED
          </h2>

          <p className="mt-4 text-sm sm:text-base text-white/60 leading-relaxed">
            From organic soil to your hands in four gentle, uncompromised steps. We never boil, concentrate, or adulterate our fruit.
          </p>
        </motion.div>

        {/* 2. 4-Step Process Timeline Cards (Connected Grid with Strong Parallax) */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-7">
          {/* Animated Connecting Line (Desktop) */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ originX: 0 }}
            className="hidden lg:block absolute top-[52px] left-[12%] right-[12%] h-[1px] bg-gradient-to-r from-emerald-500/40 via-sky-500/40 to-rose-500/40 pointer-events-none z-0"
          />

          {STEPS.map((item, index) => {
            const Icon = item.icon;
            const isHovered = activeStep === index;
            const cardY = index % 2 === 0 ? evenCardY : oddCardY;

            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ y: cardY }}
                onMouseEnter={() => setActiveStep(index)}
                className={`group relative z-10 flex flex-col justify-between rounded-3xl border transition-all duration-300 p-6 sm:p-7 backdrop-blur-xl overflow-hidden cursor-pointer ${
                  isHovered
                    ? 'border-white/25 bg-white/[0.05] shadow-2xl'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                {/* Step Ambient Glow */}
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none blur-2xl transition-opacity duration-500"
                  style={{
                    backgroundColor: item.color,
                    opacity: isHovered ? 0.35 : 0.1,
                  }}
                />

                {/* Top Row: Step Number & Icon */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      borderColor: `${item.color}50`,
                      backgroundColor: `${item.color}15`,
                      color: item.color,
                    }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2.2} />
                  </div>

                  <span
                    className="text-3xl font-normal text-white/25 group-hover:text-white/60 transition-colors font-mono"
                    style={{ fontFamily: "'Anton', sans-serif" }}
                  >
                    {item.step}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
                      style={{
                        borderColor: `${item.color}40`,
                        backgroundColor: `${item.color}10`,
                        color: item.color,
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <h3
                    className="text-xl xl:text-2xl font-normal uppercase text-white tracking-wide leading-tight group-hover:text-white transition-colors"
                    style={{ fontFamily: "'Anton', sans-serif" }}
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed mt-3">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Highlight Key Point */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] font-medium text-white/80">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: item.color }} />
                  <span>{item.highlight}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 3. Bottom Assurance Callout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 sm:mt-16 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-4 px-8 rounded-2xl bg-white/[0.02] border border-white/10 text-xs sm:text-sm text-white/70">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Zero Boiling / Pasteurized Heat</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>100% Living Botanical Enzymes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Direct Cold-Chain Freshness</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default TerraVivaProcess;
